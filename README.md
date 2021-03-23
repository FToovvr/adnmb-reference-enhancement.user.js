# A岛引用查看增强

[![GitHub 仓库](https://img.shields.io/badge/GitHub-仓库-blue)](https://github.com/FToovvr/adnmb-reference-enhancement.user.js)
[![开源许可协议](https://img.shields.io/github/license/FToovvr/adnmb-reference-enhancement.user.js?label=%E5%BC%80%E6%BA%90%E8%AE%B8%E5%8F%AF%E5%8D%8F%E8%AE%AE)](https://github.com/FToovvr/adnmb-reference-enhancement.user.js/blob/master/LICENSE)
[![A岛相关串](https://img.shields.io/badge/A岛相关串-留言反馈-green)](https://adnmb3.com/t/36028029)

[![Greasy Fork 页面](https://img.shields.io/badge/Greasy%20Fork-页面-orange)](https://greasyfork.org/en/scripts/423659)
[![Userscript 安装](https://img.shields.io/badge/Userscript-安装-red)](https://greasyfork.org/scripts/423659-a岛引用查看增强/code/A岛引用查看增强.user.js)

## 使用前请注意

* 本脚本尚未完成，正在积极更新中；
* 暂时不保证稳定性，可能会有影响使用的 bug；
    * 如果功能出现问题，欢迎到 [Greasy Fork 上本脚本的页面](https://greasyfork.org/en/scripts/423659/feedback)或者[岛上的此串](https://adnmb3.com/t/36028029)来反馈；
* 请确保使用最新版本的浏览器。
    * 本脚本用到了很多较新标准中的功能（如 `async`/`await`、箭头函数等等）。
    * IE 就不要想了…

### 功能

* 缓存引用内容
  * [x] 已获取过的引用内容会缓存，不会重复请求服务器
  * [x] 本页已存在的内容会直接缓存，同页引用不会再请求服务器
  * [ ] 持久化存储缓存
* 引用查看
  * [x] 可以不限层级地查看引用内容中的引用内容
  * [x] （A岛本身已有功能）可以悬浮显示引用内容
  * [x] 可以固定引用内容（在引用内容悬浮/关闭时，点击引用链接或「📌」按钮；再次点击「📌」按钮取消固定）
  * [x] 可以折叠固定的引用内容（在引用内容固定时，点击引用链接会切换折叠与否）
* 引用加载
  * [x] 在引用内容加载时，会指明正在加载并显示已经过去的时间
  * [x] 为引用内容加载设置了超时时限
  * [x] 如果引用内容消失，会指明
  * [x] 加载失败（如超时、引用内容消失）时，可以通过点击「🔄」按钮重试