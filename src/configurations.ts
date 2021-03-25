/// <reference path="../types/GM_config/gm_config.js" />

import configWindowStyle from './configWindow.scss';

export function canConfigurate() {
    return typeof GM_configStruct !== 'undefined';
}

class Configurations {

    gmc: GM_configStruct;

    private onConfigurationChangeCallbacks: (() => void)[] = [];

    constructor() {
        if (!canConfigurate()) { return; }
        this.gmc = new GM_configStruct({
            id: "adnmb-reference-enhancement",
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
                    label: "当鼠标位于引用链接上时",
                    labelPos: 'left',
                    type: 'radio',
                    options: ["无行为", "悬浮展现引用内容"],
                    default: "悬浮展现引用内容",
                },
                onClickPinOnOpenRefView: {
                    label: "在引用视图固定时点击「📌」",
                    labelPos: 'left',
                    type: 'radio',
                    options: ["悬浮引用视图", "关闭引用视图"],
                    default: "悬浮引用视图",
                },

                autoOpenTarget: {
                    section: [null, "自动打开"],
                    label: "自动打开的对象",
                    labelPos: 'left',
                    type: 'radio',
                    title: "",
                    options: ["无", "内容已缓存的引用视图"],
                    default: "无",
                },
                autoOpenStatus: {
                    label: "自动打开后引用视图的状态",
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
                autoOpenScope: {
                    label: "自动打开的作用范围",
                    labelPos: 'left',
                    type: 'radio',
                    title: "",
                    options: ["只在初次加载页面和引用视图时尝试自动打开", "在缓存了新的引用内容后自动打开其他相同内容的引用视图"],
                    default: "只在初次加载页面和引用视图时尝试自动打开",
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
            events: {
                open: () => {
                    const frame = (this.gmc as any).frame as HTMLIFrameElement;
                    frame.setAttribute('style', `
                        position: fixed; z-index: 9999;
                        left: 50%; top: 50%; transform: translate(-50%, -50%);
                        width: fit-content; height: 500px; max-height: 80%;
                        border: 1px solid black;
                    `);
                },
                save: () => {
                    for (const fn of this.onConfigurationChangeCallbacks) {
                        fn();
                    }
                },
            },
            css: configWindowStyle,
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
        hoverRefLinkToFloatRefView: true,
        // 如为真，在固定时点击图钉按钮会直接关闭引用内容，而非转为悬浮
        clickPinToCloseView: false,
        // 获取引用内容多少毫秒算超时
        refFetchingTimeout: 10000, // : 10 秒
        // 如为真，存在缓存的引用内容会自动以折叠的形式固定
        autoOpenRefViewIfRefContentAlreadyCached: false,
        // // 如为真，展开一处引用将展开当前已知所有其他处指向相同内容的引用
        // // TODO: 考虑也自动展开之后才遇到的指向相同内容的引用？
        // // 尚未实现
        // autoOpenOtherRefViewsWithSameRefIdAfterOpenOne: false,
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
        return (this.getValue('onHoverOnRefLink') === "悬浮展现引用内容")
            ?? this.defaults.hoverRefLinkToFloatRefView;
    }

    get clickPinToCloseView(): boolean {
        return (this.getValue('onClickPinOnOpenRefView') === "关闭引用视图")
            ?? this.defaults.clickPinToCloseView;
    }

    get refFetchingTimeout(): number {
        return this.getValue('refFetchingTimeout')
            ?? this.defaults.refFetchingTimeout;
    }

    get autoOpenRefViewIfRefContentAlreadyCached(): boolean {
        return false // this.getValue('autoOpenRefViewIfRefContentAlreadyCached')
            || this.defaults.autoOpenRefViewIfRefContentAlreadyCached;
    }

    get showRefreshButtonEvenIfRefContentLoaded(): boolean {
        return this.getValue('showRefreshButtonEvenIfRefContentLoaded')
            ?? this.defaults.showRefreshButtonEvenIfRefContentLoaded;
    }

}

export default new Configurations();
