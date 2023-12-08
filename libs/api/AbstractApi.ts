export abstract class AbstractApi {
    abstract init(): Promise<void | boolean>;
}