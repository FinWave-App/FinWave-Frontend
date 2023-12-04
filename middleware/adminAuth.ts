import {navigateTo} from "#app";

export default defineNuxtRouteMiddleware((to, from) => {
    const {$adminApi} = useNuxtApp();

    if (!$adminApi.getAllowed().value)
        return navigateTo("/");
})