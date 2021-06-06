export { };

declare global {
    function GM_registerMenuCommand(caption: string, commandFunc: () => void, accessKey?: string): void;
    const unsafeWindow: Window;
    namespace GM_info {
        const scriptHandler: string;
    }
}