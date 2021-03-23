export class ViewHelper {

    static getPosterID(elem: HTMLElement) {
        if (!elem.classList.contains('.h-threads-info-uid')) {
            elem = elem.querySelector('.h-threads-info-uid');
        }
        const uid = elem.textContent;
        return /^ID:(.*)$/.exec(uid)[1];
    }

    static getThreadID(elem: HTMLElement) {
        if (!elem.classList.contains('.h-threads-info-id')) {
            elem = elem.querySelector('.h-threads-info-id');
        }
        const link = elem.getAttribute('href');
        const id = /^.*\/t\/(\d*).*$/.exec(link)[1];
        if (!id.length) {
            return null;
        }
        return Number(id);
    }

    static getPostID(elem: HTMLElement) {
        if (!elem.classList.contains('.h-threads-info-id')) {
            elem = elem.querySelector('.h-threads-info-id');
        }
        return Number(/^No.(\d+)$/.exec(elem.textContent)[1]);
    }

    static hasFetchingRefSucceeded(elem: HTMLElement) {
        return !elem.parentElement.querySelector('.fto-ref-view-error');
    }

    static getRefViewByViewId(viewId: string) {
        return document.querySelector(`.fto-ref-view[data-view-id="${viewId}"]`) as HTMLElement;
    }
    static getRefLinkByViewId(viewId: string) {
        return document.querySelector(`.fto-ref-link[data-view-id="${viewId}"]`) as HTMLElement;
    }

}
