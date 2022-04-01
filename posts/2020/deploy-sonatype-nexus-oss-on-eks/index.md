---
title: "Deploy Sonatype Nexus repository OSS on EKS"
description : "Deploy production ready Nexus repository OSS on EKS in ~10 minutes"
date: 2020-06-16
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

[Sonatype Nexus repository OSS][neuxs-oss] is an artifact repository that supports most software repositories such as Maven, Pypi, Npmjs, Rubygems, Yum, Apt, Docker registry and etc. In the enterprise Nexus repository is widely used for storing proprietary artifacts and caching the artifacts for speeding up the devops.

<!--more-->

Building a production ready Nexus repository always is a requirement for devops team, it should satisfy below criterias at least,

- **artifacts storage management** It's difficult to predicate the storage usage of artifacts, allocating large volume is not cost optimized.
- **the durability of nexus3 data storage** We need a way to make sure data storage of nexus when updating Nexus OSS to newer version or recover the service from unhealthy status.
- **self healing capability when the service is down** A reliable way recovers the Nexus repository OSS when it's unhealth.

There is a well-architected [solution][sonatype-nexus-solution](maintained by AWS team) to quickly(~10 minutes) deploy [Nexus OSS][neuxs-oss] leveraging below capabilities,

- Host on EKS cluster using managed EC2 nodes with [IRSA][eks-irsa]
- Expose service via AWS Application load balancer managed by [AWS load balancer controller][aws-load-balancer-controller](former ALB Ingress Controller)
- Use dedicated S3 bucket for storing Nexus OSS blobstore with ulimited and on-demand storage
- Use EFS, [EFS CSI Driver][eks-efs-csi], PV and PVC storing nexus data
- Use [Helm][helm] to deploy [Sonatype Nexus chart][sonatype-nexus-chart]
- `Optional` Use [External DNS][external-dns] to registry the domain record of Nexus repository to Route 53
- `Optional` Use AWS Certificate Manager to create SSL certificate of domain name of Nexus repository

Enjoy it:smirk:

[neuxs-oss]: https://www.sonatype.com/nexus-repository-oss
[sonatype-nexus-solution]: https://github.com/aws-samples/nexus-oss-on-aws
[aws-load-balancer-controller]: https://github.com/kubernetes-sigs/aws-load-balancer-controller
[eks-irsa]: https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html
[eks-efs-csi]: https://docs.aws.amazon.com/eks/latest/userguide/efs-csi.html
[external-dns]: https://github.com/kubernetes-sigs/external-dns
[helm]: https://helm.sh/
[sonatype-nexus-chart]: https://hub.helm.sh/charts/oteemo/sonatype-nexus