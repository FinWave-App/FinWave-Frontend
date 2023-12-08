self.addEventListener('push', (event) => {
    const data = event.data.json();
    let args = data.options.args;

    if (!args) {
        args = {
            'icon': "/icon.png",
            'badge': "/favicon.ico",
            'url': "/"
        };
    }

    event.waitUntil(self.registration.showNotification(data.text, args));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const data = event.notification.data;
    event.waitUntil(clients.matchAll({
        type: 'window',
    }).then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (client.url == '/' && 'focus' in client) {
                return client.focus();
            }
        }
        if (clients.openWindow) {
            return clients.openWindow(data.url);
        }
    }));
});

self.addEventListener('installed', (event) => {
    if (!event.isUpdate) {
        console.debug('The PWA is on the latest version.')
        return
    }

    console.debug('There is an update for the PWA, reloading...')
    window.location.reload()
})