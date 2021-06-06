import { Model } from './Model';
import { Controller } from './Controller';
import configurations, { canConfigurate } from './configurations';

import { AutoLoadNextPage } from './otherScripts/autoLoadNextPage';
import { HideSageContent } from './otherScripts/hideSageContent';

function entry() {

    if (window.frameElement) {

        console.log("检测到本脚本在 iframe 中执行，将不继续执行。"
            + "如果您在使用「自动拼接页面」类脚本，新加载的页面中的引用大概率会无法查看（无论是否使用本脚本）。"
            + "为此，本脚本单独实现了「自动拼接页面」功能，您可以在配置窗口中启用。"
            + "请确保在启用该功能的同时在A岛范围内禁用原先的「自动拼接页面」脚本。");

        return;
    }

    if (window.disableAdnmbReferenceViewerEnhancementUserScript) {
        console.log("「A岛引用查看增强」用户脚本被禁用（设有变量 `window.disableAdnmbReferenceViewerEnhancementUserScript`），将终止。");
        return;
    }

    const model = new Model();
    if (!model.isSupported) {
        console.log("浏览器功能不支持「A岛引用查看增强」用户脚本，将终止。");
        return;
    }

    if (/^\/m(obile)?(\/|$)/i.test(window.location.pathname)) {
        console.log("「A岛引用查看增强」用户脚本暂不支持网页「手机版」，将终止。");
        return;
    }

    if (canConfigurate() && typeof GM_registerMenuCommand !== 'undefined') {
        GM_registerMenuCommand("打开配置窗口", () => { configurations.openConfigurationWindow(); }, 'c');
    }

    // 销掉原先的预览方法
    document.querySelectorAll('font[color="#789922"]').forEach((elem) => {
        if (elem.textContent!.startsWith('>>')) {
            const newElem = elem.cloneNode(true);
            elem.parentElement!.replaceChild(newElem, elem);
        }
    });

    Controller.setupStyle();

    const controller = new Controller(model);
    const hideSageContent = new HideSageContent(configurations.hideSageContent);
    configurations.onConfigurationChange(() => {
        hideSageContent.enabled = configurations.hideSageContent;
    });

    window.fto = {
        AdnmbReferenceViewerEnhancement: {
            debug: { model, controller },
            setup: (document: HTMLElement | HTMLDocument) => {
                controller.setupRoot(document);
                hideSageContent.setup(document, configurations.openAdminSageContent);
            },
        },
    };

    window.fto!.AdnmbReferenceViewerEnhancement!.setup!(document);

    const autoLoadNextPage = new AutoLoadNextPage(
        () => configurations.autoLoadNextPage,
        window.fto!.AdnmbReferenceViewerEnhancement!.setup!,
    );

}

switch (GM_info.scriptHandler) {
case "Tampermonkey":
    entry();
    break;
case "Violentmonkey":
    // @ts-expect-error JQuery
    $(document).ready(entry);
    break;
case "Greasemonkey":
default:
    const fn = () => {
        if (unsafeWindow.hasOwnProperty('h')) {
            entry();
        } else {
            setTimeout(fn, 10);
        }
    };
    setTimeout(fn, 10);
}