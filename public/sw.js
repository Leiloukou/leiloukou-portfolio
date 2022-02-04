console.log('Service worker loaded!')

self.addEventListener('push', e => {
      const data = e.data.json()

      self.registration.showNotification(data.title, {
            body: 'Want to come look at my website again?',
            icon: 'https://raw.githubusercontent.com/Leiloukou/Leiloukou/3d20717af9cb0962d8e60c008dbbc6caee6a7462/favicon.svg'
      })
})