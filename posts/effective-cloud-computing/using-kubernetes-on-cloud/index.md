---
title: "不要自建Kubernetes"
description : "使用云厂商托管Kubernetes的好处，多到你想不到。"
date: 2019-01-22
lastmod: 2019-02-01
draft: false
thumbnail: posts/effective-cloud-computing/using-kubernetes-on-cloud/images/cover.png
aliases:
- /posts/effective-cloud-computing-series/using-kubernetes-on-cloud/
series:
- effective-cloud-computing
categories:
- kubernetes
isCJKLanguage: true
tags:
- 云计算
- 阿里云
- AWS
- kubernetes
---
这是“如何高效使用云服务”系列文章的首篇分享。可能有朋友好奇为什么不是从云计算最基础的服务--计算资源[ECS][ecs]/[EC2][ec2]讲起呢？在[Cloud Native][cloud-native]已经被越来越接受的今天，基于[Kubernetes][k8s]部署、编排应用的方式已经是业界的事实标准。无论是互联网巨头，传统500强企业，还是创业团队都在使用或规划使用[Kubernetes][k8s]作为应用程序的自动化部署、可扩展管理平台。在云计算平台，虚拟机越来越不需要单独的管理，在绝大多数的业务场景下，它们只是作为容器集群所管理的计算资源。甚至虚拟机的创建到销毁整个生命周期管理都可以由[Kubernetes][k8s]根据集群的负载来自动完成。

所有主流的云计算厂商都在解决方案中力推托管的[Kubernetes][k8s]，[AWS][aws]的[EKS][eks]，[Azure][azure]上的[AKS][aks]，当然少不了Google家[GCP][gcp]上的[Kubernetes Engine][kubernetes-engine]。国内[阿里云][aliyun-k8s]，[腾讯云][tke]等每一个公有云玩家也都基于开源[Kubernetes][k8s]推出了托管服务。如果一家云计算厂商在提供托管[Kubernetes][k8s]这一服务上没跟上业界的步伐，将来极大可能被淘汰出这个市场。

<!--more-->

## 托管的Kubernetes类型

以国内的阿里云为例，目前提供了两大类三种不同的[Kubernetes托管服务][aliyun-managed-k8s]。

- 经典Dedicated Kubernetes模式。这种模式下用户可以选择宿主机实例规格和操作系统，指定Kubernetes版本、自定义Kubernetes特性开关设置等。用户需要手动维护集群，例如升级Kubernetes版本，内置组件版本等。可以手动或自动伸缩集群节点数目。目前该模式下有两种类型，第一种集群主节点需要使用用户的ECS，用户可远程登录或管理这些ECS。另一种是，主节点也由云厂商托管，用户只能通过API Server管理Kubernetes。在费用方面，无论是否托管集群主节点，集群服务免费，按使用的ECS实例及计费方式收费。
- Serverless 模式(目前公测中，暂时免费)。无需创建底层虚拟化资源，可以利用 Kubernetes 命令指明应用容器镜像、CPU和内存要求以及对外服务方式，直接启动应用程序。按容器使用的CPU和内存资源量计费。这种模式下应该是在一个集群内实现多租户，目前有些[features不被支持][serverless-k8s-limitation]。例如，部署不支持DaemonSet，Ingress不支持NodePort类型，存储不支持PV和PVC等。

用户可以根据自己的业务类型来选择适合的托管Kubernetes集群。如果部署的应用是[无状态的Web服务][stateless-app]，可以选择Serverless Kubernetes集群，进一步减少运维工作量。

如果用户部署的应用有状态，需要挂载外部存储，例如MongDB集群，MQ集群，可以选择经典Dedicated Kubernetes模式。如果用户需要通过Kubernetes组件扩展或自定义实现某些功能，这些需求云厂商的标准版并没有提供，这时可以选择经典Dedicated Kubernetes模式，利用Kubernetes高度灵活的扩展机制来满足自定义需求。

## 托管Kuberentes的优势

国内的阿里云有篇技术文档对比[阿里云Kubernetes vs. 自建Kubernetes][aliyun-k8s-vs-self-hosted-k8s]，文章看起来虽然有厂商自卖自夸的嫌疑。作为[阿里云K8S][aliyun-k8s]的客户，在使用托管K8S近一年来，深切的体会到云厂商托管K8S带来的种种好处，文档中提到的种种优势确实是言之凿凿。

接下来具体看看云厂商托管K8S到底有哪些优势。

### 便捷

- 通过Web界面/API一键创建Kubernetes集群，集群升级。
- Web界面/API实现集群的扩容或缩容。

集群的安装，补丁以及常规版本升级在运维工作中属于体力活。在规模不大的时候，使用人工实现需要花费不少时间准备环境测试验证，且易错。如果集群体量不够大的话，开发自动化运维脚本又浪费人力成本。云计算厂商的托管K8S集群将提供专业、稳定的技术运维服务，和几乎为零的人力成本。

从效率和人力成本上看，**托管K8S集群完胜自建Kubernetes集群**。

### 功能更强大

[Kubernetes][k8s]作为一个容器编排系统，开源版本中许多组件没有默认实现或实现有限，需要跟运行环境(如托管K8S的云平台)集成。例如，存储，Load Balancer，网络等核心组件。官方文档[Internal load balancer][k8s-service-internal-load-balancer]就提供了在不同的云厂商环境中的使用示例。部署一个强大且完整的K8S集群需要同许多云计算的基础组件集成(且只能通过API完成)，这往往是云计算厂商的强项。

云厂商托管的K8S可以在以下方面提供强大的云计算平台支持，

