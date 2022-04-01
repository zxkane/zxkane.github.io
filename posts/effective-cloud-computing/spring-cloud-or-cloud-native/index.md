---
title: "Spring Cloud or Cloud Native"
description : "Cloud Native时代，Spring Cloud Netflix OSS还是最佳实践吗？"
date: 2019-04-29
draft: false
thumbnail: posts/effective-cloud-computing/spring-cloud-or-cloud-native/images/cover.png
series:
- effective-cloud-computing
categories:
- kubernetes
isCJKLanguage: true
tags:
- 云计算
- kubernetes
- spring
- spring cloud
- service mesh
- istio
---
基于Java的[Spring Cloud][spring-cloud]是由Java最大开源生态[Spring][spring]社区推出的Out-of-Box分布式[微服务][microservice]解决方案，[自2016年发布][spring-cloud-angel-release-notes]起就被众多开发者看好。Java作为广为流行的服务端编程语言，[Spring Cloud][spring-cloud]也就越来越多的被用于微服务开发。

[Spring Cloud][spring-cloud]集成了[Netflix OSS][netflix-oss]开源项目实现了很多功能(或作为实现之一)，包括服务治理、网关路由、客户端负载均衡、服务间调用、断路器等。[Spring Cloud Netflix][spring-cloud-netflix]将很多生产级别微服务能力开箱即用的带到了Spring Cloud架构下的微服务中，帮助开发者快速的构建满足[12要素][12factor]的应用。

在去年底发布的[Spring Cloud Greenwich版本][spring-cloud-netflix-entering-maintenance-mode]中宣布[Spring Cloud Netflix][spring-cloud-netflix]中重要的组件[Hystrix][hystrix-status]、[Ribbon][ribbon-status]、`Zuul 1`等由于上游开源项目进入维护状态，对应的Spring Cloud Netflix项目也进入到维护状态。这些项目将**不再适合**用于长期维护的产品中！

同时随着近年云计算的发展，特别是[Kubernetes][k8s]成为容器编排平台的事实标准，加上[Service Mesh(服务网格)][what-is-service-mesh]对微服务的服务治理和流量控制，为[云原生应用][cloud-native-apps]提供了更为现代、平台无关的解决方案。

<!--more-->

让我们逐一看看在[Kubernetes][k8s]加上Serivce Mesh(例如[Istio][istio])如何实现微服务的服务发现、路由、链路追踪、断路器等功能。

### 配置中心

[Spring Cloud Config][spring-cloud-config]默认提供了多种配置管理后端，例如`Git`、`Vault`、`JDBC Backend`等。同时也有很多开源方案可以作为替换方案，比如[Alibaba Nacos][nacos]。

作为部署在[Kubernetes][k8s]中的应用，最佳实践是平衡[Configmap][k8s-configmap]和[Spring Cloud Config][spring-cloud-config]。将涉及程序功能的配置放置在[Configmap][k8s-configmap]和Secret，随同微服务的发布一起做版本管理，可以做到**随着应用回退的时候同时回退到历史对应的配置版本**，而不会因为历史版本的代码被最新版本的配置所中断。[Spring Cloud Kuberentes][spring-cloud-k8s]项目很好的支持了Spring Cloud应用从[Configmap][spring-cloud-k8s-config]和[Secret][spring-cloud-k8s-secret]中读取配置项。而涉及业务的配置选项，将可以考虑放到Spring Cloud Config后端实现统一管理。如果应用是部署在阿里云，使用阿里云托管的配置服务和[Spring Cloud Config -- Nacos][nacos]将是很好的选择。

### 服务发现

[Kubernetes Services][k8s-discovery-services]提供了集群内原生的服务发现能力，是[Eureka][spring-cloud-netflix]或[Spring Cloud Zookeeper][spring-cloud-zookeeper]等服务发现服务的很好替代品。基于K8S Services的服务发现，很容易通过Service Mesh能力实现限流、A/B测试、金丝雀发布、断路器、chaos注入等服务治理能力。同时对微服务应用来说，不用在应用端添加对应三方库来实现服务注册及发现，减少了应用端开发需求。

