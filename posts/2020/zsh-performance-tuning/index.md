---
title: "oh-my-zsh性能调优思路"
description : "记录一次oh-my-zsh性能问题排查过程"
date: 2020-04-22
draft: false
thumbnail: https://ohmyz.sh/img/OMZLogo_BnW.png
categories:
- blogging
isCJKLanguage: true
tags:
- zsh
- oh-my-zsh
- performance-tuning
- trobule-shooting
---
[Z shell][zsh]搭配[oh-my-zsh][oh-my-zsh]自定义配置已成为众多Linux/Macosx用户的标准terminal配置。

最近遇到在`zsh`中执行任意命令都变得特别慢(哪怕简单执行`ls`也要花费肉眼可见的1，2秒钟)，这里记录下如何排查[Z shell][zsh]下启用[oh-my-zsh][oh-my-zsh]的性能问题。

<!--more-->

### 性能问题症状

突然某天起在终端中执行任意命令，都至少要花费1，2秒（肉眼计数），该命令才会完成执行并退出到终端开始接受新的输入。

我当前主要使用的终端是[iTerm2][iterm2]，执行命令后，在终端Tab的title bar上能显式的看到`git`命令也被执行了。

尝试了其他的shell，比如`bash`，是没有这个问题。基本断定问题同`zsh`相关。更多问题描述乃至动画截屏，可以参见[这个issue][issue-report]。

### zsh + oh-my-zsh 性能问题分析

[oh-my-zsh][oh-my-zsh]其实就是提供[zsh][zsh]的定制化配置，主要包括Theme主题和各种软件的插件。

#### oh-my-zsh 插件

通常[oh-my-zsh][oh-my-zsh]中内置或三方社区提供的插件是导致性能降低甚至互相冲突的主要原因。排查思路也很简单，通过逐个禁用已加载的插件来测试是否可以解决问题。

用文本编辑器打开当前用户的`~/.zshrc`配置，找到`plugins`开头的配置行，例如，

```bash
plugins=(
        git
        osx
##      gradle
        brew
##      command-not-found
        github
#       gnu-utils
##      mvn
        python
        pip
#       screen
        vi-mode
        docker
##      docker-compose
        node
##      spring
        mosh
#       httpie
##      sudo
        tmux
##      kubectl
##      helm
        golang
        history
        history-substring-search
        zsh-autosuggestions
        zsh-syntax-highlighting
)
```

通过行首添加`#`来禁用`oh-my-zsh`插件，启动新的终端窗口或tab来验证是否该插件是引起问题的根源。

在我的配置中，出现过因为启用过多插件，导致新建终端需要10来秒钟。但因为创建终端不是一个高频的需求，这个性能通常来说还是可以忍受。

#### oh-my-zsh 主题

在我的这个问题中，即使将所有插件都禁用了，命令执行后退出速度还是没有改善，`git`命令仍然有被执行。这时我尝试更换不同`oh-my-zsh`内置主题来排查问题。但是使用了包括默认主题`robbyrussell`，极简主题`ys`在内的多个主题都无法解决该问题。

最后直接禁止`oh-my-zsh`使用主题，问题没有了！

然而`oh-my-zsh`主题是对zsh的极大增强，改善了默认的用户体验，没有主题扩展使用起来会非常不习惯。

### 小结

最终试用了另一个社区维护的知名`zsh`主题[Pure][zsh-pure]，性能问题得到了解决:v: 同时也满足了主题对zsh输入输出用户体验的增强 :blush:

希望这里分享的`oh-my-zsh`性能的调优思路，可以帮助到有类似需要的各位。

> 将来社区对这个[问题][issue-report]如有进一步的反馈，将会做更新。


[zsh]: https://zh.wikipedia.org/wiki/Z_shell
[oh-my-zsh]: https://ohmyz.sh/
[issue-report]: https://github.com/ohmyzsh/ohmyzsh/issues/8833
[iterm2]: https://www.iterm2.com/
[zsh-pure]: https://github.com/sindresorhus/pure