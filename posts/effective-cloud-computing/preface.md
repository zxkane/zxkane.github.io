---
title: "真的会用云服务吗？"
description : "这是“如何高效使用云服务”系列文章的引子。"
aliases:
- /posts/effective-cloud-computing/
- /posts/effective-cloud-computing-series/
date: 2019-01-07
lastmod: 2019-01-08
draft: false
series:
- effective-cloud-computing
thumbnail: "https://www.thebluediamondgallery.com/tablet/images/cloud-computing.jpg"
isCJKLanguage: true
tags:
- 云计算
- 阿里云
---
这是“如何高效使用云服务”系列文章的引子。该系列将讲述如何利用各种公有云服务来安全合规、高质量、快速、低成本的打造产品/系统，帮助企业（特别是中小微创业团队）在人少，钱缺的情况下做到最高效率。

<!--more-->
## 个人使用公有云服务的经历

### 初会

最早是2012年在parttime项目中开始接触使用云计算服务，当时的初创团队也是希望用最低的成本来验证idea，所有使用了云服务来做POC。目前国内市场最领先的云计算厂商[阿里云那时也才提供公有云服务不到1年][1]。由于云产品不够成熟，加上团队技能经验不足，自助互助的渠道不畅，导致最初的云计算使用体验并不好，团队没有选择完全使用云服务构建产品。

### IaaS or PaaS

云计算兴起的早期，云厂商大致分为两类，提供基于[IaaS][2]或[PaaS][3]的云服务。2013年起也有尝试不同类型的厂商平台，虽然也较好的完成一些体量不大的项目，但要在他们上面构建大规模用户产品或企业级应用，在云产品完善度上或支持开发团队协作上都有不少欠缺，还有大量的基础工作或限制留给了开发团队自身解决。

### All-in Cloud

2015年我开始一个微电影项目创业，团队是不到10人的微型团队。从效率和成本考虑，我们将所有的服务都放到了阿里云上。我们使用了多种云产品，例如，云主机（多种OS），对象存储，图片处理，CDN，SLB，人脸识别等云服务，结合[Devops][4]集成开发，测试，部署pipeline来加速产品的迭代和更新。每名工程师承担一种以上角色，前端，后端，运维，数据，视频渲染等。合理使用云厂商的各种产品帮我们在质量，效率，成本上获得巨大的收益。

2017年我加入了一家企业财税服务的初创公司负责技术团队。公司在2018年获得了B轮投资，研发产品运营团队近百人，属于中等规模。随着各种开源技术的巨大进步和影响逐步扩大，[微服务][microservice]架构的流行，基于[Kubernetes][k8s]的[Cloud Native Computing][cncf]兴起。我们利用云厂商的容器服务，[DBaaS][dbaas]，Big Data，AI技术等用最高效的方式将数个单体应用平滑升级到高可用弹性的分布式架构，更好的满足复杂业务的多变需求，公司服务也在全国300多个城市落地，服务了数十万中小微企业客户。同时利用云厂商的VPC，访问控制，WAF等产品进行权限控制和安全保护，有效防范了因为团队扩大管理难度增加而出现安全问题。

## 缘起

作为一名云计算服务6年的用户，见证了开源技术的快速发展和影响力急剧扩大，感受到整个云计算行业和厂商的长足进步。见证了国内头部云厂商从最初的使用难度颇大，现在成长为万众创业的首选服务商。

过去的一年参加了数场技术会议，其中主题大多偏向于由知名的互联网或行业公司分享在海量数据下的技术应用。这些技术广泛涉及开发语言、应用架构、性能、大数据、机器学习和人工智能等领域，无论这些公司是否采用开源产品，在团队单兵技术能力，专业的分工，对开源项目的研发投入力量，这些经验和方法并不是中小企业可以轻易借鉴的。而云计算厂商将这些领域最基础通用的能力以产品的方式输出给用户，以按用量的方式计费，使用更简单，有专业团队维护和支持。中小团队就应该将这些事情“外包”给云厂商，集中精力到业务上，将最大的研发资源用到最核心最关键的地方。

我同团队同事沟通中，和公司研发候选人面试交流中，发现许多从业者对云计算服务了解还不够深入。许多人理解中的云计算服务只有云服务器、云数据库等少数产品，需要自己安装维护应用服务器、负载均衡、收集日志等等看起来每个应用都绕不开的事情。他们的认知还停留在排查应用异常还需要远程登录服务器看日志，做不到合理的根据场景高效组合使用云服务，将云服务当做水电一样，作为最基础的能力加速业务的发展。业务上是采用名气大且成熟的产品，尝试新鲜看起来酷但不那么完善的产品，还是二次开发或自研开发？要做出最优的选择需要工程师能够从有高度的全局角度来考量，甚至在短时间内能用POC项目验证多个可选的方案，基于数据做出最终的选择。

这就是这个系列的缘起，之后我将陆续分享使用那些高效的云服务产品的场景、心得、体会等等。

> 封面图片[Cloud Computing][cover]引用自[The Blue Diamond Gallery][blue-diamond] under [CC BY-SA 3.0][cc-3]

[1]: https://baike.baidu.com/item/%E9%98%BF%E9%87%8C%E4%BA%91#4
[2]: https://en.wikipedia.org/wiki/Infrastructure_as_a_service
[3]: https://en.wikipedia.org/wiki/Platform_as_a_service
[4]: https://en.wikipedia.org/wiki/DevOps
[microservice]: https://en.wikipedia.org/wiki/Microservices
[k8s]: https://kubernetes.io/
[cncf]: https://www.cncf.io/
[dbaas]: https://en.wikipedia.org/wiki/Cloud_database
[cover]: http://www.thebluediamondgallery.com/tablet/c/cloud-computing.html
[cc-3]: http://creativecommons.org/licenses/by-sa/3.0/
[blue-diamond]: http://www.thebluediamondgallery.com/