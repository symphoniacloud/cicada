document.getElementById('toplevel').addEventListener('htmx:responseError', (evt) => {
  if (evt?.detail?.xhr?.status === 403) {
    console.log('Unauthorized')
    location.assign('/github/auth/logout')
  }
  console.log(evt)
})
