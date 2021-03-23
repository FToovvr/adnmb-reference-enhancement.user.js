import { Model } from './Model';
import { ViewHelper } from './ViewHelper';
import { Utils } from './Utils';

import {
    floatingOpacity, fadingDuration, collapsedHeight,
    clickPinToCloseView,
    showRefreshButtonEvenIfRefContentLoaded,
    autoOpenRefViewIfRefContentAlreadyCached
} from './configurations';

import additionalStyleText from './style.css';

const additioanVariableStyleText = `
    .fto-ref-view[data-status="floating"] {
        opacity: ${floatingOpacity};
        transition: opacity ${fadingDuration} ease-in;
    }

    .fto-ref-view[data-status="collapsed"] {
        max-height: ${collapsedHeight}px;
    }
    `;

export class Controller {

    model: Model;

    constructor(model: Model) {
        this.model = model;
    }

    static setupStyle() {
        for (const [styleText, id] of [
            [additionalStyleText, 'fto-style-additional-fixed'],
            [additioanVariableStyleText, 'fto-style-additional-variable'],
        ]) {
            const style = document.createElement('style');
            style.id = id;
            style.classList.add('fto-style');
            // TODO: fade out
            style.append(styleText);
            document.head.append(style);
        }
    }

    setupContent(root: HTMLElement) {

        if (root === document.body) {
            root.querySelectorAll('.h-threads-item').forEach((threadItemElem) => {
                this.setupThreadContent(threadItemElem as HTMLElement);
            });
        } else if (ViewHelper.hasFetchingRefSucceeded(root)) {
            const repliesElem = root.closest('.h-threads-item-replys');
            let threadElem;
            if (repliesElem) { // 在串的回应中
                threadElem = repliesElem.closest('.h-threads-item');
            } else { // 在串首中
                threadElem = root.closest('.h-threads-item-main');
            }
            const threadID = ViewHelper.getThreadID(threadElem);
            const po = ViewHelper.getPosterID(threadElem);
            this.setupRefContent(root, threadID, po);
        } else {
            this.setupErrorRefContent(root);
            return;
        }

        root.querySelectorAll('font[color="#789922"]').forEach(linkElem => {
            if (!linkElem.textContent.startsWith('>>')) { return; }
            this.setupRefLink(linkElem as HTMLElement);
        });
    }

    setupThreadContent(threadItemElem: HTMLElement) {
        const threadID = ViewHelper.getThreadID(threadItemElem);

        { // 将串首加入缓存
            const originalItemMainElem = threadItemElem.querySelector('.h-threads-item-main');
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('h-threads-item');
            const itemRefDiv = document.createElement('div');
            itemRefDiv.classList.add('h-threads-item-reply', 'h-threads-item-ref');
            itemDiv.append(itemRefDiv);
            const itemMainDiv = originalItemMainElem.cloneNode(true) as HTMLElement;
            itemMainDiv.className = '';
            itemMainDiv.classList.add('h-threads-item-reply-main');
            itemRefDiv.append(itemMainDiv);
            const infoDiv = itemMainDiv.querySelector('.h-threads-info');
            try { // 尝试修正几个按钮的位置。以后如果A岛自己修正了这里就会抛异常
                const messedUpDiv = infoDiv.querySelector('.h-admin-tool').closest('.h-threads-info-report-btn');
                if (!messedUpDiv) { // 版块页面里的各个按钮没搞砸
                    infoDiv.querySelectorAll('.h-threads-info-report-btn a').forEach((aElem) => {
                        if (aElem.textContent !== "举报") {
                            aElem.closest('.h-threads-info-report-btn').remove();
                        }
                    });
                    infoDiv.querySelector('.h-threads-info-reply-btn').remove();
                } else { // 串内容页面的各个按钮搞砸了
                    infoDiv.append(
                        '', messedUpDiv.querySelector('.h-threads-info-id'),
                        '', messedUpDiv.querySelector('.h-admin-tool'),
                    );
                    messedUpDiv.remove();
                }
            } catch (e) {
                console.log(e);
            }
            this.model.recordRef(threadID, itemDiv, 'global');
        }

        // 将各回应加入缓存
        threadItemElem.querySelectorAll('.h-threads-item-replys .h-threads-item-reply').forEach((originalItemElem) => {
            const div = document.createElement('div');
            div.classList.add('h-threads-item');
            const itemElem = originalItemElem.cloneNode(true) as HTMLElement;
            itemElem.classList.add('h-threads-item-ref');
            itemElem.querySelector('.h-threads-item-reply-icon').remove();
            for (const child of itemElem.querySelector('.h-threads-item-reply-main').children) {
                if (!child.classList.contains('h-threads-info')
                    && !child.classList.contains('h-threads-content')) {
                    child.remove();
                }
            }
            itemElem.querySelectorAll('.uk-text-primary').forEach((labelElem) => {
                if (labelElem.textContent === "(PO主)") {
                    labelElem.remove();
                }
            });
            div.append(itemElem);
            this.model.recordRef(ViewHelper.getPostID(itemElem), div, 'global');
        });
    }

