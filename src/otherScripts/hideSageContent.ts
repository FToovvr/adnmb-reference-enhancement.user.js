import { ViewHelper } from "../ViewHelper";

export class HideSageContent {

    private _enabled: boolean;

    get enabled() { return this._enabled; }
    set enabled(enabled: boolean) {
        const style = document.querySelector('#fto-style-adnmb-reference-enhancement-other-hide-sage-content')!;
        if (enabled) {
            style.innerHTML = `
                .fto-marked-sage .fto-force-display-toggle::before {
                    cursor: pointer;
                    content: ' 隐藏 ';
                    font-size: small;
                }
                .fto-marked-sage:not(.fto-force-display) .fto-force-display-toggle::before {
                    cursor: pointer;
                    content: ' 展开 ';
                    font-size: small;
                }
                .fto-marked-sage:not(.fto-force-display) > .h-threads-item-main {
                    display: none;
                }
                .fto-marked-sage:not(.fto-force-display) > .h-threads-tips:not(.uk-text-danger) {
                    display: none;
                }
                .fto-marked-sage:not(.fto-force-display) > .h-threads-item-replys {
                    display: none;
                }
            `;
        } else {
            style.innerHTML = '';
        }
    }

    constructor(enabled: boolean) {
        ViewHelper.addStyle('', 'fto-style-adnmb-reference-enhancement-other-hide-sage-content');

        this.enabled = enabled;
    }

    setup(root: HTMLElement | HTMLDocument, openRedNameContent: boolean) {
        root.querySelectorAll('.uk-icon-thumbs-down').forEach((thumbsDown) => {
            const postItem = thumbsDown.closest('[data-threads-id]')!;
            if (!postItem) {
                return;
            }
            if (window.location.pathname.startsWith('/t/') && postItem.classList.contains('h-threads-item')) {
                // 点进去了 sage 串，不隐藏
                return;
            }
            if (openRedNameContent && postItem.querySelector('.h-threads-info-uid font[color="red"]')) {
                postItem.classList.add('fto-force-display');
            }
            postItem.classList.add('fto-marked-sage');
            const toggle = document.createElement('span');
            toggle.classList.add('fto-force-display-toggle');
            toggle.addEventListener('click', (e) => {
                postItem.classList.toggle('fto-force-display');
            });
            const sageTips = thumbsDown.closest('.h-threads-tips')!;
            sageTips.append('', '[', toggle, ']');
        });
    }

}