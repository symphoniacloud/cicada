if (
  !(
    document.cookie
      .split('; ')
      .find((part) => part.startsWith('loggedIn='))
      ?.split('=')[1] === 'true'
  )
)
  location.assign('/')
