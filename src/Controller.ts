import { Model } from './Model';
import { ViewHelper } from './ViewHelper';
import { ThreadItem } from './view/ThreadItem';
import { RefItem } from './view/RefItem';

import configurations from './configurations';

import additionalStyleText from './style/style.scss';

export class Controller {

    model: Model;

    constructor(model: Model) {
        this.model = model;
    }

    static makeAdditionalVariableStyleText() {
        let styleText = `
        .fto-ref-view[data-display-status="floating"] {
            opacity: ${configurations.floatingOpacity}%;
            transition: opacity ${configurations.fadingDuration}ms ease-in;
        }

        .fto-ref-view[data-display-status="collapsed"] {
            max-height: ${configurations.collapsedHeight}px;
        }

        .fto-ref-view[data-display-status="closed"] {
            /* transition: opacity ${configurations.fadingDuration}ms ease-out; */
        }
        `;

        if (!configurations.showRefreshButtonEvenIfRefContentLoaded) {
            styleText += `
            .fto-ref-view-refresh {
                display: none;
            }
            .fto-ref-view-error .fto-ref-view-refresh {
                display: inline;
            }
            `;
        }

        if (configurations.displayOpenedRefLinkInItalics) {
            styleText += `
            .fto-ref-link[data-display-status="open"] {
                font-style: italic;
            }
            `;
        }

        return styleText;
    }

    static setupStyle() {
        for (const [styleText, id] of [
            [additionalStyleText, 'fto-style-adnmb-reference-enhancement-fixed'],
            [this.makeAdditionalVariableStyleText(), 'fto-style-adnmb-reference-enhancement-variable'],
        ]) {
            ViewHelper.addStyle(styleText, id);
        }

        configurations.onConfigurationChange(() => {
            const style = document.querySelector('#fto-style-adnmb-reference-enhancement-variable')!;
            style.innerHTML = '';
            style.append(this.makeAdditionalVariableStyleText());
        });
    }

    setupRoot(root: HTMLElement | HTMLDocument) {
        root.querySelectorAll('.h-threads-item[data-threads-id]').forEach((threadItemElem) => {
            const threadItem = new ThreadItem({ elem: threadItemElem as HTMLDivElement });
            // ?????????????????????
            this.model.recordRef(threadItem.postId, threadItem.createPseudoRefContentClone(), null, 'global');
            // ????????????????????????
            for (const response of threadItem.responses) {
                this.model.recordRef(response.postId, response.createPseudoRefContentClone(), null, 'global');
            }
        });

        this.setupRefLinks(ViewHelper.getRefLinks(root));
    }

    setupContent(item: RefItem, content: HTMLElement | null, error: Error | null,
        parentAutoOpenPromiseResolve?: (() => void)) {

        item.setupContent(content, error, this.startLoadingViewContent.bind(this));
        if (item.loadingStatus === 'succeed') {
            this.setupRefLinks(item.refLinks, parentAutoOpenPromiseResolve);
        }

    }

    setupRefLinks(linkElems: NodeListOf<Element>,
        parentAutoOpenPromiseResolve: (() => void) | null = null) {
        if (linkElems.length === 0) {
            parentAutoOpenPromiseResolve?.();
            return;
        }
        let unfinished = linkElems.length;
        linkElems.forEach(linkElem => {
            (async () => { // ????????? async ???????????? (?????????)???
                this.setupRefLink(linkElem as HTMLElement, () => {
                    unfinished--;
                    if (unfinished === 0) {
                        parentAutoOpenPromiseResolve?.();
                    }
                });
            })();
        });
    }

    setupRefLink(linkElem: HTMLElement, parentAutoOpenPromiseResolve?: (() => void)) {
        linkElem.classList.add('fto-ref-link');
        // closed: ??????????????? view; open: ??????????????? view
        linkElem.dataset.displayStatus = 'closed';

        const r = /^>>(?:No\.)?(\d+)$/.exec(linkElem.textContent!);
        if (!r) {
            parentAutoOpenPromiseResolve?.();
            return;
        }
        const refId = Number(r[1]);
        linkElem.dataset.refId = String(refId);

        const refView = new RefItem({ refId });
        refView.mount(linkElem, this.startLoadingViewContent.bind(this));

        if (configurations.autoOpenConfig.target === 'ViewsWhoseContentHasBeenCached'
            && refView.countOfAncestorsWithSameContent <= 1) {
            (async () => {
                const [refCache, error] = await this.model.getRefCache(refId) ?? [null, null];
                if (refCache) {
                    await new Promise<void>(async (resolve) => {
                        refView.displayStatus = 'open';
                        this.setupContent(refView, refCache, error, resolve);
                    });
                    refView.displayStatus = configurations.autoOpenConfig.viewStatusAfterOpened;
                }
                parentAutoOpenPromiseResolve?.();
            })();
        } else {
            parentAutoOpenPromiseResolve?.();
        }
    }

    startLoadingViewContent(refItem: RefItem, refId: number, forced: boolean = false) {
        if (!forced && refItem.loadingStatus === 'succeed') {
            return;
        } else if (refItem.loadingStatus === 'loading') { // TODO: ????????????????????????????????????
            return;
        }
        refItem.loadingStatus = 'loading';

        this.model.subscribeForLoadingItemElement(refId, refItem.viewId, forced,
            (viewIds, content, error) => {
                for (const viewId of viewIds) {
                    const item = RefItem.findItemByViewId(viewId)!;
                    this.setupContent(item, content ? content.cloneNode(true) as HTMLElement : null, error);
                }
            }, (masterViewId, viewIds, spentMs) => {
                const masterItem = RefItem.findItemByViewId(masterViewId)!;
                if (masterItem.loadingStatus !== 'loading') {
                    return false;
                }
                for (const viewId of viewIds) {
                    const item = RefItem.findItemByViewId(viewId)!;
                    item.loadingSpentTime = spentMs;
                }
                return true;
            });
    }

}
