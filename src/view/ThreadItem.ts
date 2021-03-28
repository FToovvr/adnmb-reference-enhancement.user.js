import { BaseRawItem } from "./BaseRawItem";
import { ResponseItem } from "./ResponseItem";

export class ThreadItem extends BaseRawItem {

    constructor({ elem }: { elem: HTMLDivElement }) {
        console.assert(!!elem.querySelector(':scope > .h-threads-item-main'));
        super({ elem });
    }

    get parentItem() {
        return null;
    }

    createPseudoRefContentClone(): HTMLDivElement {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('h-threads-item');
        const itemRefDiv = document.createElement('div');
        itemRefDiv.classList.add('h-threads-item-reply', 'h-threads-item-ref');
        itemDiv.append(itemRefDiv);
        const itemMainDiv = this.elem.querySelector('.h-threads-item-main')!
            .cloneNode(true) as HTMLElement;
        itemMainDiv.className = '';
        itemMainDiv.classList.add('h-threads-item-reply-main');
        itemRefDiv.append(itemMainDiv);
        const infoDiv = itemMainDiv.querySelector('.h-threads-info')!;
        try { // 尝试修正几个按钮的位置。以后如果A岛自己修正了这里就会抛异常
            const messedUpDiv = infoDiv.querySelector('.h-admin-tool')!.closest('.h-threads-info-report-btn');
            if (!messedUpDiv) { // 版块页面里的各个按钮没搞砸
                infoDiv.querySelectorAll('.h-threads-info-report-btn a').forEach((aElem) => {
                    if (aElem.textContent !== "举报") {
                        aElem.closest('.h-threads-info-report-btn')!.remove();
                    }
                });
                infoDiv.querySelector('.h-threads-info-reply-btn')!.remove();
            } else { // 串内容页面的各个按钮搞砸了
                infoDiv.append(
                    '', messedUpDiv.querySelector('.h-threads-info-id')!,
                    '', messedUpDiv.querySelector('.h-admin-tool')!,
                );
                messedUpDiv.remove();
            }
        } catch (e) {
            console.log(e);
        }
        return itemDiv;
    }

    get responses() {
        const self = this;
        return (function* () {
            for (const responseItemElem of Array.from(self.elem.querySelectorAll('.h-threads-item-replys .h-threads-item-reply'))) {
                yield new ResponseItem({ elem: responseItemElem as HTMLDivElement });
            }
        })();
    }

}