export default defineNuxtPlugin(async nuxtApp => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log("SW registered")
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    }else {
        console.log("SW not available")
    }
})