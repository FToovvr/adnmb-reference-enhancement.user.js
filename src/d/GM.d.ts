export { };

declare global {
    function GM_registerMenuCommand(caption: string, commandFunc: () => void, accessKey?: string): void;
    interface Window {
        unsafeWindow: Window;
    }
}