import {useStorage} from "@vueuse/core";

export const useServer = new class FinWaveServer {
    public getUrl() : string {
        const configValue = this.getConfigUrl();

        if (this.allowCustomUrl())
            return useStorage("server_url", configValue).value;

        return configValue;
    }

    public getWebSocketUrl() : string {
        return this.getUrl()
            .replace("https://", "wss://")
            .replace("http://", "ws://");
    }

    public allowCustomUrl() : boolean {
        return useRuntimeConfig().public.allowCustomApiURL;
    }

    public getConfigUrl() : string {
        return useRuntimeConfig().public.apiURL;
    }

    public setUrl(url : string) : void {
        if (this.allowCustomUrl())
            useStorage("server_url", "").value = url;
    }
}