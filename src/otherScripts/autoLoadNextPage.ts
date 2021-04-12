import { Model } from "../Model";

type LoadingStatus = 'loading' | 'succeed' | 'failed';


export class AutoLoadNextPage {
    private isLoading = false;

    private hContent: HTMLElement;
    private setupRoot: (root: HTMLElement | HTMLDocument) => void;

    constructor(enabled: () => boolean, setupRoot: (root: HTMLElement | HTMLDocument) => void) {
        this.hContent = document.querySelector('#h-content')! as HTMLElement;
        this.setupRoot = setupRoot;

        window.addEventListener('scroll', async (e) => {
            if (!enabled()) {
                return;
            }

            // https://stackoverflow.com/a/40370876
            if ((window.innerHeight + window.pageYOffset) < (document.body.offsetHeight - 2)) {
                return;
            }

            if (this.isLoading) {
                return;
            }
            this.isLoading = true;

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
            div.dataset.targetUrl = nextPageUrl;
            const pageNumber = Number((/[?/]page[=/](\d+)/.exec(nextPageUrl) ?? [null, null])[1]);
            div.dataset.pageNumber = String(pageNumber);
            this.hContent.append(document.createElement('hr'), div);

            await this.loadlContent(div);

            this.isLoading = false;
        });
    }

    private async loadlContent(div: HTMLDivElement) {
        div.dataset.loadingStatus = 'loading';
        div.textContent = `正在加载第 ${div.dataset.pageNumber!} 页…`;

        let resp: Response;
        try {
            resp = await Model.fetchWithTimeout(div.dataset.targetUrl!, (spentMs) => {
                if (div.dataset.loadingStatus !== 'loading') {
                    return false;
                }
                div.textContent = `正在加载第 ${div.dataset.pageNumber!} 页… ${(spentMs / 1000.0).toFixed(2)}s`;
                return true;
            });
        } catch (e) {
            div.textContent = Model.fetchErrorToReadableMessage(e);
            div.dataset.loadingStatus = 'failed';
            this.prependReloadButton(div);
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
            this.prependReloadButton(div);
            return;
        }

        window.history.replaceState(null, '', div.dataset.targetUrl!);

        div.dataset.loadingStatus = 'succeed';
        if (loadedContent[0]) {
            div.append(loadedContent[0], document.createElement('hr'));
        }
        div.append(loadedContent[1]!);
        if (loadedContent[2]) {
            div.append(loadedContent[2]);
        }
        if (loadedContent[3]) {
            const oldFooter = this.hContent.querySelector('#h-footer');
            if (oldFooter) {
                oldFooter.id = '';
                oldFooter.classList.add('fto-old-h-footer');
            }
            this.hContent.append(loadedContent[3]);
        }

        this.setupRoot(div);
    }

    private prependReloadButton(div: HTMLDivElement) {
        const span = document.createElement('span');
        span.classList.add('fto-button');
        span.textContent = '🔄';
        span.addEventListener('click', async () => {
            // FIXME: 网络异常后 Error 明明被 catch 到了，但是 this.isLoading 没有设回 false
            // if (this.isLoading) {
            //     return;
            // }
            this.isLoading = true;
            await this.loadlContent(div);
            this.isLoading = false;
        });
        div.prepend(span);
    }
}



