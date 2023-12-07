self.addEventListener('push', (event) => {
    const handler = async () => {
        let options = json.options.args;

        if (!options) {
            options = {
                'icon': "/icon.png",
                'badge': "/favicon.ico",
                'url': "/"
            };
        }

        await self.registration.showNotification(json.text, options);
    }

    const json = event.data.json();
    if (!json.validate)
        event.waitUntil(handler());
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