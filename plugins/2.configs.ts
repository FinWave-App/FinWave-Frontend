import {ConfigManager} from "~/libs/config/ConfigManager";

export default defineNuxtPlugin(async nuxtApp => {
    const serverConfigs = new ConfigManager();

    await serverConfigs.init();

    return {
        provide: {serverConfigs}
    }
})