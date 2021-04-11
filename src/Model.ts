import { RefItem } from './view/RefItem';

import configurations from './configurations';

export type RecordRefCallback = (refId: number, rawItem: HTMLElement, error: Error | null, scope: 'page' | 'global') => void;

export class Model {

    refCache: { [refId: number]: [HTMLElement, Error | null] } = {};
    refsInFetching = new Set<number>();
    refSubscriptions = new Map<number, Set<string>>();

    get isSupported() {
        if (!window.indexedDB) {
            return false;
        }
        return true;
    }

    async getRefCache(refId: number): Promise<[HTMLElement, Error | null] | null> {
        const [elem, error] = this.refCache[refId] ?? [null, null];
        if (!elem) { return null; }
        return [elem.cloneNode(true) as HTMLElement, error];
    }


    async recordRef(refId: number, rawItem: HTMLElement, error: Error | null, scope: 'page' | 'global' = 'page') {
        this.refCache[refId] = [rawItem.cloneNode(true) as HTMLElement, error];
    }

    async subscribeForLoadingItemElement(refId: number, viewId: string, ignoresCache: boolean = false,
        doneCallbace: (viewIds: Set<string>, content: HTMLElement | null, error: Error | null) => void,
        reportSpentTimeCallback: (masterViewId: string, viewIds: Set<string>, spentMs: number) => boolean) {
        if (!this.refSubscriptions.has(refId)) {
            this.refSubscriptions.set(refId, new Set());
        }
        this.refSubscriptions.get(refId)!.add(viewId);

        const cache = ignoresCache ? null : await this.getRefCache(refId);
        if (cache) {
            const [itemCache, error] = cache;
            doneCallbace(new Set([viewId]), itemCache, error);
        } else if (!this.refsInFetching.has(refId)) {
            this.refsInFetching.add(refId);

            const [item, error2] = await this.fetchItemElement(refId, viewId, reportSpentTimeCallback);
            doneCallbace(this.refSubscriptions.get(refId)!, item, error2);
            this.refsInFetching.delete(refId);
        }
    }

    async fetchItemElement(refId: number, viewId: string,
        reportSpentTimeCallback: (masterViewId: string, viewIds: Set<string>, spentMs: number) => boolean
    ): Promise<[HTMLElement | null, Error | null]> {
        const itemContainer = document.createElement('div');
        try {
            const resp = await Model.fetchWithTimeout(`/Home/Forum/ref?id=${refId}`, (spentMs) => {
                return reportSpentTimeCallback(viewId, this.refSubscriptions.get(refId)!, spentMs);
            });
            itemContainer.innerHTML = await resp.text();
        } catch (e) {
            return [null, new Error(Model.fetchErrorToReadableMessage(e))];
        }

        const item = itemContainer.firstElementChild as HTMLElement;
        const error = RefItem.contentExists(item) ? null : new Error("引用内容不存在！");
        this.recordRef(refId, item, error, error ? 'page' : 'global');
        return [item, error];
    }

    static async fetchWithTimeout(input: RequestInfo,
        reportSpentTimeCallback?: ((spentMs: number) => boolean)
    ) {
        const abortController = new AbortController();
        return Promise.race([
            fetch(input, { signal: abortController.signal }),
            new Promise((_, reject) => {
                let spentMs = 0;
                const intervalId = setInterval(() => {
                    spentMs += 20;
                    if (configurations.refFetchingTimeout
                        && spentMs >= configurations.refFetchingTimeout) {
                        reject(new Error('Timeout'));
                        abortController.abort();
                        clearInterval(intervalId);
                        return;
                    }
                    const shouldContinue = reportSpentTimeCallback?.(spentMs);
                    if (!shouldContinue) {
                        clearInterval(intervalId);
                    }
                }, 20);
            }),
        ]) as Promise<Response>;
    }

    static fetchErrorToReadableMessage(e: any): string {
        if (e instanceof Error) {
            if (e.message === 'Timeout') {
                return `获取引用内容超时！`;
            } else {
                return `获取引用内容失败：${e.toString()}`;
            }
        }
        return `获取引用内容失败：${String(e)}`;
    }

}
