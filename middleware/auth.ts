import {navigateTo} from "#app";

export default defineNuxtRouteMiddleware((to, from) => {
    const {$serverConfigs, $auth} = useNuxtApp();

    const serverAvailable = $serverConfigs ? $serverConfigs.serverAvailable : false;

    if (!serverAvailable)
        return navigateTo("/serverNotAvailable");

    const state = $auth.state();

    if (!state.authed.value)
        return navigateTo("/login");
})