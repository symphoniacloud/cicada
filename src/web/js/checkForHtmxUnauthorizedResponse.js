document.getElementById('toplevel').addEventListener('htmx:responseError', (evt) => {
  if (evt?.detail?.xhr?.status === 403) {
    console.log('Unauthorized')
    window.location.assign('/github/auth/logout')
  }
  console.log(evt)
})
