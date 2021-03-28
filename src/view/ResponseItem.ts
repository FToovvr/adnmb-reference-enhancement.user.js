import { BaseRawItem } from "./BaseRawItem";
import { ThreadItem } from './ThreadItem';

export class ResponseItem extends BaseRawItem {

    constructor({ elem }: { elem: HTMLDivElement }) {
        console.assert(elem.classList.contains('h-threads-item-reply'));
        super({ elem });
    }

    get parentItem() {
        const parent = this.elem.parentElement!;

        const threadElem = parent.closest('.h-threads-item');
        if (threadElem) {
            return new ThreadItem({ elem: threadElem as HTMLDivElement });
        }
        return null;
    }

    createPseudoRefContentClone(): HTMLDivElement {
        const div = document.createElement('div');
        div.classList.add('h-threads-item');
        const itemElem = this.elem.cloneNode(true) as HTMLElement;
        itemElem.classList.add('h-threads-item-ref');
        itemElem.querySelector('.h-threads-item-reply-icon')!.remove();
        itemElem.querySelectorAll('.uk-text-primary').forEach((labelElem) => {
            if (labelElem.textContent === "(PO主)") {
                labelElem.remove();
            }
        });
        div.append(itemElem);
        return div;
    }

}