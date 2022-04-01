---
title: "Amazon Alexa Android版本国内登录问题"
description : "Alexa Android国内登录临时解决方案"
date: 2019-08-14
draft: false
categories:
- blogging
thumbnail: "https://cdn.vox-cdn.com/thumbor/QTgOq0XkZr5H8IHTM3aNa15yDXM=/0x0:694x388/1200x800/filters:focal(292x139:402x249)/cdn.vox-cdn.com/uploads/chorus_image/image/58385367/Screen_Shot_2018_01_19_at_2.15.47_PM.1516388236.png"
isCJKLanguage: true
tags:
- AWS
- Amazon Alexa
- Troubleshoot
---

近期需要做一些Alexa上的开发，在手机上安装了Amazon Alexa，一直得到下面这样的错误提示而无法登录。

> Connection Timed Out.

<!--more-->

先后尝试了翻墙、更改语言等方法仍然不可登录。并且在网络上也没有找到可用的方案，决定抓包研究下为什么我的账号始终无法登录。

通过抓取Alexa登录时发送的数据包，发现他访问了amazon.cn等数个cn域名下的一系列服务，看来这些服务中部分已无法提供正常服务，导致登录一直出现上面的错误。

Amazon Alexa作为一个服务全球用户的app，应该是判断手机用户在大陆地区后使用了配置在大陆地区的这些服务。

临时解决方案的思路就是设置系统或app，让他无法获取到手机真实所在的地理位置，那么Alexa app会使用默认的全球服务器来请求数据。

以下是临时解决方案的步骤，

1. 从Play市场安装Alexa app。如果已安装清空app数据。
2. 禁用app Location权限(默认就是禁用的)。
3. 更改系统语言为英文，设置时区为任意美国时区。
4. 拔掉SIM卡，或者禁用所有SIM卡。

打开Alexa app，使用已有或新注册Amazon账号即可登录。