window.self.addEventListener('push', (event) => {
    const options = {
      body: event.data.text(),
    };
    event.waitUntil(
      window.self.registration.showNotification('New Message', options)
    );
  });
  