import { Model } from "../Model";

type LoadingStatus = 'loading' | 'succeed' | 'failed';

export function init(enabled: () => boolean, setupRoot: (root: HTMLElement | HTMLDocument) => void) {
    let isLoading = false;
    window.addEventListener('scroll', async (e) => {
        if (!enabled()) {
            return;
        }

        // https://stackoverflow.com/a/40370876
        if ((window.innerHeight + window.pageYOffset) < (document.body.offsetHeight - 2)) {
            return;
        }

        if (isLoading) {
            return;
        }
        isLoading = true;

        await (async () => {
            let nextPageUrl: string | null = null;
            document.querySelectorAll('a[href]:not(.fto-loaded)').forEach((a) => {
                a = a as HTMLAnchorElement;
                if (a.innerHTML === "下一页") {
                    a.classList.add('fto-loaded');
                    nextPageUrl = a.getAttribute('href');
                }
            });
            if (!nextPageUrl) {
                return;
            }

            const div = document.createElement('div');
            div.classList.add('uk-container', 'fto-auto-loaded');
            div.dataset.loadingStatus = 'loading';
            const pageNumber = Number((/[?/]page[=/](\d+)/.exec(nextPageUrl) ?? [null, null])[1]);
            div.dataset.pageNumber = String(pageNumber);
            const hContent = document.querySelector('#h-content')!;
            hContent.append(document.createElement('hr'), div);

            let resp: Response;
            try {
                resp = await Model.fetchWithTimeout(nextPageUrl, (spentMs) => {
                    if (div.dataset.loadingStatus !== 'loading') {
                        return false;
                    }
                    div.textContent = `正在加载第 ${pageNumber} 页… ${(spentMs / 1000.0).toFixed(2)}s`;
                    return true;
                });
            } catch (e) {
                div.textContent = Model.fetchErrorToReadableMessage(e);
                return;
            }

            const domParser = new DOMParser();
            const template = domParser.parseFromString(await resp.text(), 'text/html');
            const loadedContent = (() => {
                const ukContainer = template.querySelector('#h-content > .uk-container');
                if (!ukContainer) { return null; }
                const threadList = ukContainer.querySelector(':scope > .h-threads-list');
                if (!threadList) { return null; }
                return [
                    ukContainer.querySelector('#h-content-top-nav'),
                    threadList,
                    ukContainer.querySelector('.h-pagination'),
                    template.querySelector('#h-footer'),
                ];
            })();

            div.innerHTML = '';

            if (!loadedContent) {
                div.dataset.loadingStatus = 'failed';
                div.textContent = "页面无内容";
                return;
            }

            div.dataset.loadingStatus = 'succeed';
            if (loadedContent[0]) {
                div.append(loadedContent[0], document.createElement('hr'));
            }
            div.append(loadedContent[1]!);
            if (loadedContent[2]) {
                div.append(loadedContent[2]);
            }
            if (loadedContent[3]) {
                hContent.append(loadedContent[3]);
            }

            setupRoot(div);
        })();

        isLoading = false;
    });
}