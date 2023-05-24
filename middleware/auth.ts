import {navigateTo} from "#app";

export default defineNuxtRouteMiddleware((to, from) => {
    const {$serverConfigs, $auth} = useNuxtApp();

    const serverAvailable = $serverConfigs.serverAvailable;

    if (!serverAvailable)
        return navigateTo("/serverNotAvailable");

    const state = $auth.state();

    if (!state.authed)
        return navigateTo("/login");
})