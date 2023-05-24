import {integer} from "vscode-languageserver-types";

export class Toast {
    readonly text: string;
    readonly type: string;
    readonly lifetime: integer;
    readonly canHide: boolean;

    constructor(text: string, lifetime: integer, type: string, canHide: boolean) {
        this.text = text;
        this.lifetime = lifetime;
        this.type = type;
        this.canHide = canHide;
    }
}