### 各种流量治理场景

应用被服务化后，一定会面临流量治理的问题。对于各种服务间如何实现限流、A/B测试、金丝雀发布、断路器、chaos注入测试、链接追踪等，这其实是一类通用的问题。

[Spring Cloud][spring-cloud]提供的是一种客户端解决思路，需要每个应用引入对应功能的libraries的支持。即使通过[spring boot starter][spring-boot-starter]提供了近似开箱即用的能力，但是每个应用仍然需要自行添加对应的能力，版本更新、安全漏洞fix等场景都需要手动升级、测试、打包、部署。在异构编程语言实现的微服务架构下，未必每种编程框架都能提供很好的对应能力支持。除非有特别的服务治理策略，不推荐在微服务自身来实现服务流量的控制。

Service Mesh(例如[Istio][istio]或[Linkerd][linkerd])从整个服务治理层面对上述需求提供了统一的解决方案，而不需要微服务做自身的升级或改动。在基于Kuberentes部署运行的微服务应用，Service Mesh提供了统一的服务治理方案，将用户从不同的微服务中自身维护服务治理功能中解放出来，从平台层面提供更加统一一致的解决方案。

在去年的SpringOne Platform 2018上也有一个Topic [A Tale of Two Frameworks: Spring Cloud and Istio][spring-cloud-and-istio] 探讨什么场景应该使用Service Mesh，什么时候使用Spring Cloud服务治理组件，有兴趣的朋友可以看一看。

{{< youtube AMJQO9zs2eo >}}

[spring]: https://spring.io/
[spring-cloud]: https://spring.io/projects/spring-cloud
[microservice]: https://en.wikipedia.org/wiki/Microservices
[spring-cloud-angel-release-notes]: https://github.com/spring-projects/spring-cloud/wiki/Spring-Cloud-Angel-Release-Notes/6e0e1ba3d510d4a30b95c1468007b22f2427fa25
[netflix-oss]: https://netflix.github.io/
[spring-cloud-netflix]: https://spring.io/projects/spring-cloud-netflix
[12factor]: https://12factor.net/
[k8s]: https://kubernetes.io/
[what-is-service-mesh]: https://www.nginx.com/blog/what-is-a-service-mesh/
[spring-cloud-netflix-entering-maintenance-mode]: https://spring.io/blog/2018/12/12/spring-cloud-greenwich-rc1-available-now#spring-cloud-netflix-projects-entering-maintenance-mode
[cloud-native-apps]: https://www.redhat.com/en/topics/cloud-native-apps
[hystrix-status]: https://github.com/Netflix/Hystrix#hystrix-status
[ribbon-status]: https://github.com/Netflix/ribbon#project-status-on-maintenance
[istio]: https://istio.io/
[spring-cloud-config]: https://spring.io/projects/spring-cloud-config
[nacos]: https://github.com/alibaba/nacos
[spring-cloud-k8s]: https://github.com/spring-cloud/spring-cloud-kubernetes
[spring-cloud-k8s-config]: https://github.com/spring-cloud/spring-cloud-kubernetes#kubernetes-propertysource-implementations
[spring-cloud-k8s-secret]: https://github.com/spring-cloud/spring-cloud-kubernetes#secrets-propertysource
[k8s-configmap]: https://kubernetes.io/docs/user-guide/configmap/
[spring-cloud-zookeeper]: https://spring.io/projects/spring-cloud-zookeeper
[k8s-discovery-services]: https://kubernetes.io/docs/concepts/services-networking/service/#discovering-services
[spring-boot-starter]: https://www.baeldung.com/spring-boot-starters
[linkerd]: https://linkerd.io/
[spring-cloud-and-istio]: https://youtu.be/AMJQO9zs2eo
