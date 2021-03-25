import { Model } from './Model';
import { Controller } from './Controller';
import configurations, { canConfigurate } from './configurations';

function entry() {

    if (window.disableAdnmbReferenceViewerEnhancementUserScript) {
        console.log("「A岛引用查看增强」用户脚本被禁用（设有变量 `window.disableAdnmbReferenceViewerEnhancementUserScript`），将终止。");
        return;
    }

    const model = new Model();
    if (!model.isSupported) {
        console.log("浏览器功能不支持「A岛引用查看增强」用户脚本，将终止。");
        return;
    }

    if (canConfigurate() && typeof GM_registerMenuCommand !== 'undefined') {
        GM_registerMenuCommand("打开配置窗口", () => { configurations.openConfigurationWindow(); }, 'c');
    }

    // 销掉原先的预览方法
    document.querySelectorAll('font[color="#789922"]').forEach((elem) => {
        if (elem.textContent.startsWith('>>')) {
            const newElem = elem.cloneNode(true);
            elem.parentElement.replaceChild(newElem, elem);
        }
    });

    Controller.setupStyle();

    const controller = new Controller(model);
    controller.setupContent(document.body);
}

entry();