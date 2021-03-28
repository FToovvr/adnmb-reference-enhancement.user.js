import { ViewHelper } from '../ViewHelper';
import { Utils } from '../Utils';

import { BaseItem } from './BaseItem';
import { ResponseItem } from './ResponseItem';
import { ThreadItem } from './ThreadItem';

import configurations from '../configurations';

export const refItemClassName = 'fto-ref-view';

export type refItemLoadingStatus = 'empty' | 'loading' | 'succeed' | 'failed';

// TODO: status -> openStatus
export type refItemStatus = 'closed' | 'floating' | 'open' | 'collapsed';

export type LoadRefContentCallback = (refItem: RefItem, refId: number, forced?: boolean) => void;

export class RefItem extends BaseItem {

    elem: HTMLDivElement;

    constructor({ refId = null, elem = null }: { refId?: number | null; elem?: HTMLDivElement | null; }) {
        super();

        console.assert(refId !== null || elem != null);

        if (elem) {
            this.elem = elem;
        } else {
            this.elem = document.createElement('div');
        }
        if (!this.elem.classList.contains(refItemClassName)) {
            this.elem.classList.add(refItemClassName);
            this.elem.dataset.viewId = Utils.generateViewID();
        }
        if (refId) {
            console.assert(!this.elem.dataset.refId);
            this.elem.dataset.refId = String(refId);
        }
    }

    static findItemByViewId(viewId: string) {
        const elem = document.querySelector(`.${refItemClassName}[data-view-id="${viewId}"]`);
        return elem ? new RefItem({ elem: elem as HTMLDivElement }) : null;
    }
    static findClosestItem(currentElem: HTMLElement) {
        const elem = currentElem.closest(`.${refItemClassName}`);
        return elem ? new RefItem({ elem: elem as HTMLDivElement }) : null;
    }

    static contentExists(elem: HTMLElement) {
        return /No.\d+/.test(elem.querySelector('.h-threads-info-id')!.textContent!);
    }

    mount(targetLinkElem: HTMLElement,
        loadingContentCallback: LoadRefContentCallback) {
        console.assert(!this.linkElem);
        console.assert(!targetLinkElem.dataset.viewId);

        targetLinkElem.dataset.viewId = this.viewId;
        this.elem.style.setProperty('--offset-left', `${Utils.getCoords(targetLinkElem).left}px`);
        Utils.insertAfter(targetLinkElem, this.elem);

        this.displayStatus = 'closed';

        this.addMouseHoveringEventListeners(loadingContentCallback);
        this.addMouseClickingEventListeners(loadingContentCallback);
    }

    private addMouseHoveringEventListeners(loadingContentCallback: LoadRefContentCallback) {
        // 处理悬浮
        this.elem.addEventListener('mouseenter', () => {
            this.isHovering = true;
        });
        this.linkElem.addEventListener('mouseenter', () => {
            if (this.displayStatus !== 'closed') {
                this.isHovering = true;
                return;
            } else if (configurations.hoverRefLinkToFloatRefView) {
                this.displayStatus = 'floating';
                this.isHovering = true;
                loadingContentCallback(this, this.postId);
            }
        });
        for (const eventElem of [this.linkElem, this.elem]) {
            eventElem.addEventListener('mouseleave', () => {
                if (this.displayStatus !== 'floating') {
                    return;
                }
                this.isHovering = false;
                (async () => {
                    setTimeout(() => {
                        if (!this.isHovering) {
                            this.displayStatus = 'closed';
                        }
                    }, 200);
                })();
            });
        }
    }

    private addMouseClickingEventListeners(loadRefContentCallback: LoadRefContentCallback) {
        // 处理折叠
        this.linkElem.addEventListener('click', () => {
            if (this.displayStatus === 'open') {
                this.displayStatus = 'collapsed';
            } else {
                this.displayStatus = 'open';
                loadRefContentCallback(this, this.postId);
            }
        });
        this.elem.addEventListener('click', () => {
            if (this.displayStatus === 'collapsed') {
                this.displayStatus = 'open';
            }
        });
    }

    setupContent(content: HTMLElement | null, error: Error | null,
        loadRefContentCallback: LoadRefContentCallback | null) {
        this.elem.innerHTML = '';
        if (error) {
            this.loadingStatus = 'failed';
            const errorSpan = document.createElement('span');
            errorSpan.classList.add(`${refItemClassName}-error`);
            errorSpan.textContent = error.message;
            this.elem.append(errorSpan);
        } else if (!content) {
            this.loadingStatus = 'empty';
            this.displayStatus = 'closed';
        } else {
            this.loadingStatus = 'succeed';
            this.elem.append(content);
            this.setupMarks();
        }
        this.setupButtons(loadRefContentCallback);
    }

    setupMarks() {
        console.assert(this.loadingStatus === 'succeed');

        // 补标 PO
        if (this.placedInThread!.postOwnerId === this.postOwnerId) {
            const poLabel = document.createElement('span');
            poLabel.textContent = "(PO主)";
            poLabel.classList.add('uk-text-primary', 'uk-text-small', 'fto-po-label');
            const uidElem = this.elem.querySelector('.h-threads-info .h-threads-info-uid')!;
            Utils.insertAfter(uidElem, poLabel);
            Utils.insertAfter(uidElem, document.createTextNode(' '));
        }

        // 标「外串」
        if (this.placedInThread!.postId !== this.postId) {
            const outerThreadLabel = document.createElement('span');
            outerThreadLabel.textContent = "(外串)";
            outerThreadLabel.classList.add('uk-text-secondary', 'uk-text-small', 'fto-outer-thread-label');
            const idElem = this.elem.querySelector('.h-threads-info .h-threads-info-id')!;
            idElem.append(' ', outerThreadLabel);
        }

    }

