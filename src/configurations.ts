/// <reference path="../types/GM_config/gm_config.js" />

import { ViewHelper } from './ViewHelper';

import configWindowStyle from './configWindow.scss';
import { AutoOpenConfig } from './AutoOpenConfig';

export function canConfigurate() {
    return typeof GM_configStruct !== 'undefined';
}

class Configurations {

    id = 'fto-config-window-reference-enhancement';
    styleId = 'fto-style-config-window-reference-enhancement';

    gmc: GM_configStruct;

    private onConfigurationChangeCallbacks: (() => void)[] = [];

    constructor() {
        if (!canConfigurate()) { return; }

        ViewHelper.addStyle(configWindowStyle, this.styleId);

        this.gmc = new GM_configStruct({
            id: this.id,
            title: "「A岛引用查看增强」 用户脚本 设置",
            fields: {
                collapsedHeight: {
                    section: ["引用视图", "外观表现"],
                    label: "折叠时高度（px）",
                    labelPos: 'left',
                    type: 'float',
                    title: "引用视图被折叠后保持的高度。"
                        + "低于此高度的引用内容不可折叠。",
                    default: 80,
                },
                floatingOpacity: {
                    label: "悬浮不透明度（%）",
                    labelPos: 'left',
                    type: 'float',
                    title: "悬浮时引用视图的不透明度。",
                    default: 100,
                },
                fadingDuration: {
                    label: "悬浮淡入时长（毫秒）",
                    labelPos: 'left',
                    type: 'float',
                    title: "为什么只有淡入？因为淡出的代码不能一步到位，摸了 (ゝ∀･)",
                    default: 0,
                },

                onHoverOnRefLink: {
                    section: [null, "行为"],
                    label: "当鼠标位于引用链接上时…",
                    labelPos: 'left',
                    type: 'radio',
                    options: ["无行为", "悬浮展现引用内容"],
                    default: "悬浮展现引用内容",
                },
                onClickPinOnOpenRefView: {
                    label: "在引用视图固定时点击「📌」…",
                    labelPos: 'left',
                    type: 'radio',
                    options: ["悬浮引用视图", "关闭引用视图"],
                    default: "悬浮引用视图",
                },

                autoOpenTarget: {
                    section: [null, "自动打开"],
                    label: "自动打开…",
                    labelPos: 'left',
                    type: 'radio',
                    title: "",
                    options: ["无", "内容已有缓存的引用视图"],
                    default: "无",
                },
                autoOpenStatus: {
                    label: "自动打开后引用视图…",
                    labelPos: 'left',
                    type: 'radio',
                    title: "",
                    options: ["完整展开", "折叠"],
                    default: "折叠",
                },
                autoOpenDepthLimit: {
                    label: "自动打开层数限制（「0」为不限）",
                    labelPos: 'left',
                    type: 'int',
                    title: "",
                    default: 1,
                },
                autoOpenOtherRefViewsAfterOpenedOneWithSameRef: {
                    label: "打开一个引用视图后，自动打开其他相同引用的引用视图",
                    labelPos: 'left',
                    type: 'checkbox',
                    title: "",
                    default: false,
                },


                refFetchingTimeout: {
                    section: "引用内容加载",
                    label: "超时时限（毫秒）（「0」为不限）",
                    labelPos: 'left',
                    type: 'float',
                    title: "获取引用内容多久算超时。",
                    default: 10000,
                },
                showRefreshButtonEvenIfRefContentLoaded: {
                    label: "总是显示刷新按钮",
                    labelPos: 'left',
                    type: 'checkbox',
                    title: "即使引用内容成功加载，也显示刷新按钮。"
                        + "无论选定与否，目前都不会在加载途中显示刷新按钮。",
                    default: false,
                }
            },
            frame: (() => {
                const frame = document.createElement('div');
                frame.style.display = 'none';
                document.body.append(frame);
                return frame;
            })(),
            events: {
                save: () => {
                    for (const fn of this.onConfigurationChangeCallbacks) {
                        fn();
                    }
                },
                open: () => {
                    const frame = (this.gmc as any).frame as HTMLDivElement;
                    frame.setAttribute('style', '');
                    const header = frame.querySelector('.config_header') as HTMLElement;
                    header.style.padding = '6px 0';
                    frame.prepend(header);
                    frame.querySelector('#fto-config-window-reference-enhancement_saveBtn').textContent = "保存";
                    frame.querySelector('#fto-config-window-reference-enhancement_closeBtn').textContent = "关闭";
                    frame.querySelector('#fto-config-window-reference-enhancement_resetLink').textContent = "将所有设置重置为默认状态";
                },
            },
        });

    }

