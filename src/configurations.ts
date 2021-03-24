/// <reference path="../types/GM_config/gm_config.js" />

class Configurations {

    gmc: GM_configStruct;

    private onConfigurationChangeCallbacks: (() => void)[] = [];

    static get canConfigurate() {
        return typeof GM_configStruct !== 'undefined';
    }

    constructor() {
        if (!Configurations.canConfigurate) { return; }
        this.gmc = new GM_configStruct({
            id: "adnmb-reference-enhancement",
            fields: {
                collapsedHeight: {
                    section: "引用视图",
                    label: "折叠高度（px）",
                    labelPos: "left",
                    type: 'float',
                    title: "引用视图被折叠后保持的高度。"
                        + "低于此高度的引用内容不可折叠。",
                    default: 80,
                },
                floatingOpacity: {
                    label: "悬浮不透明度（%）",
                    labelPos: "left",
                    type: 'float',
                    title: "悬浮时引用视图的不透明度。",
                    default: 100,
                },
                fadingDuration: {
                    label: "悬浮淡入时长（毫秒）",
                    labelPos: "left",
                    type: 'float',
                    title: "为什么只有淡入？因为淡出的代码不能一步到位，摸了 (ゝ∀･)",
                    default: 0,
                },
                clickPinToCloseView: {
                    label: "固定状态下点击「📌」直接关闭引用视图",
                    labelPos: "left",
                    type: 'checkbox',
                    title: "如不选定，固定状态下点击「📌」会使引用视图变为悬浮状态。",
                    default: false,
                },
                autoOpenRefViewIfRefContentAlreadyCached: {
                    section: [null, "自动固定"],
                    label: "自动固定已有缓存的引用视图",
                    labelPos: "left",
                    type: 'checkbox',
                    title: "如选定且引用视图对应的内容存在缓存，会自动以折叠状态固定。"
                        + "（页面已存在的内容与获取过一次的引用内容都会被缓存）",
                    default: false,
                },
                // autoOpenOtherRefViewsWithSameRefIdAfterOpenOne: {
                //     label: "一同固定其他相同内容的引用视图",
                //     type: 'checkbox',
                //     title: "获取到引用内容后，自动固定其他对应了相同内容的引用视图。请配合上一个选项使用。",
                // },
                refFetchingTimeout: {
                    section: "加载引用",
                    label: "超时时限（毫秒）",
                    labelPos: "left",
                    type: 'float',
                    title: "获取引用内容多久算超时。"
                        + "如为「0」则代表无超时时限。",
                    default: 10000,
                },
                showRefreshButtonEvenIfRefContentLoaded: {
                    label: "总是显示刷新按钮",
                    labelPos: "left",
                    type: 'checkbox',
                    title: "即使引用内容成功加载，也显示刷新按钮。"
                        + "无论选定与否，目前都不会在加载途中显示刷新按钮。",
                    default: false,
                }
            },
            events: {
                save: () => {
                    for (const fn of this.onConfigurationChangeCallbacks) {
                        fn();
                    }
                }
            }
        });

        window.debugOpenConfigurationWindow = () => this.openConfigurationWindow();
    }

    openConfigurationWindow() {
        this.gmc.open();
    }

    onConfigurationChange(fn: () => void) {
        this.onConfigurationChangeCallbacks.push(fn);
    }

    getValue(name: string): any {
        return Configurations.canConfigurate ? this.gmc.get(name) : null;
    }

    defaults = {
        // 折叠时保持的高度，低于此高度将不可折叠
        collapsedHeight: 80,
        // 悬浮时引用内容的不透明度
        floatingOpacity: 100, // 90,
        // 悬浮淡入的时长（暂不支持淡出）
        fadingDuration: 0, // '80ms',
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
            || this.defaults.collapsedHeight;
    }

    get floatingOpacity(): number {
        return this.getValue('floatingOpacity')
            || this.defaults.floatingOpacity;
    }

    get fadingDuration(): number {
        return this.getValue('fadingDuration')
            || this.defaults.fadingDuration;
    }

    get clickPinToCloseView(): boolean {
        return this.getValue('clickPinToCloseView')
            || this.defaults.clickPinToCloseView;
    }

    get refFetchingTimeout(): number {
        return this.getValue('refFetchingTimeout')
            || this.defaults.refFetchingTimeout;
    }

    get autoOpenRefViewIfRefContentAlreadyCached(): boolean {
        return this.getValue('autoOpenRefViewIfRefContentAlreadyCached')
            || this.defaults.autoOpenRefViewIfRefContentAlreadyCached;
    }

    // get autoOpenOtherRefViewsWithSameRefIdAfterOpenOne(): boolean {
    //     return this.getValue('autoOpenOtherRefViewsWithSameRefIdAfterOpenOne') || this.defaults.autoOpenOtherRefViewsWithSameRefIdAfterOpenOne;
    // }

    get showRefreshButtonEvenIfRefContentLoaded(): boolean {
        return this.getValue('showRefreshButtonEvenIfRefContentLoaded')
            || this.defaults.showRefreshButtonEvenIfRefContentLoaded;
    }

}

export default new Configurations();