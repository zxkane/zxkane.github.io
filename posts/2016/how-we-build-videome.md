---
title: V秘是如何构建的
date: 2016-04-07
tags: 
- web-2.0 
- architecture
- 网站架构
categories: 
- blogging 
isCJKLanguage: true
---

春天来了，[V秘][videome]大家庭也新增了两位10后的传人。新爸爸经过一番忙乱后，希望在这里与大家分享[V秘][videome]的架构，共同探讨如何快速的构建高可用，高性能的Web服务。

[V秘][videome]致力于提供最好的在线视频制作云平台。让用户随时随地零门槛的快速制作出高质量高清晰度的视频，来纪念记录生活中有意义的时刻，同时将这份快乐传递给更多的家人朋友一起分享。

然而要可靠的可扩展的实现这样看似简单的需求，其背后确由众多知名开源技术，可靠的云服务，不间歇的监控运维来实现和保证的。

<!-- more -->

[V秘][videome]架构的基本目标就是要实现，

* 服务的高扩展性。有有效可靠的方法支撑数万并发到数十万，百万及更多的并发请求。
* 服务的高可用性。各种服务都是多实例的集群，某些服务故障后，集群中的其他实例仍然能够提供服务。
* 服务的自动化构建。从代码到服务部署上线是一套自动化的流程，越少的人工介入保证了服务的可用性。
* 系统的实时监控。7x24小时的监控保证服务的可用性，当监控到数据异常或服务停止运行能及时告警引入人工运维团队。

更多细节请参阅下面的[slides][the-slide],

<iframe src="//www.slideshare.net/slideshow/embed_code/key/EaBKeYtNuNyFPL" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/zxkane/how-we-build-vme" title="How we build Videome" target="_blank">How we build Videome</a> </strong> from <strong><a href="//www.slideshare.net/zxkane" target="_blank">Meng Xin Zhu</a></strong> </div>

欢迎留言与我们探讨你的心得和建议。

[videome]: https://vme360.com
[the-slide]: http://www.slideshare.net/zxkane/how-we-build-vme