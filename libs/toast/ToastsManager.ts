import {Toast} from "~/libs/toast/Toast";
import {integer} from "vscode-languageserver-types";
import {Ref} from "vue";

export class ToastsManager {
    private _toasts: Ref<Array<Toast>> = ref(new Array<Toast>());
    private timeouts: Map<Toast, any> = new Map<Toast, any>();

    public getToasts(): Ref<Array<Toast>> {
        return this._toasts;
    }

    public pushToast(text: string, lifetime: integer = 2500, type: string = "info", canHide: boolean = false) {
        const newToast = new Toast(text, lifetime, type, canHide);

        this._toasts.value.push(newToast);
        this.timeouts.set(newToast,
            setTimeout(() => this.removeToast(newToast), lifetime)
        );
    }

    public removeToast(toast: Toast) {
        this._toasts.value = this._toasts.value.filter((t) => {
            return toRaw(t) !== toast;
        });

        if (this.timeouts.has(toast)) {
            clearTimeout(
                this.timeouts.get(toast)
            );

            this.timeouts.delete(toast);
        }
    }
}