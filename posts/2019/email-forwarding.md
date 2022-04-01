---
title: "免费邮件转发服务"
description : "零花费搭建邮件服务器"
date: 2019-12-18
thumbnail: https://www.hover.com/wp-content/uploads/2013/08/forward-mail1.jpg
draft: false
categories:
- blogging
isCJKLanguage: true
tags:
- 邮件转发
- 技巧
---
在拥有域名后，通常希望创建一些自有域名下的邮箱来收取不同用途的邮件，同时不希望为这部分功能付费:smiley:。使用免费的企业邮箱(比如网易企业邮箱、阿里云企业邮箱)是一种选择。这时就需要配置邮件地址和邮件客户端来收取邮件，如果有多个邮箱地址，配置会特别麻烦。有时，这些企业邮箱的收件服务会莫名其妙的丢失一些邮件。

<!--more-->
这种场景下，**邮件转发服务**是一种非常好的解决方案。无需搭建邮件服务器或申请免费邮件服务，只需要配置域名的**邮件MX**解析到转发邮件收发件服务，同时使用**DNS TXT** record配置转发规则，即可将所以发送的自有域名下的邮件转发到已有的邮箱地址！:cool:

特别安利[Forward Email][forward-email]服务，一个免费而且是**开源**的邮件转发服务。

如上面介绍的，只需要为域名`mydomain.com`创建如下3条DNS解析记录，

| 名称 | TTL	| 记录类型 | 优先级 | 记录的内容 |
| ----------- | ----- | ------ | ---- | ------------ |
| @ 或者 空白 | 3600 |	MX | 10 | mx1.forwardemail.net |
| @ 或者 空白 | 3600 | MX | 20 | mx2.forwardemail.net |
| @ 或者 空白 | 3600 | TXT | 20 | forward-email=niftylettuce@gmail.com |


所有发往`@mydomain.com`的邮件将被转发到邮箱`niftylettuce@gmail.com`。:v: 

更多配置选项请查看[文档][forward-email-conf-guide]。

[forward-email]: https://github.com/forwardemail/free-email-forwarding
[forward-email-conf-guide]: https://github.com/forwardemail/free-email-forwarding#how-do-i-get-started-and-set-up-email-forwarding