---
title: Mirror Helm Charts to AWS ECR
description : A solution to quickly mirror helm charts to your private repository
date: 2021-09-27
draft: false
thumbnail: https://helm.sh/img/helm.svg
categories:
- blogging
isCJKLanguage: false
tags:
- AWS
- AWS-ECR
- Helm
- Kubernetes
---

I met a case to mirror existing [Helm][helm] charts to another repository. It might be caused by network availability or compliance requirements.

There are multiple ways to host a Helm repository, for example, [Nexus OSS Repository][nexus-oss-on-aws], [Github Pages][helm-chart-repo-on-github-pages], [AWS ECR][ecr-oci-artifact-support] and so on.

Amazon Elastic Container Registry ([Amazon ECR][aws-ecr]) is a fully managed container registry that makes it easy to store, manage, share, and deploy your container images and artifacts anywhere. It's built with scale and secure. In my case I'm using this existing service to mirror the Helm charts.

<!--more-->

I created a [script][mirror-script] to mirror existing Helm chart to AWS ECR based on [the official guide in ECR doc][push-helm-chart-to-ecr].

For example, below code snippet mirrors `eks-charts/aws-load-balancer-controller` with version `1.2.7` to Amazon ECR,

{{< highlight bash >}}
helm repo add eks-charts https://aws.github.io/eks-charts
helm pull eks-charts/aws-load-balancer-controller --version 1.2.7
./push-helm-chart-to-all-ecr-regions.sh aws-load-balancer-controller 1.2.7
{{< /highlight >}}

[helm]: https://helm.sh/
[ecr-oci-artifact-support]: https://aws.amazon.com/blogs/containers/oci-artifact-support-in-amazon-ecr/
[helm-chart-repo-on-github-pages]: https://harness.io/blog/helm-chart-repo/
[nexus-oss-on-aws]: {{< relref "/posts/2020/deploy-sonatype-nexus-oss-on-eks/index.md" >}}
[aws-ecr]: https://aws.amazon.com/ecr/
[mirror-script]: https://gist.github.com/zxkane/f548965c8d84871cd8f5eb4ceaaffbc9
[push-helm-chart-to-ecr]: https://docs.aws.amazon.com/AmazonECR/latest/userguide/push-oci-artifact.html