    openConfigurationWindow() {
        this.gmc.open();
    }

    onConfigurationChange(fn: () => void) {
        this.onConfigurationChangeCallbacks.push(fn);
    }

    getValue(name: string): any {
        return canConfigurate() ? this.gmc.get(name) : null;
    }

    defaults = {
        // 折叠时保持的高度，低于此高度将不可折叠
        collapsedHeight: 80,
        // 悬浮时引用内容的不透明度
        floatingOpacity: 100, // 90,
        // 悬浮淡入的时长（暂不支持淡出）
        fadingDuration: 0, // '80ms',

        //
        onHoverOnRefLink: "悬浮展现引用内容",
        // 如为真，在固定时点击图钉按钮会直接关闭引用内容，而非转为悬浮
        onClickPinOnOpenRefView: "悬浮引用视图",

        autoOpenTarget: "无",
        autoOpenStatus: "折叠",
        autoOpenDepthLimit: 1,
        autoOpenOtherRefViewsAfterOpenedOneWithSameRef: false,


        // 获取引用内容多少毫秒算超时
        refFetchingTimeout: 10000, // : 10 秒
        // 在内容成功加载后是否还显示刷新按钮
        showRefreshButtonEvenIfRefContentLoaded: false,
    };

    get collapsedHeight(): number {
        return this.getValue('collapsedHeight')
            ?? this.defaults.collapsedHeight;
    }

    get floatingOpacity(): number {
        return this.getValue('floatingOpacity')
            ?? this.defaults.floatingOpacity;
    }

    get fadingDuration(): number {
        return this.getValue('fadingDuration')
            ?? this.defaults.fadingDuration;
    }

    get hoverRefLinkToFloatRefView(): boolean {
        return (this.getValue('onHoverOnRefLink') ?? this.defaults.onHoverOnRefLink)
            === "悬浮展现引用内容";
    }

    get clickPinToCloseView(): boolean {
        return (this.getValue('onClickPinOnOpenRefView') ?? this.defaults.onClickPinOnOpenRefView)
            === "关闭引用视图";
    }

    get refFetchingTimeout(): number {
        return this.getValue('refFetchingTimeout')
            ?? this.defaults.refFetchingTimeout;
    }

    get autoOpenRConfig(): AutoOpenConfig {
        return new AutoOpenConfig(
            ((this.getValue('autoOpenTarget') ?? this.defaults.autoOpenTarget) === '内容已有缓存的引用视图')
                ? 'ViewsWhoseContentHasBeenCached' : null,
            ((this.getValue('autoOpenStatus') ?? this.defaults.autoOpenStatus) === '完整展开')
                ? 'open' : 'collapsed',
            this.getValue('autoOpenDepthLimit') ?? this.defaults.autoOpenDepthLimit,
            this.getValue('autoOpenOtherRefViewsAfterOpenedOneWithSameRef')
            ?? this.defaults.autoOpenOtherRefViewsAfterOpenedOneWithSameRef,
        );
    }

    get showRefreshButtonEvenIfRefContentLoaded(): boolean {
        return this.getValue('showRefreshButtonEvenIfRefContentLoaded')
            ?? this.defaults.showRefreshButtonEvenIfRefContentLoaded;
    }

}

export default new Configurations();
