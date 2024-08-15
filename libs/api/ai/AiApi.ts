import {AbstractApi} from "~/libs/api/AbstractApi";
import {Ref} from "vue";
import {useServer} from "~/composables/useServer";
import {Mutex} from "async-mutex";

export class AiApi extends AbstractApi {
    private _contextId: Ref<number | null> = ref(null);
    private _messages: Ref<Array<any>> = ref(new Array<any>());
    private _lastMessageIndex: Ref<number> = ref(0);

    private _messageMutex = new Mutex();

    async init(): Promise<void | boolean> {
        return true;
    }

    public getContextId(): Ref<number | null> {
        return this._contextId;
    }

    public getMessages(): Ref<Array<any>> {
        return this._messages;
    }

    public async internalUpdate(body: any) : Promise<void> {
        if (body.contextId !== this._contextId.value)
            return

        const release = await this._messageMutex.acquire();

        try {
            let template = this._messages.value.find((m) => m.status === 0);

            const newMessage = this.pushTemplateMessage();

            if (!template)
                template = newMessage;

            template.fromBot = body.role === "assistant";
            template.status = 1;
            template.message = body.newMessage;
        }finally {
            release();
        }
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

        let release = await this._messageMutex.acquire();

        let newMessageId;

        try {
            this._messages.value.push({
                id: this._lastMessageIndex.value,
                fromBot: false,
                status: 0
            })

            newMessageId = this._lastMessageIndex.value;

            this._lastMessageIndex.value++;
        }finally {
            release();
        }

        const { data, error } = await useApi<any>("/user/ai/attachFile", opts);

        if (error.value !== null)
            return false;

        const fileUrl = useServer.getUrl() + "files/download?fileId=" + fileId;

        release = await this._messageMutex.acquire();

        try {
            let m = this._messages.value.find((m) => m.id === newMessageId);

            m.message = renderAsImage ? "![attachment](" + fileUrl + ")" : "";
            m.isImage = renderAsImage;
            m.name = name;
            m.attachment = true;
            m.status = 1;
        }finally {
            release();
        }

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

        let release = await this._messageMutex.acquire();

        try {
            this._messages.value.push({
                id: this._lastMessageIndex.value,
                fromBot: false,
                status: 1,
                message: message
            })
            this._lastMessageIndex.value++;
        }finally {
            release();
        }

        const apiPromise = useApi<any>("/user/ai/ask", opts);

        const { data, error } = await this.executeWithTimeout(apiPromise, 1500, async () => {
            release = await this._messageMutex.acquire();
            try {
                this.pushTemplateMessage();
            }finally {
                release();
            }
        }, this).catch(console.error);

        release = await this._messageMutex.acquire();

        try {
            let m = this._messages.value.find((m) => m.status === 0);

            if (!m)
                m = this.pushTemplateMessage();

            if (error.value !== null) {
                m.status = -1;
                m.message = "Server error";

                return false;
            }

            m.message = data.value.answer;
            m.status = 1;
        }finally {
            release();
        }

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

    public async newContext(lang): Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                additionalSystemMessage: "When responding, use markdown and, if necessary, format the data into tables, the client will be glad to see it. User language: " + lang
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