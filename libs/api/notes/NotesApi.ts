import {Ref} from "vue";
import {AbstractApi} from "~/libs/api/AbstractApi";

export class NotesApi extends AbstractApi {
    async init(): Promise<void | boolean> {

    }

    public async newNote(text: string, notificationTime: Date | null): Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                text: text
            }
        };

        if (notificationTime)
            opts.params.notificationTime = notificationTime.toISOString();

        const {error} = await useApi("/user/notes/new", opts);

        return error.value === null;
    }

    public async editNote(noteId: number, text: string): Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                noteId: noteId,
                text: text
            }
        };

        const {error} = await useApi("/user/notes/edit", opts);

        return error.value === null;
    }

    public async editNotificationTime(noteId: number, notificationTime: Date | null): Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                noteId: noteId
            }
        };

        if (notificationTime)
            opts.params.notificationTime = notificationTime.toISOString();

        const {error} = await useApi("/user/notes/editTime", opts);

        return error.value === null;
    }

    public async getNote(noteId: number): Promise<any> {
        const opts = {
            method: "GET",
            params: {
                noteId: noteId
            }
        };

        const {data, error} = await useApi("/user/notes/editTime", opts);

        if (error.value !== null) {
            return false;
        }

        return data.value;
    }

    public async getNotes(): Promise<any> {
        const opts = {
            method: "GET",
            params: {}
        };

        const {data, error} = await useApi("/user/notes/getList", opts);

        if (error.value !== null) {
            return false;
        }

        return data.value?.notes;
    }

    public async getImportantNotes(): Promise<any> {
        const opts = {
            method: "GET",
            params: {}
        };

        const {data, error} = await useApi("/user/notes/getImportant", opts);

        if (error.value !== null) {
            return false;
        }

        return data.value?.notes;
    }

    public async deleteNote(noteId: number): Promise<boolean> {
        const opts = {
            method: "POST",
            params: {
                noteId: noteId
            }
        };

        const {error} = await useApi("/user/notes/delete", opts);

        return error.value === null;
    }
}