    setupButtons(loadRefContentCallback: LoadRefContentCallback | null) {
        let infoElem: HTMLElement;
        switch (this.loadingStatus) {
            case 'empty':
                return;
            case 'loading':
                infoElem = this.elem.querySelector(`.${refItemClassName}-loading`)!;
                break;
            case 'succeed':
                infoElem = this.elem.querySelector('.h-threads-info')!;
                break;
            case 'failed':
                infoElem = this.elem.querySelector(`.${refItemClassName}-error`)!;
                break;
        }

        const buttonListSpan = document.createElement('span');
        buttonListSpan.classList.add('fto-ref-view-button-list');

        // 图钉📌按钮
        const pinSpan = document.createElement('span');
        pinSpan.classList.add('fto-ref-view-pin', 'fto-ref-view-button');
        pinSpan.textContent = "📌";
        pinSpan.addEventListener('click', () => {
            if (this.displayStatus === 'floating') {
                this.displayStatus = 'open';
            } else {
                this.displayStatus = configurations.clickPinToCloseView ? 'closed' : 'floating';
            }
        });
        buttonListSpan.append(pinSpan);

        // 刷新🔄按钮
        if (loadRefContentCallback) {
            const refreshSpan = document.createElement('span');
            refreshSpan.classList.add('fto-ref-view-refresh', 'fto-ref-view-button');
            refreshSpan.textContent = "🔄";
            refreshSpan.addEventListener('click', () => {
                loadRefContentCallback(this, this.postId, true);
            });
            Utils.insertAfter(pinSpan, refreshSpan);
            buttonListSpan.append(refreshSpan);
        }

        infoElem.prepend(buttonListSpan);
    }

    private setupLoading() {
        const loadingSpan = document.createElement('span');
        loadingSpan.classList.add(`${refItemClassName}-loading`);
        const loadingTextSpan = document.createElement('span');
        loadingTextSpan.classList.add(`${refItemClassName}-loading-text`);
        loadingTextSpan.dataset.waitedMilliseconds = '0';
        loadingTextSpan.textContent = "加载中…";
        loadingSpan.append(loadingTextSpan);
        this.elem.innerHTML = '';
        this.elem.append(loadingSpan);

        this.setupButtons(null);
    }

    set loadingSpentTime(spentMs: number) {
        this.loadingStatus = 'loading';
        this.elem.querySelector(`.${refItemClassName}-loading-text`)!
            .textContent = `加载中… ${(spentMs / 1000.0).toFixed(2)}s`;
    }

    get viewId() {
        return this.elem.dataset.viewId!;
    }

    get linkElem() {
        return ViewHelper.getRefLinkByViewId(this.viewId);
    }

    get postId() {
        return Number(this.elem.dataset.refId!);
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

    get loadingStatus(): refItemLoadingStatus {
        if (this.elem.dataset.loadingStatus) {
            return this.elem.dataset.loadingStatus as refItemLoadingStatus;
        }
        return 'empty';
    }
    set loadingStatus(status: refItemLoadingStatus) {
        if (status === 'empty') {
            delete this.elem.dataset.loadingStatus;
        }
        const oldLoadingStatus = this.loadingStatus;
        this.elem.dataset.loadingStatus = status;
        if (status === 'loading' && oldLoadingStatus !== 'loading') {
            this.setupLoading();
        }
    }

    get displayStatus(): refItemStatus | null {
        if (this.elem.dataset.displayStatus) {
            return this.elem.dataset.displayStatus as refItemStatus;
        }
        return null;
    }
    set displayStatus(status: refItemStatus | null) {
        console.assert(status !== null);

        switch (status) {
            case 'closed': case 'floating': case 'open':
                this.elem.dataset.displayStatus = status;
                break;
            case 'collapsed':
                if (this.elem.clientHeight > configurations.collapsedHeight) {
                    this.elem.dataset.displayStatus = 'collapsed';
                } else {
                    this.elem.dataset.displayStatus = 'open';
                }
                break;
        }

        switch (this.elem.dataset.displayStatus) {
            case 'closed': case 'floating':
                this.linkElem.dataset.displayStatus = 'closed';
                break;
            case 'open': case 'collapsed':
                this.linkElem.dataset.displayStatus = 'open';
        }

    }

    get isHovering() {
        return !!this.linkElem.dataset.isHovering;
    }
    set isHovering(value: boolean) {
        if (value) {
            this.linkElem.dataset.isHovering = '1';
        } else {
            delete this.linkElem.dataset.isHovering;
        }
    }

    get parentItem() {
        const parent = this.elem.parentElement!;

        const parentRefElem = parent.closest(`.${refItemClassName}`);
        if (parentRefElem) {
            return new RefItem({ elem: parentRefElem as HTMLDivElement });
        }

        return this.placedInRootResponse ?? this.placedInThread;
    }

    get placedInRootResponse() {
        const parent = this.elem.parentElement!;
        const responseElem = parent.closest('.h-threads-item-reply');
        if (responseElem) {
            return new ResponseItem({ elem: responseElem as HTMLDivElement });
        }
        return null;
    }

    get placedInThread() {
        const parent = this.elem.parentElement!;
        const threadElem = parent.closest('.h-threads-item');
        if (threadElem) {
            return new ThreadItem({ elem: threadElem as HTMLDivElement });
        }
        return null;
    }

}