#### 网络

- 高性能 VPC 网络插件。
- 支持 network policy 和流控。

#### 负载均衡

支持创建公网或内网负载均衡实例，或者复用已有实例。支持指定带宽大小、计费方式、4层或7层协议代理等云厂商负载均衡功能。对应用运维来说可以把负载均衡的配置通过代码实现，并且支持版本控制。对比传统的云端部署，也可以将应用部署和应用运维集成在一起统一管理，避免应用发布和运维配置的割裂，减少人为运维失误。

阿里云托管K8S的负载均衡详细配置可以参考这个[文档][aliyun-k8s-load-balancer]，AWS上见此[文档][aws-k8s-load-balancer]。

#### 存储

集成了云厂商的云盘、文件存储NAS、块存储等存储方案，基于标准的[FlexVolume][flex-volume]驱动，提供了最佳的无缝集成。

如果是在云厂商的虚拟机上自建[Kubernetes][k8s]集群，默认无法使用云上的存储资源。如果需要利用云厂商提供的存储方案，例如对象存储，就需要自行开发基于[FlexVolume][flex-volume]的驱动。在厂商托管K8S已经完美解决了存储集成的问题，何必自己又去费时费力的定制开发呢？

可以看到，云厂商托管的K8S集群在网络、负载均衡和存储上有许多天然的优势。在其他几个维度，托管的K8S集群同样也优于自建的K8S，

#### 运维

- 集成厂商的日志服务，监控服务。
- K8S集群cluster autoscaler自动利用云厂商的弹性伸缩扩缩容集群节点。

#### 镜像仓库

- 高可用，支持大并发。
- 支持镜像加速。
- 支持 p2p 分发。
- 可集成云平台的用户权限。
- 部分厂商目前免费且不限容量。

#### 高可用

- 提供多可用区支持。
- 支持备份和容灾。

#### 技术支持

- 专门的技术团队保障容器的稳定性。
- 每个 Linux 版本，每个 Kubernetes 版本都会在经过严格测试之后之后才会提供给用户。
- 提供 Kubernetes 升级能力，新版本一键升级。
- 为开源软件提供兜底，无论是K8S、Docker甚至Linux自身的问题提供支持。

专业的技术团队是提供稳定K8S服务必不可少的。但绝大多数企业是无法做到有专业的技术团队来维护K8S、提供K8S或容器技术自身的各种最佳实践、发现以及修复开源软件Bug。

在笔者的使用托管K8S的时候就遇到这样的状况。其中一个集群升级到新版本[Kubernetes][k8s]后，内置DNS组件从[KubeDNS][kube-dns]被替换为全新的[CoreDNS][core-dns]，而当时的[CoreDNS][core-dns]版本在[Service ExternalName][service-external-name]支持上有Bug，导致已有的这种Service无法提供服务。在同云厂商的技术团队沟通后，先用workaround将问题快速绕过，不影响业务的使用。同时，云厂商的技术人员（也是K8S社区committer）继续调研，发现该问题是[CoreDNS][core-dns]的Bug。在为开源[CoreDNS][core-dns]项目创建Issue后，同时提供Patch，又在CoreDNS committer建议下完善了测试用例，推动了该问题快速在CoreDNS中被修复。CoreDNS包含Fix的版本发布后，云厂商技术支持团队将更完美的解决方案提供给了我们。作为K8S服务的用户，这种体验是极好的。当时我们的技术团队既没有精力也没有能力快速发现并修复开源软件中的这类问题，而云厂商的服务间接帮我们实现了这种能力。

**这其实是一种非常好的共赢商业模式，云厂商有能力且有动力投入顶尖技术团队将开源技术商业化，云厂商的用户则用最小的代价获得了最优的基础服务来为核心业务赋能。**

[ecs]: https://cn.aliyun.com/product/ecs
[ec2]: https://aws.amazon.com/cn/ec2/
[cloud-native]: https://pivotal.io/cloud-native
[k8s]: https://kubernetes.io/
[aws]: https://aws.amazon.com/cn/
[eks]: https://aws.amazon.com/eks
[azure]: https://azure.microsoft.com/en-us/
[aks]: https://azure.microsoft.com/en-us/services/kubernetes-service/
[gcp]: https://cloud.google.com/
[kubernetes-engine]: https://cloud.google.com/kubernetes-engine/
[aliyun-k8s]: https://www.aliyun.com/product/kubernetes
[tke]: https://cloud.tencent.com/product/tke
[aliyun-managed-k8s]: https://help.aliyun.com/document_detail/86737.html
[serverless-k8s-limitation]: https://help.aliyun.com/document_detail/86371.html
[stateless-app]: https://kubernetes.io/docs/tutorials/stateless-application/
[aliyun-k8s-vs-self-hosted-k8s]: https://help.aliyun.com/document_detail/69575.html
[k8s-service-internal-load-balancer]: https://kubernetes.io/docs/concepts/services-networking/service/#internal-load-balancer
[aliyun-k8s-load-balancer]: https://help.aliyun.com/document_detail/53759.html?spm=a2c4g.11186623.2.15.73364c07mR8rhS#h2-url-4
[aws-k8s-load-balancer]: https://docs.aws.amazon.com/eks/latest/userguide/load-balancing.html
[flex-volume]: https://github.com/kubernetes/community/blob/master/contributors/devel/flexvolume.md
[kube-dns]: https://github.com/kubernetes/dns
[core-dns]: https://coredns.io/
[service-external-name]: https://kubernetes.io/docs/concepts/services-networking/service/#externalname
