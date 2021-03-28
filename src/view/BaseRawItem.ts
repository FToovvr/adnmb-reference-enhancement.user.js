import { BaseItem } from "./BaseItem";
import { ViewHelper } from '../ViewHelper';

export abstract class BaseRawItem extends BaseItem {

    elem: HTMLDivElement;

    constructor({ elem }: { elem: HTMLDivElement }) {
        super();

        this.elem = elem;
    }

    get postId() {
        return Number(this.elem.dataset.threadsId);
    }

    get postOwnerId() {
        const uidElem = this.elem.querySelector('.h-threads-info-uid')!;
        const uid = uidElem.textContent!;
        return /^ID:(.*)$/.exec(uid)![1];
    }

    get belongsToThreadId() {
        const idElem = this.elem.querySelector('.h-threads-info-id')!;
        const link = idElem.getAttribute('href')!;
        const id = /^.*\/t\/(\d*).*$/.exec(link)![1];
        return Number(id);
    }

    get refLinks() {
        return ViewHelper.getRefLinks(this.elem);
    }

}