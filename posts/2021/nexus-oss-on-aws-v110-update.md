---
title: "The update of Sonatype Nexus repository OSS on AWS solution"
description : "Deploy production ready Nexus repository OSS on EKS in ~30 minutes"
date: 2021-06-24
draft: false
thumbnail: posts/2020/deploy-sonatype-nexus-oss-on-eks/images/cover.png
categories:
- blogging
series:
- effective-cloud-computing
isCJKLanguage: false
tags:
- Amazon EKS
- Kubernetes
- Helm
- AWS CDK
- AWS
- Sonatype Nexus
---

Last year I shared the production-ready, cloud native solution to [deploy Sonatype Nexus Repository OSS on AWS][nexus-oss-on-aws].

<!--more-->

The solution has an update with below notable changes,

- support specifying EKS version, v1.20, v1.19, and v1.18 are supported versions
- support provisioning to existing VPC
- support provisioning to existing EKS(require EKS v1.17+)
- update aws-efs-csi-driver to 1.3.1
- update aws-load-balancer-controller to 2.2.0

See [the solution page][sonatype-nexus-solution] for detail usage.

[nexus-oss-on-aws]: {{< relref "/posts/2020/deploy-sonatype-nexus-oss-on-eks/index.md" >}}
[sonatype-nexus-solution]: https://github.com/aws-samples/nexus-oss-on-aws
