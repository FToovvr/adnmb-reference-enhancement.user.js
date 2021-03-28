export class ViewHelper {

    static getRefLinkByViewId(viewId: string) {
        return document.querySelector(`.fto-ref-link[data-view-id="${viewId}"]`) as HTMLElement;
    }

    static getClosestThreadElement(currentElement: HTMLElement) {
        return currentElement.closest('.h-threads-item[data-threads-id]');
    }

    static addStyle(styleText: string, id) {
        const style = document.createElement('style');
        style.id = id;
        style.classList.add('fto-style');
        // TODO: fade out
        style.append(styleText);
        document.head.append(style);
    }

    static getRefLinks(elem: HTMLElement) {
        return elem.querySelectorAll('font[color="#789922"]');
    }

}
