// TODO: 配置决定
// 折叠时保持的高度，低于此高度将不可折叠
export const collapsedHeight = 80;
// 悬浮时引用内容的不透明度
export const floatingOpacity = '100%'; // '90%';
// 悬浮淡入的时长（暂不支持淡出）
export const fadingDuration = 0; // '80ms';
// 如为真，在固定时点击图钉按钮会直接关闭引用内容，而非转为悬浮
export const clickPinToCloseView = false;
// 获取引用内容多少毫秒算超时
export const refFetchingTimeout = 10000; // = 10 秒
// 在内容成功加载后是否还显示刷新按钮
export const showRefreshButtonEvenIfRefContentLoaded = false;
// 如为真，存在缓存的引用内容会自动以折叠的形式固定
export const autoOpenRefViewIfRefContentAlreadyCached = false;
// 如为真，展开一处引用将展开当前已知所有其他处指向相同内容的引用
// TODO: 考虑也自动展开之后才遇到的指向相同内容的引用？
// 尚未实现
export const autoOpenOtherRefViewsWithSameRefIdAfterOpenOne = false;