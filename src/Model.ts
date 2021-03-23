import { Controller } from './Controller';
import { ViewHelper } from './ViewHelper';

import configurations from './configurations';

export class Model {

    refCache: { [refId: number]: HTMLElement } = {};
    refsInFetching = new Set<number>();
    refSubscriptions = new Map<number, Set<string>>();

    get isSupported() {
        if (!window.indexedDB) {
            return false;
        }
        return true;
    }

    async getRefCache(refId: number): Promise<HTMLElement> | null {
        const elem = this.refCache[refId];
        if (!elem) { return null; }
        return elem.cloneNode(true) as HTMLElement;
    }


    async recordRef(refId: number, rawItem: HTMLElement, scope: 'page' | 'global' = 'page') {
        this.refCache[refId] = rawItem.cloneNode(true) as HTMLElement;
    }

    async subscribeForLoadingItemElement(controller: Controller, refId: number, viewId: string, ignoresCache: boolean = false) {
        if (!this.refSubscriptions.has(refId)) {
            this.refSubscriptions.set(refId, new Set());
        }
        this.refSubscriptions.get(refId).add(viewId);

        const itemCache = ignoresCache ? null : await this.getRefCache(refId);
        if (itemCache) {
            const item = this.processItemElement(itemCache, refId);
            controller.updateViewContent(viewId, item);
        } else if (!this.refsInFetching.has(refId)) {
            this.refsInFetching.add(refId);

            let item = await this.fetchItemElement(controller, refId, viewId);
            item = this.processItemElement(item, refId);
            this.refSubscriptions.get(refId).forEach((subscriptedViewId) => {
                controller.updateViewContent(subscriptedViewId, item.cloneNode(true) as HTMLElement);
            });
            this.refsInFetching.delete(refId);
        }
    }

    async fetchItemElement(controller: Controller, refId: number, viewId: string) {
        let spentMs = 0;
        const intervalId = setInterval(() => {
            spentMs += 20;
            if (!controller.isLoading(viewId)) {
                clearInterval(intervalId);
            } else {
                this.refSubscriptions.get(refId).forEach((viewIdToReport) => {
                    controller.reportSpentTime(viewIdToReport, spentMs);
                });
            }
        }, 20);

        return new Promise<HTMLElement>((resolve, _) => {
            const itemContainer = document.createElement('div');
            $.ajax({
                url: `/Home/Forum/ref?id=${refId}`,
                dataType: "html",
                timeout: configurations.refFetchingTimeout,
                success: data => {
                    itemContainer.innerHTML = data;
                    const item = itemContainer.firstElementChild as HTMLElement;
                    this.recordRef(refId, item, 'global');
                    resolve(item);
                },
                error: (_, status, error) => {
                    let message: string;
                    if (status === 'timeout') {
                        message = `获取引用内容超时！`;
                    } else {
                        message = `获取引用内容失败：${error}`;
                    }
                    const errorSpan = document.createElement('span');
                    errorSpan.classList.add('fto-ref-view-error');
                    errorSpan.textContent = message;
                    resolve(errorSpan);
                }
            });
        });
    }

    processItemElement(item: HTMLElement, refId: number) {
        if (item.querySelector('.fto-ref-view-error')) {
            return item;
        }
        if (!ViewHelper.getThreadID(item)) {
            const errorSpan = document.createElement('span');
            errorSpan.classList.add('fto-ref-view-error');
            errorSpan.textContent = `引用内容不存在！`;
            this.recordRef(refId, item, 'page');
            return errorSpan;
        }
        return item;
    }

}