    setupRefContent(elem: HTMLElement, threadID: number, po: string) {
        const infoElem = elem.querySelector('.h-threads-info') as HTMLElement;

        // 补标 PO
        if (ViewHelper.getPosterID(infoElem) === po) {
            const poLabel = document.createElement('span');
            poLabel.textContent = "(PO主)";
            poLabel.classList.add('uk-text-primary', 'uk-text-small', 'fto-po-label');
            const uidElem = infoElem.querySelector('.h-threads-info-uid');
            Utils.insertAfter(uidElem, poLabel);
            Utils.insertAfter(uidElem, document.createTextNode(' '));
        }

        // 标「外串」
        if (ViewHelper.getThreadID(infoElem) !== threadID) {
            const outerThreadLabel = document.createElement('span');
            outerThreadLabel.textContent = "(外串)";
            outerThreadLabel.classList.add('uk-text-secondary', 'uk-text-small', 'fto-outer-thread-label');
            const idElem = infoElem.querySelector('.h-threads-info-id');
            idElem.append(' ', outerThreadLabel);
        }

        this.setupButtons(infoElem);
    }

    setupErrorRefContent(elem: HTMLElement) {
        this.setupButtons(elem);
    }

    setupButtons(elem: HTMLElement) {
        const viewDiv = elem.closest('.fto-ref-view') as HTMLElement;
        const linkElem = ViewHelper.getRefLinkByViewId(viewDiv.dataset.viewId);

        const buttonListSpan = document.createElement('span');
        buttonListSpan.classList.add('fto-ref-view-button-list');

        // 图钉📌按钮
        const pinSpan = document.createElement('span');
        pinSpan.classList.add('fto-ref-view-pin', 'fto-ref-view-button');
        pinSpan.textContent = "📌";
        pinSpan.addEventListener('click', () => {
            if (viewDiv.dataset.status === 'floating') {
                linkElem.dataset.status = 'open';
                viewDiv.dataset.status = 'open';
            } else {
                linkElem.dataset.status = 'closed';
                viewDiv.dataset.status = clickPinToCloseView ? 'closed' : 'floating';
            }
        });
        buttonListSpan.append(pinSpan);

        if (!viewDiv.dataset.isLoading &&
            (!ViewHelper.hasFetchingRefSucceeded(elem) || showRefreshButtonEvenIfRefContentLoaded)) {
            // 刷新🔄按钮
            const refreshSpan = document.createElement('span');
            refreshSpan.classList.add('fto-ref-view-refresh', 'fto-ref-view-button');
            refreshSpan.textContent = "🔄";
            refreshSpan.addEventListener('click', () => {
                this.startLoadingViewContent(viewDiv, Number(linkElem.dataset.refId), true);
            });
            Utils.insertAfter(pinSpan, refreshSpan);
            buttonListSpan.append(refreshSpan);
        }

        elem.prepend(buttonListSpan);
    }

