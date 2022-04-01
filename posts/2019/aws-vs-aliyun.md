---
title: "公有云对比"
description : "AWS vs. Aliyun"
date: 2019-06-26
thumbnail: https://cdn01.bespinglobal.com/wp-content/uploads/2017/05/aws-vs-alicloud.jpg
draft: false
categories:
- blogging
isCJKLanguage: true
tags:
- 云计算
- AWS
- 阿里云
---
AWS是全球云计算领域的领跑者，它在计算、存储、网络等方面都做出了很多创新，同时也是其他云计算厂商学习及模仿的对象。

阿里云是目前国内市场份额最大的云计算厂商，其份额[超过了第二至五位厂商的总和][aliyun-2018-market-share]，份额领先优势比AWS在全球还要显著，同时[全球份额也超过IBM来到第四][aliyun-2018-global-market-share]。

本文将对AWS和阿里云核心服务做一个简要对比，以及这两家厂商发展方向的一些个人见解。

<!--more-->

云计算，其核心服务就是**计算**、**存储**及**网络**。这些基本能力的稳定性，功能完善性决定了云计算厂商能力的下限。

{{< figure src="/posts/2019/aws-vs-aliyun/core-service.jpg" alt="云计算核心服务" >}}

除了上面提到的三大计算机核心组件能力，下面这些能力也是云计算中非常重要的组成部分，

{{< figure src="/posts/2019/aws-vs-aliyun/critical-capabilities.jpg" alt="云计算关键能力" >}}

- 按量计费
- 资源编排（也就是平台作为代码）
- 云资源的认证及授权
- API
  
基于上面列举的云计算核心服务和关键能力，我们来看看哪些方面是AWS的强项。

{{< figure src="/posts/2019/aws-vs-aliyun/aws-pros.jpg" alt="AWS's Pros" >}}

AWS作为云计算的领军厂商，在计算、存储、网络这三大核心一直在不停的创新中，且被友商在不停的模仿。计算方面，AWS首先推出了Lambda无服务器计算引擎实现按量使用的全托管服务，生产可用的GPU实例(单虚机可配置最高64块GPU卡，而阿里云默认仅售卖2块GPU卡)，[基于Nitro架构的EC2实例][aws-nitro-based-ec2]为客户送上了升性能降价的好事。

S3作为AWS最早推出的云计算服务，仍然在不停的创新演化中。目前S3达到了11个9的持久性，为满足客户不同的存储需要，又推出了S3 Glacier、Glacier Deep Archive等存储方案。持续推出了Amazon Athena, Redshift, S3 select等服务及工具解决海量数据的大数据处理。

AWS一直将PAYG(Pay-As-You-Go)的按量计费模型贯穿在各种服务中。无论是EC2(包括GPU实例)，ELB，NAT网关等等都提供小时级的按量计费。阿里云在这方面还有较多的改进空间，例如GPU实例最小售卖时长为一周，SLB首先按规格售卖，NAT网关按自然日计费。

IAM为云上的资源提供了最细粒度的授权管理，AWS各个服务严格按最细粒度控制授权，满足企业的权限管理。在我使用过的数个阿里云服务中，多次遇到较新的服务IAM设计不周，权限粒度过大，甚至功能无法工作的情况下就上线发布了。

AWS CloudFormation提供了云上资源编排管理，实现了资源的代码化，版本化(通常称为的Infrastrucure as Code)。将云端资源的管理运维提升到一个新的层次。

AWS提供了三种方式管理云上资源，Web Console, CLI以及API。这三种方式，尽最大努力提供一致的功能。

AWS同时是一个云计算的生态，各类三方云服务厂商通过Marketplace售卖各类SaaS，PaaS服务，形成一个云计算用户，三方服务Vendor，AWS三方共赢的局面。

总得说来，AWS持续的在云计算核心服务和关键服务投入，不停的创新，保证了AWS整体服务的领先。

接下来看看阿里云的强项。

{{< figure src="/posts/2019/aws-vs-aliyun/aliyun-pros.jpg" alt="Aliyun's Pros" >}}

阿里云在提供基本的计算、存储、网络外，额外提供了很多SaaS服务，例如，Application Performance Monitor， Performance Testing Service, 日志服务，链路追踪服务，数据库管理服务等。这些服务显然同阿里云有更好的集成，对用户来说提供了开箱即用的解决方案。而这也是一把双刃剑，利用平台捆绑的优势抢占合作开发商的市场，长期来说利用平台垄断不利于基于阿里云的技术服务创业。

总之，阿里云在云计算核心服务上同AWS比还有差距，但他在PaaS/SaaS服务上发展不错，更加容易提供全套基于阿里云的解决方案。由于阿里云在国内数据中心数量上的优势加上从万网收购的BGP资源，其服务在国内访问网络延迟会更低。

最后，谈一个很有意思的话题，是否需要考虑云厂商的锁定。

{{< figure src="/posts/2019/aws-vs-aliyun/cloud-lock-in-issue.jpg" alt="Lock-in" >}}

Kubernetes事实上成为容器编排平台，首先考虑使用K8S及[CNCF landscape][cncf-landscape]下的项目作为应用运行环境，减少可能的迁移和学习成本。

对不同用量的公司来说，考虑云厂商锁定的维度完全不一样。创业型公司或仍在快速发展业务中的中大型企业首先应该选择可靠性高，解决方案多，易学习的云厂商，尽可能利用云厂商的各种服务做到快速高效可靠的推进业务，将尽量多的精力、人力投入到业务相关的事情上。业务稳定的大型公司，可以使用多数据中心实现关键业务的高可用性，跨云完全不应该作为高可用的必要解决途径。另外，云厂商绝对会投入额外的人力，优先级支持他们的大客户，甚至为这类客户调整产品研发优先级或协同完成某些功能，这样绝对是个双赢的局面，Netflix和AWS的互相成就就是一个很好的例子。没有特别必要的原因，不要轻易投入精力将业务从服务已经很稳定的云厂商迁移到多云平台上，那样往往是白白耗费力气。

> 下面是slide的最新完整版本，

{{< gdocs src="https://docs.google.com/presentation/d/e/2PACX-1vSaKV41ItphpZVxL371It7WN55FKQqEdXUTjYgFAA2nQ7IT5AbvNaONldvvLtoG87hB8EG1ASbS0HMY/embed?start=false&loop=false&delayms=5000" >}}

[aliyun-2018-market-share]: http://www.sohu.com/a/302064020_465914
[aliyun-2018-global-market-share]: https://www.canalys.com/newsroom/cloud-market-share-q4-2018-and-full-year-2018
[aws-nitro-based-ec2]: https://www.infoq.cn/article/2017/11/Nitro-amazon-EC2
[cncf-landscape]: https://landscape.cncf.io/
