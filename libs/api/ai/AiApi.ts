import {AbstractApi} from "~/libs/api/AbstractApi";
import {Ref} from "vue";
import {useServer} from "~/composables/useServer";

export class AiApi extends AbstractApi {
    private _contextId: Ref<number | null> = ref(null);
    private _messages: Ref<Array<any>> = ref(new Array<any>());
    private _lastMessageIndex: Ref<number> = ref(0);

    async init(): Promise<void | boolean> {
        return true;
    }

    public getContextId(): Ref<number | null> {
        return this._contextId;
    }

    public getMessages(): Ref<Array<any>> {
        return this._messages;
    }

    protected executeWithTimeout<T>(promise: Promise<T>, timeout: number, onTimeout: () => void, context: any): Promise<T> {
        let timeoutHandle: NodeJS.Timeout;

        const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutHandle = setTimeout(() => {
                onTimeout.apply(context)
            }, timeout);
        });

        return Promise.race([promise, timeoutPromise])
            .then((result: T | never) => {
                clearTimeout(timeoutHandle);
                return result as T;
            });
    }

    public async attachFile(fileId: string, renderAsImage: boolean = true, name: string): Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                contextId: this._contextId.value,
                fileId: fileId,
            }
        };

        this._messages.value.push({
            id: this._lastMessageIndex.value,
            fromBot: false,
            status: 0
        })

        const newMessageId = this._lastMessageIndex.value;

        this._lastMessageIndex.value++;

        const { data, error } = await useApi<any>("/user/ai/attachFile", opts);

        if (error.value !== null)
            return false;

        const fileUrl = useServer.getUrl() + "files/download?fileId=" + fileId;

        let m = this._messages.value.find((m) => m.id === newMessageId);

        m.message = renderAsImage ? "![attachment](" + fileUrl + ")" : "";
        m.isImage = renderAsImage;
        m.name = name;
        m.attachment = true;
        m.status = 1;

        return true;
    }

    public async ask(message: string): Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                message: message,
                contextId: this._contextId.value
            }
        };

        this._messages.value.push({
            id: this._lastMessageIndex.value,
            fromBot: false,
            status: 1,
            message: message
        })
        this._lastMessageIndex.value++;

        const apiPromise = useApi<any>("/user/ai/ask", opts);

        const { data, error } = await this.executeWithTimeout(apiPromise, 1000, this.pushTemplateMessage, this)
            .catch(console.error);

        let m = this._messages.value.find((m) => m.id === this._lastMessageIndex.value - 1);

        if (m.status !== 0)
            m = this.pushTemplateMessage();

        if (error.value !== null) {
            m.status = -1;
            m.message = "Server error";

            return false;
        }

        m.message = data.value.answer;
        m.status = 1;

        return true;
    }

    protected pushTemplateMessage() : any {
        const message = {
            id: this._lastMessageIndex.value,
            fromBot: true,
            status: 0,
            message: ""
        };

        this._messages.value.push(message);
        this._lastMessageIndex.value++;

        return message;
    }

    public async newContext(): Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                additionalSystemMessage: "When responding, use markdown and, if necessary, format the data into tables, the client will be glad to see it"
            }
        };

        const {data, error} = await useApi<any>("/user/ai/newContext", opts);

        if (error.value !== null) {
            return false;
        }

        this._messages.value = [];
        this._lastMessageIndex.value = 0;

        this._contextId.value = data.value.contextId;

        return true;
    }
}