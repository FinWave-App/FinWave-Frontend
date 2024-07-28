import {navigateTo} from "#app";

export default defineNuxtRouteMiddleware((to, from) => {
    const {$serverConfigs} = useNuxtApp();

    const serverAvailable = $serverConfigs ? $serverConfigs.serverAvailable : false;

    if (!serverAvailable)
        return navigateTo("/serverNotAvailable");
})