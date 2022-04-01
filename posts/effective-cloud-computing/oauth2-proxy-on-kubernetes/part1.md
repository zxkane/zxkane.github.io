---
title: "为Kubernetes中任意应用添加基于oauth2的认证保护 (上)"
description : "企业IAM实战(一)"
date: 2019-02-03
draft: false
thumbnail: posts/effective-cloud-computing/oauth2-proxy-on-kubernetes/images/cover.jpg
aliases:
- /posts/effective-cloud-computing/oauth2-proxy-on-kubernetes/
- /posts/effective-cloud-computing-series/oauth2-proxy-on-kubernetes/
thumbnail: /posts/effective-cloud-computing/oauth2-proxy-on-kubernetes/images/cover.jpg
series:
- effective-cloud-computing
categories:
- kubernetes
isCJKLanguage: true
tags:
- 云计算
- IAM
- kubernetes
- oauth2
- 钉钉
- dingtalk
---
企业随着业务的发展，必然会部署各种各样的IT系统。出于安全性的考虑，一些系统仅可企业内部使用，甚至仅开放给企业部分部门员工使用。

这些IT系统大致可分为两类，

1. 系统本身不支持任何认证机制，例如资讯或文档类系统。需要增加认证保护，能够限制非企业员工访问即可。系统运维通常的做法是，为站点设置[HTTP Basic认证][http-basic-auth]保护。由于[HTTP Basic认证][http-basic-auth]是通过预设的用户、密码认证，认证信息比较容易泄露。即使定期更换密码，但需要额外的机制通知用户密码的变更，用户体验也不好。
2. 系统自身支持认证，甚至支持多种认证机制。比如最常用的开源CI/CD工具，[Jenkins][jenkins]内置支持本地数据库认证、通过[插件][jenkins-plugins]支持多种第三方系统集成认证。如果大量的IT系统都有一套独立的用户管理，随着企业的员工的变更，用户的增删等操作对系统管理员来说是不小的工作量。同时，也很容易由于人为疏忽，造成资产、数据的安全隐患。

假设企业自身已经有了一套OA系统包含员工、组织结构管理，例如，国内目前最为普及流行的[钉钉][dingtalk]或[企业微信][wechat-enterprise]。我们完全可以提供一套基于[oauth 2.0协议][oauth2]的认证方式，让以上两类IT系统使用企业已有的OA系统([钉钉][dingtalk]或[企业微信][wechat-enterprise])来实现登录认证。做到这一点后，企业无论有多少IT系统都不再需要额外管理用户的成本，并且也避免了数据安全隐患。

<!--more-->

[钉钉][dingtalk]通过[钉钉开放平台][dingtalk-open-dev]提供的API开放了许多钉钉内部的能力，例如，[身份验证][dingtalk-auth]、[通讯录管理][dingtalk-org-management]等等。然而[钉钉的三方网站登录接口][dingtalk-third-party-auth]并不是标准的[oauth 2.0协议][oauth2]实现，我们需要通过一个[oauth2 proxy][dingtalk-oauth2-proxy]代理工具实现将[钉钉的三方网站登录][dingtalk-third-party-auth]兼容[oauth2][oauth2]协议。同理，使用[这个oauth2代理工具][oauth2-proxy]，可以使用[Google][oauth2-proxy-google]、[Facebook][oauth2-proxy-facebook]等三方网站作为统一认证方式。

有了基于[钉钉的oauth2代理][dingtalk-oauth2-proxy]作为企业统一登录方式，对于上面两大类系统的认证需求解决方案分别如下，

1. 部署在[Kubernetes][k8s]中无内置认证机制的Web应用，通过[nginx-ingress][nginx-ingress]的[外部OAUTH认证][nginx-ingress-oauth-auth]实现基于oauth2的安全认证。
1. [Jenkins][jenkins]可以通过[反向代理插件][jenkins-reverse-proxy-auth-plugin]实现使用oauth2认证登录。

在[下篇][part2]中，我们将图文详解如何一步步实现为一个无认证的企业文档Web应用添加基于[钉钉的统一认证][dingtalk-auth]。

[http-basic-auth]: https://en.wikipedia.org/wiki/Basic_access_authentication
[jenkins]: https://jenkins.io/
[jenkins-plugins]: https://plugins.jenkins.io/#
[oauth2]: https://oauth.net/2/
[dingtalk]: https://www.dingtalk.com/
[wechat-enterprise]: https://work.weixin.qq.com/
[dingtalk-open-dev]: https://open-dev.dingtalk.com
[dingtalk-auth]: https://open-doc.dingtalk.com/microapp/serverapi2/vt6khw
[dingtalk-org-management]: https://open-doc.dingtalk.com/microapp/serverapi2/cqfmel
[dingtalk-third-party-auth]: https://open-doc.dingtalk.com/microapp/serverapi2/kymkv6
[dingtalk-oauth2-proxy]: https://github.com/zxkane/oauth2_proxy
[oauth2-proxy]: https://github.com/bitly/oauth2_proxy
[oauth2-proxy-google]: https://github.com/bitly/oauth2_proxy#google-auth-provider
[oauth2-proxy-facebook]: https://github.com/bitly/oauth2_proxy#facebook-auth-provider
[k8s]: https://kubernetes.io/
[nginx-ingress]: https://kubernetes.github.io/ingress-nginx/
[nginx-ingress-oauth-auth]: https://kubernetes.github.io/ingress-nginx/examples/auth/oauth-external-auth/
[jenkins-reverse-proxy-auth-plugin]: https://plugins.jenkins.io/reverse-proxy-auth-plugin
[part2]: {{< relref "part2.md" >}}
