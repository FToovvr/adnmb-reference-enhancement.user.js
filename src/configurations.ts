
// TODO: 配置决定

class Configurations {

    defaults = {
        // 折叠时保持的高度，低于此高度将不可折叠
        collapsedHeight: 80,
        // 悬浮时引用内容的不透明度
        floatingOpacity: '100%', // '90%',
        // 悬浮淡入的时长（暂不支持淡出）
        fadingDuration: 0, // '80ms',
        // 如为真，在固定时点击图钉按钮会直接关闭引用内容，而非转为悬浮
        clickPinToCloseView: false,
        // 获取引用内容多少毫秒算超时
        refFetchingTimeout: 10000, // : 10 秒
        // 在内容成功加载后是否还显示刷新按钮
        showRefreshButtonEvenIfRefContentLoaded: false,
        // 如为真，存在缓存的引用内容会自动以折叠的形式固定
        autoOpenRefViewIfRefContentAlreadyCached: false,
        // 如为真，展开一处引用将展开当前已知所有其他处指向相同内容的引用
        // TODO: 考虑也自动展开之后才遇到的指向相同内容的引用？
        // 尚未实现
        autoOpenOtherRefViewsWithSameRefIdAfterOpenOne: false,
    };

    get collapsedHeight() {
        return this.defaults.collapsedHeight;
    }

    get floatingOpacity() {
        return this.defaults.floatingOpacity;
    }

    get fadingDuration() {
        return this.defaults.fadingDuration;
    }

    get clickPinToCloseView() {
        return this.defaults.clickPinToCloseView;
    }

    get refFetchingTimeout() {
        return this.defaults.refFetchingTimeout;
    }

    get showRefreshButtonEvenIfRefContentLoaded() {
        return this.defaults.showRefreshButtonEvenIfRefContentLoaded;
    }

    get autoOpenRefViewIfRefContentAlreadyCached() {
        return this.defaults.autoOpenRefViewIfRefContentAlreadyCached;
    }

    get autoOpenOtherRefViewsWithSameRefIdAfterOpenOne() {
        return this.defaults.autoOpenOtherRefViewsWithSameRefIdAfterOpenOne;
    }

}

export default new Configurations();