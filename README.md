# A岛引用查看增强

[![GitHub 仓库](https://img.shields.io/badge/GitHub-仓库-blue)](https://github.com/FToovvr/adnmb-reference-enhancement.user.js)
[![开源许可协议](https://img.shields.io/github/license/FToovvr/adnmb-reference-enhancement.user.js?label=%E5%BC%80%E6%BA%90%E8%AE%B8%E5%8F%AF%E5%8D%8F%E8%AE%AE)](https://github.com/FToovvr/adnmb-reference-enhancement.user.js/blob/master/LICENSE)
[![A岛相关串](https://img.shields.io/badge/A岛相关串-留言反馈-green)](https://adnmb3.com/t/36028029)

[![Greasy Fork 页面](https://img.shields.io/badge/Greasy%20Fork-页面-orange)](https://greasyfork.org/en/scripts/423659)
[![Userscript 安装](https://img.shields.io/badge/Userscript-安装-red)](https://greasyfork.org/scripts/423659-a岛引用查看增强/code/A岛引用查看增强.user.js)

## 示例

![Screen Recording 2021-03-23 at 2 27 07 AM 2 2021-03-29 18_42_05](https://user-images.githubusercontent.com/69508340/112825838-d237f280-90be-11eb-9096-6e62f66f82f4.gif)

## 使用前请注意

* 本脚本尚未完成，正在持续更新中；
* 暂时不保证稳定性，可能会有影响使用的 bug；
    * 如果功能出现问题，欢迎到 [Greasy Fork 上本脚本的页面](https://greasyfork.org/en/scripts/423659/feedback)或者[岛上的此串](https://adnmb3.com/t/36028029)来反馈；
* 请确保使用最新版本的浏览器；
    * 本脚本用到了很多较新标准中的功能（如 `async`/`await`、箭头函数等等）。
    * IE 就不要想了…
* 本脚本主要围绕A岛的查看引用功能做改进。
    * 如果在此方面有什么建议或改进方案，欢迎提出来。
    * 也欢迎考虑直接提交 PR 参与完善本项目。

## 兼容性

### [nmbhs](https://greasyfork.org/en/scripts/24096-nmbhs) - 隐藏sage串的内容

部分用户反映不兼容。

本脚本单独实现了可替代该脚本的功能。该功能默认禁用，如有需要可以在配置窗口中启用。

### [页面自动拼接](https://greasyfork.org/en/scripts/389621-%E9%A1%B5%E9%9D%A2%E8%87%AA%E5%8A%A8%E6%8B%BC%E6%8E%A5)

该脚本本身与A岛相性不好。无论是否使用本脚本，新页面中的引用都无法预览。

本脚本单独实现了可替代该脚本的功能。该功能默认禁用，如有需要可以在配置窗口中启用。请留意在A岛范围内禁用原脚本。
## 路线图

详见 [TODO.md](TODO.md)。

逐渐咕咕咕化 ( ´_っ\`)

* 0.4 完整实现自动打开引用功能（默认关闭）
* 0.5 实现持久化缓存
* 0.6 支持移动网页端

## 功能

* 缓存引用内容
  * [x] 已获取过的引用内容会缓存，不会重复请求服务器
  * [x] 本页已存在的内容会直接缓存，同页引用不会再请求服务器
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

## Build

> `npm run build`

输出的文件为 `/dist/out.user.js`。
