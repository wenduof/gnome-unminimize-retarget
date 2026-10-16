# Unminimize Retarget

[English](README.md) | 简体中文

一个极小的 GNOME Shell 扩展，修复 **Chromium / Electron** 窗口（Chrome、
VS Code、Obsidian、Slack……）恢复最小化时**"窗口先落到偏右下的位置、再跳回
正确位置"**的毛病——且不牺牲任何动画。

如果在 GNOME 上从 dock / 任务栏恢复 Chrome、Brave、VS Code 或 Obsidian
窗口时，窗口先落到偏移位置、再跳回正确位置，这就是修复方案。

## 特性

- **无副作用** —— 只对"正在恢复动画中、且动画期间真的移动了"的窗口生效。
  GTK 应用、最大化窗口完全不受影响（实测 gedit/nautilus 从不触发该路径）。
- **完全可退** —— 单个 ~70 行的 `extension.js`；无配置项、无守护进程、
  无外部进程、无网络。`gnome-extensions disable
  unminimize-retarget@wenduof.github.io` 加删除目录即完全还原，零残留。
- **稳定降级** —— 用的是 shell/mutter 内部接口；若未来 GNOME 改动导致
  扩展报错，只会退回原来的（有毛病的）动画，绝不会破坏桌面。

兼容 GNOME 42（Ubuntu 22.04）到 51（Ubuntu 26.10），X11 与 Wayland，
HiDPI。两个分支，同一逻辑。

## 症状

非最大化的 Chromium 系窗口：最小化到 dock，点图标恢复。恢复动画会停在
真实位置**偏右下**处，然后窗口明显向左上**跳**一下。GTK 应用无此现象。

上游长期未修的同源报告：

- [mutter #2317](https://gitlab.gnome.org/GNOME/mutter/-/issues/2317) —— 2022 年至今未修
- [Launchpad #824267](https://answers.launchpad.net/ubuntu/+question/824267) —— Ubuntu 26.04，Chrome/Brave
- [KWin #518357](https://bugs.kde.org/show_bug.cgi?id=518357) —— Plasma Wayland 下的 Chrome
- [dash-to-dock #2085](https://github.com/micheleg/dash-to-dock/issues/2085)

## 根因

用 `scripts/measure.sh`（~50 Hz 轮询 `xwininfo`/`xprop`）实测；完整数据见
[docs/measurements.md](docs/measurements.md)：

| 时刻 | 事件 | X 几何（物理像素） |
|---|---|---|
| t+0 | `WM_STATE` → Normal（恢复） | `(162,860) 2820x1682` ← 动画用的是这个 |
| t+25ms | **客户端自己重新 configure 窗口** | `(130,840) 2884x1766` ← 真实位置 |
| t+400ms | 动画结束，mutter 重新同步 actor | 肉眼可见的跳变 |

Chromium 的 X11 窗口代码会在 `WM_STATE` Iconic/Normal 切换后 ~25–50ms
重新应用自己的窗口边界。而 GNOME Shell 的 `_unminimizeWindow()` 只在动画
启动瞬间读一次 `get_buffer_rect()`，然后花 400ms 补间到这个已过期的矩形；
动画结束时 mutter 解冻窗口 actor 并同步到真实 buffer rect——这就是跳回。
GTK 应用在最小化/恢复时从不改自己的几何，所以不受影响。

## 修复原理

恢复动画进行期间，监听该窗口的 `position-changed` / `size-changed` 信号，
把正在运行的位置补间**改指向新的 buffer rect**。动画于是平滑地弯向真实
终点，而不是过期终点。

## 安装

### GNOME 45–50（Ubuntu 23.10+、Fedora 39+……）

```bash
git clone https://github.com/wenduof/gnome-unminimize-retarget
cd gnome-unminimize-retarget   # main 分支
mkdir -p ~/.local/share/gnome-shell/extensions/unminimize-retarget@wenduof.github.io
cp extension.js metadata.json ~/.local/share/gnome-shell/extensions/unminimize-retarget@wenduof.github.io/
# 重启 shell（X11: Alt+F2 输 r；Wayland: 注销登录），然后：
gnome-extensions enable unminimize-retarget@wenduof.github.io
```

若 enable 后 `gnome-extensions info` 仍显示 `INITIALIZED`，disable 再
enable 一次即可——这是 uuid 变更后 shell 的怪癖，不是扩展错误。

### GNOME 42（Ubuntu 22.04）

用 [`gnome-42`](../../tree/gnome-42) 分支（逻辑相同，classic `imports.*`
写法；GNOME 42 无法加载 ESM 扩展）：

```bash
git clone -b gnome-42 https://github.com/wenduof/gnome-unminimize-retarget
cd gnome-unminimize-retarget
mkdir -p ~/.local/share/gnome-shell/extensions/unminimize-retarget@wenduof.github.io
cp extension.js metadata.json ~/.local/share/gnome-shell/extensions/unminimize-retarget@wenduof.github.io/
```

## 兼容性

| GNOME | 分支 | 状态 |
|---|---|---|
| 42.9（Ubuntu 22.04，X11，HiDPI） | `gnome-42` | 已目测验证 |
| 45–49 | `main` | 预期可用（相关 windowManager 代码未变），未实测 |
| 50.1（Ubuntu 26.04，Wayland/XWayland） | `main` | 真机验证通过（复现 + 修复 + 压力测试） |
| 51（2026-09-16 稳定版） | `main` | 预期可用（已核对 gnome-shell 51.0 源码），未实测 |

## 卸载

```bash
gnome-extensions disable unminimize-retarget@wenduof.github.io
rm -rf ~/.local/share/gnome-shell/extensions/unminimize-retarget@wenduof.github.io
```

## 不装扩展的替代缓解

在 Wayland 会话里，Electron 应用可以走原生路径，从而完全绕开这条 X11
几何路径（也就绕开了这个 bug）：

```bash
code --ozone-platform=wayland        # 或其他应用的等价参数
```

这是客户端侧缓解，不是修复（原生 Wayland Electron 另有自己的毛边）；
本扩展修的是 X11/XWayland 路径本身。

## 已知限制

- 依赖 shell/mutter 私有内部接口（`Main.wm._unminimizing`、
  `global.window_manager` 信号、`position-changed`）。未来 GNOME 大版本
  可能需要适配；扩展出错时自动退回原动画，不影响桌面。
- 客户端自移窗口这一行为本身未修——Chromium 仍会在动画中途改几何；
  本扩展只是让合成器跟上它。根治在上游（见上方链接）。

## 上游

- Chromium：X11 窗口在 `WM_STATE` 切换后短时间内被自己重新 configure
  （crbug 待提交）。
- gnome-shell：`_unminimizeWindow()` 应在 `position-changed` 时改指向
  （MR 待提交）。若被合并，本扩展即退役——这是目标。

## 许可

GPL-2.0-or-later
