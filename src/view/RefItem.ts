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

    private static addedClickEventListener = false;

    private addMouseClickingEventListeners(loadRefContentCallback: LoadRefContentCallback) {
        // 处理折叠

        // TODO: 链接这部分应该移到 BaseRawItem 之类的地方
        this.linkElem.addEventListener('click', () => {
            if (this.parentItem instanceof RefItem) {
                return;
            }
            if (this.loadingStatus === 'empty') {
                loadRefContentCallback(this, this.postId);
            }
            if (this.displayStatus === 'open') {
                this.displayStatus = 'collapsed';
            } else {
                this.displayStatus = 'open';
            }
        });

        if (RefItem.addedClickEventListener) {
            return;
        }
        RefItem.addedClickEventListener = true;

        document.body.addEventListener('click', (e) => {
            // 会导致展开的内容：正文文本/空白、头部空白、点击后会展开的引用链接、点击后会固定的图钉按钮
            const targetElem = e.target as HTMLElement;
            const thisElem = targetElem.closest('.fto-ref-view') as (HTMLElement | null);
            if (!thisElem) {
                return;
            }
            const _this = RefItem.findItemByViewId(thisElem.dataset.viewId!)!;

            let shouldOpen: boolean; // 有可能导致高度改变的操作需要设这个值而非直接返回
            let itemToRefresh: BaseItem | null = _this;
            if (targetElem.classList.contains('fto-ref-link')) {
                // 如果点的是引用链接，要先处理该链接对应的引用视图。
                // 需要展开其父视图的情况：点击链接后会固定引用视图
                const targetItem = RefItem.findItemByViewId(targetElem.dataset.viewId!)!;
                if (targetItem.loadingStatus === 'empty') {
                    loadRefContentCallback(targetItem, targetItem.postId);
                }
                if (targetItem.displayStatus === 'open') {
                    targetItem.displayStatus = 'collapsed';
                    shouldOpen = false;
                } else {
                    targetItem.displayStatus = 'open';
                    shouldOpen = true;
                }
            } else if (targetElem.classList.contains('fto-ref-view-pin')) {
                // 如果是为了关闭视图而点击图钉，不会展开
                shouldOpen = !_this.isPinned; // shouldOpen a.k.a. shouldPin
                _this.displayStatus = shouldOpen ? 'open' : 'floating';
                itemToRefresh = _this.parentItem;
            } else if (!_this.isPinned) {
                return;
            } else if (
                // 除了引用链接需要展开对应视图外，点击正文文本/空白、头部空白需要展开，
                // 点击图钉按钮需要另行考虑，而除此之外不会展开
                !['h-threads-content', 'h-threads-info', 'fto-ref-view-mask-wrapper']
                    .map((c) => targetElem.classList.contains(c))
                    .reduce((l, r) => l || r)
            ) {
                return;
            } else {
                shouldOpen = true;
            }
            for (;
                itemToRefresh instanceof RefItem && itemToRefresh.isPinned;
                itemToRefresh = itemToRefresh.parentItem) {
                if (itemToRefresh.displayStatus === 'collapsed') {
                    itemToRefresh.displayStatus = shouldOpen ? 'open' : 'collapsed';
                }
            }

        });
    }

    get isPinned() {
        return this.displayStatus === 'open' || this.displayStatus === 'collapsed';
    }

    setupContent(content: HTMLElement | null, error: Error | null,
        loadRefContentCallback: LoadRefContentCallback | null) {
        this.elem.innerHTML = '';

        const maskWrapper = document.createElement('div');
        maskWrapper.classList.add('fto-ref-view-mask-wrapper');
        this.elem.append(maskWrapper);

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
        if (this.placedInThread!.postId !== this.belongsToThreadId) {
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
                if (this.canBeCollapsed) {
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

    get canBeCollapsed() {
        return this.elem.scrollHeight > configurations.collapsedHeight;
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

        const threadElem = ViewHelper.getClosestThreadElement(parent);
        if (threadElem) {
            return new ThreadItem({ elem: threadElem as HTMLDivElement });
        }
        return null;
    }

}