    setupRefLink(linkElem: HTMLElement) {
        linkElem.classList.add('fto-ref-link');
        // closed: 无固定显示 view; open: 有固定显示 view
        linkElem.dataset.status = 'closed';

        const r = /^>>No.(\d+)$/.exec(linkElem.textContent);
        if (!r) { return; }
        const refId = Number(r[1]);
        linkElem.dataset.refId = String(refId);

        const viewId = Utils.generateViewID();
        linkElem.dataset.viewId = viewId;

        const viewDiv = document.createElement('div');
        viewDiv.classList.add('fto-ref-view');
        // closed: 不显示; floating: 悬浮显示; open: 完整固定显示; collapsed: 折叠固定显示
        viewDiv.dataset.status = 'closed';
        viewDiv.dataset.viewId = viewId;

        viewDiv.style.setProperty('--offset-left', `${Utils.getCoords(linkElem).left}px`);

        Utils.insertAfter(linkElem, viewDiv);

        if (autoOpenRefViewIfRefContentAlreadyCached) {
            (async () => {
                const refCache = await this.model.getRefCache(refId);
                if (refCache) {
                    linkElem.dataset.status = 'open';
                    viewDiv.dataset.status = 'collapsed';
                    viewDiv.append(refCache);
                    this.setupContent(refCache);
                }
            })();
        }

        // 处理悬浮
        linkElem.addEventListener('mouseenter', () => {
            if (viewDiv.dataset.status !== 'closed') {
                viewDiv.dataset.isHovering = '1';
                return;
            }
            viewDiv.dataset.status = 'floating';
            viewDiv.dataset.isHovering = '1';
            this.startLoadingViewContent(viewDiv, refId);
        });
        viewDiv.addEventListener('mouseenter', () => {
            viewDiv.dataset.isHovering = '1';
        });
        for (const elem of [linkElem, viewDiv]) {
            elem.addEventListener('mouseleave', () => {
                if (viewDiv.dataset.status !== 'floating') {
                    return;
                }
                delete viewDiv.dataset.isHovering;
                (async () => {
                    setTimeout(() => {
                        if (!viewDiv.dataset.isHovering) {
                            viewDiv.dataset.status = 'closed';
                        }
                    }, 200);
                })();
            });
        }

        // 处理折叠
        linkElem.addEventListener('click', () => {
            if (linkElem.dataset.status === 'closed'
                || ['collapsed', 'floating'].includes(viewDiv.dataset.status)) {
                linkElem.dataset.status = 'open';
                viewDiv.dataset.status = 'open';
            } else if (viewDiv.clientHeight > collapsedHeight) {
                viewDiv.dataset.status = 'collapsed';
            }
        });
        viewDiv.addEventListener('click', () => {
            if (viewDiv.dataset.status === 'collapsed') {
                viewDiv.dataset.status = 'open';
            }
        });
    }

    startLoadingViewContent(viewDiv: HTMLElement, refId: number, forced: boolean = false) {
        if (!forced && viewDiv.hasChildNodes()) {
            return;
        } else if (viewDiv.dataset.isLoading) { // TODO: 也可以强制从头重新加载？
            return;
        }
        this.setupLoading(viewDiv);

        this.model.subscribeForLoadingItemElement(this, refId, viewDiv.dataset.viewId, forced);
    }

    setupLoading(viewDiv: HTMLElement) {
        viewDiv.dataset.isLoading = '1';

        const loadingSpan = document.createElement('span');
        loadingSpan.classList.add('fto-ref-view-loading');
        const loadingTextSpan = document.createElement('span');
        loadingTextSpan.classList.add('fto-ref-view-loading-text');
        loadingTextSpan.dataset.waitedMilliseconds = '0';
        loadingTextSpan.textContent = "加载中…";
        loadingSpan.append(loadingTextSpan);
        viewDiv.innerHTML = '';
        viewDiv.append(loadingSpan);
        this.setupButtons(loadingSpan);
    }

    isLoading(viewId: string) {
        return !!ViewHelper.getRefViewByViewId(viewId).dataset.isLoading;
    }

    reportSpentTime(viewId: string, spentMs: number) {
        const viewDiv = ViewHelper.getRefViewByViewId(viewId);
        if (!this.isLoading(viewId)) {
            this.setupLoading(viewDiv);
        }
        viewDiv.querySelector('.fto-ref-view-loading-text')
            .textContent = `加载中… ${(spentMs / 1000.0).toFixed(2)}s`;
    }

    updateViewContent(viewId: string, itemElement: HTMLElement) {
        const viewDiv = ViewHelper.getRefViewByViewId(viewId);
        delete viewDiv.dataset.isLoading;
        viewDiv.innerHTML = '';
        viewDiv.append(itemElement);
        this.setupContent(itemElement);
    }

}
