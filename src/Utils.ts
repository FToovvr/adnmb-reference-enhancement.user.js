export class Utils {

    static currentGeneratedViewID = 0;

    // https://stackoverflow.com/a/59837035
    static generateViewID() {
        Utils.currentGeneratedViewID += 1;
        return String(Utils.currentGeneratedViewID);
    }

    static insertAfter(node: Node, newNode: Node) {
        node.parentNode.insertBefore(newNode, node.nextSibling);
    }

    // https://stackoverflow.com/a/26230989
    static getCoords(elem: Element) { // crossbrowser version
        const box = elem.getBoundingClientRect();

        const body = document.body;
        const docEl = document.documentElement;

        const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
        const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

        const clientTop = docEl.clientTop || body.clientTop || 0;
        const clientLeft = docEl.clientLeft || body.clientLeft || 0;

        const top = box.top + scrollTop - clientTop;
        const left = box.left + scrollLeft - clientLeft;

        return { top: Math.round(top), left: Math.round(left) };
    }

    // // https://stackoverflow.com/a/49857905
    // // https://stackoverflow.com/a/50101022
    // static fetchWithTimeout(url, options, timeout = 10000) {
    //     options = { ...(options || {}) };
    //     const controller = new AbortController();
    //     if (options.signal instanceof AbortSignal) {
    //         options.signal.addEventListener(function (ev) {
    //             controller.signal.dispatchEvent.call(this, ev);
    //         });
    //     }
    //     options.signal = controller.signal;
    //     return Promise.race([
    //         fetch(url, options),
    //         new Promise((_, reject) => {
    //             setTimeout(() => {
    //                 reject(new Error('Timeout'));
    //                 controller.abort();
    //             }, timeout);
    //         })
    //     ]);
    // }

}
