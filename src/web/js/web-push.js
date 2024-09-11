/* eslint-disable no-undef */
// noinspection JSFileReferences

import { VAPID_PUBLIC_KEY } from '/js/config.js'

const serviceWorkerScript = './js/service-worker.js'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function subscribeToPush() {
  if ((await Notification.requestPermission()) === 'denied') {
    console.log('The user explicitly denied the permission request.')
    updateStatus('Notification permission denied - aborting')
    return
  }

  updateStatus('Attempting to subscribe for notifications')
  const registration = await navigator.serviceWorker.getRegistration(serviceWorkerScript)
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY)
  })
  console.log(JSON.stringify(subscription))
  await postToServer('webPushSubscribe', subscription)
  await updateUI()
  updateStatus('Subscribed for push notifications ✅')
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function unsubscribeFromPush() {
  updateStatus('Attempting to unsubscribe from push notifications')
  const registration = await navigator.serviceWorker.getRegistration(serviceWorkerScript)
  const subscription = await registration.pushManager.getSubscription()
  await postToServer('webPushUnsubscribe', { endpoint: subscription.endpoint })
  await subscription.unsubscribe()
  await updateUI()
  updateStatus('Unsubscribed from push notifications')
}

async function testPing() {
  const response = await postToServer('ping', {})
  updateStatus(response.message)
}

async function updateUI() {
  if (!('serviceWorker' in navigator)) {
    updateStatus('Web Push not supported by this browser - no service worker')
    return
  }
  if (!('PushManager' in window)) {
    updateStatus(
      'Web Push not supported by this browser. If using an iOS device then use Cicada as a PWA by adding a shortcut to your home screen, and open from there.'
    )
    return
  }
  const serviceWorkerRegistration = await getOrRegisterServiceWorker()
  if (!serviceWorkerRegistration) {
    updateStatus('Service Worker registration failure - unable to continue')
    return
  }
  console.log(`Got service worker with scope ${serviceWorkerRegistration.scope}`)
  const updateServiceWorkerButton = document.getElementById('updateServiceWorker')
  updateServiceWorkerButton.disabled = false
  updateServiceWorkerButton.onclick = () => {
    console.log('Updated service worker code')
    serviceWorkerRegistration.update()
  }

  const pushSubscription = await serviceWorkerRegistration.pushManager.getSubscription()
  if (pushSubscription) {
    console.log(`Push Subscription Endpoint = ${pushSubscription.endpoint}`)
    updateSubscribeToggle(true, unsubscribeFromPush)
  } else {
    updateSubscribeToggle(false, subscribeToPush)
  }

  document.getElementById('pingButton').onclick = testPing
  updateStatus('')
}

function updateStatus(s) {
  const status = document.getElementById('status')
  status.textContent = s
}

function updateSubscribeToggle(checked, onclick) {
  const toggle = document.getElementById('subscribeToggle')
  toggle.removeAttribute('disabled')
  toggle.disabled = false
  toggle.onclick = onclick
  if (checked) {
    toggle.setAttribute('checked', checked)
  } else {
    toggle.removeAttribute('checked')
  }
}

async function getOrRegisterServiceWorker() {
  const existingRegistration = await navigator.serviceWorker.getRegistration(serviceWorkerScript)
  if (existingRegistration) return existingRegistration

  try {
    return await navigator.serviceWorker.register(serviceWorkerScript)
  } catch (e) {
    console.error('An error occurred while registering the service worker.')
    console.error(e)
    return null
  }
}

// Convert a base64 string to Uint8Array.
// Must do this so the server can understand the VAPID_PUBLIC_KEY.
const urlB64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  // noinspection RegExpRedundantEscape
  // eslint-disable-next-line
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

async function postToServer(urlSuffix, data) {
  const response = await fetch(`/apia/${urlSuffix}`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(data)
  })
  return response.json()
}

window.onload = updateUI
