---
title: "基于 Flux 的 GitOps 实战（上）"
description : "使用 GitOps 轻松管理跨VPC跨账户跨云多Kubernetes集群"
date: 2022-04-22
draft: false
toc: true
thumbnail: /posts/gitops/images/flux-eyecatch.png
codeMaxLines: 20
categories:
- blogging
- kubernetes
series:
- effective-cloud-computing
- gitops
isCJKLanguage: true
tags:
- GitOps
- Kubernetes
- Flux
- Git
- EKS
---

在[前文][gitops-best-practise]介绍了 GitOps 的概念，Kubernetes 上 GitOps 最佳实践以及对比了 CNCF 基金会下
云原生的 GitOps 工具（ArgoCD 和 Flux）。本篇将带你按照 Flux 的最佳实践在跨VPC跨账户的 Kubernetes 
上实践 GitOps 的持续集成，轻松管理数十数百乃至更多的集群及部署在上面的应用。

<!--more-->

## 0. 必备条件

- 假设业务对稳定性的需求，使用3个 Kubernetes 集群分别对应 `DEV`, `STAGING` 和 `PRODUCT` 环境。这些集群环境根据企业的需求
可能会分布在不同的云账户和VPC网络中。读者可根据实际企业情况创建一个或多个集群。本文以 [Amazon EKS][eks] 为例，EKS集群的创建请参阅其[文档][create-eks-cluster]。
- Git 仓库用于保存集群的声明式配置。Flux 支持 Git 在线服务（包括 Github, Gitlab, Bitbucket）和其他任意 Git 服务。本文将使用 Github 和 Gitlab 为例。
- [安装 Flux CLI][install-flux-cli]

## 1. Kubernetes 集群安装配置 Flux

[Github repo 为例][github-bootstrap]，执行以下命令，

```bash
export GITHUB_TOKEN=<your-token>

flux bootstrap github \
  --owner=zxkane \
  --repository=eks-gitops \
  --path=clusters/cluster-dev \
  --personal
```

{{% notice warning "重要" %}}
请确保 Flux CLI 执行环境可以通过 `kubectl` 连接到 Kubernetes 集群，且用户具备 `admin` 权限。
{{% /notice %}}

{{% notice warning "重要" %}}
创建的 Github Personal Accesss Token 需要至少同时选中全部 `repo` 和 `user` 的权限。
{{% /notice %}}

通过类似的步骤在 `STAGING` 和 `PRODUCT` 集群安装配置 Flux 。

```bash
export KUBECONFIG=$HOME/.kube/config-cluster-staging
flux bootstrap github \
  --owner=zxkane \
  --repository=eks-gitops \
  --path=clusters/cluster-staging \
  --personal
  
export KUBECONFIG=$HOME/.kube/config-cluster-product
flux bootstrap github \
  --owner=zxkane \
  --repository=eks-gitops \
  --path=clusters/cluster-product \
  --personal  
```

以上步骤是手动安装及配置 Flux ，Flux 也支持同现有的 IaC 代码集成，如 [eksctl][eksctl-gitops], [Terraform][terraform-boostrap]。

{{% notice tip "最佳实践" %}}
上面示例对多环境集群的支持并没有采用多仓库/多分支的策略，而是用的使用不同路径来管理不同的集群。
这也是 Flux 推荐的策略，可以减少代码维护和合并的难度。
{{% /notice %}}

```
./clusters/
├── cluster-dev                     [集群名称]
│   ├── flux-system                 [命名空间]
│     ├── gotk-components.yaml      [默认 Flux 配置，请勿手动修改]
│     ├── gotk-sync.yaml            [默认 Flux 配置，请勿手动修改]
│     └── kustomize.yaml            [Kustomize 配置入口文件，将通过此入口聚合了集群的全部配置]    
├── cluster-product
│   ├── flux-system
│     ├── gotk-components.yaml
│     ├── gotk-sync.yaml
│     └── kustomize.yaml
├── cluster-staging
│   ├── flux-system
│     ├── gotk-components.yaml
│     ├── gotk-sync.yaml
│     └── kustomize.yaml
```

在完成初始化不同的环境集群后，将在我们的Git仓库中查看到如上目录结构。
我们可以看到 Flux 自身的配置也是通过 GitOps 的方式来管理的。


## 2. 管理集群共享的组件

在企业中通常会由 Infrastructure 团队统一管理集群的共享组件，例如，Namespace, CSI Driver, Ingress Class, 
Persist Volume, Service Account, Secret, DaemonSet, NetworkPolicy，CustomResource 等等 Kubernetes 对象。
接下来将演示如何在多集群中创建集群内共享组件，例如，[AWS Load Balancer Controller][aws-load-balancer-controller] 和 [External DNS][external-dns]，
并且逐步将这些组件部署在不同的环境中。

Flux 自身大量依赖了 [Kustomize][kustomize]，通过 Flux 的 [Kustomize Controller][flux-kustomize] 来渲染最终的
Kubernetes 声明式配置，并集成了 Hook，ServiceAccount，超时等额外配置。

通过如下`Flux Kustomize`对象声明为`DEV`环境声明了共享 Infrastructure 配置所在的路径（该配置文件放置在`cluster/cluster-dev`目录下），
```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1beta2
kind: Kustomization
metadata:
  name: infrastructure
  namespace: flux-system
spec:
  interval: 10m0s
  path: ./infrastructure/overlays/development
  prune: true
  sourceRef:
    kind: GitRepository
    name: flux-system
```


以 External DNS(一个 CNCF 基金会项目，为 K8S Service LoadBalancer / Ingress 对象提供 DNS 域名解析注册) 为完整示例。

使用 Flux 的 [Helm Repositories][flux-helmrepo] 自定义对象，注册 bitnami 的 Helm Charts 仓库。
```yaml
apiVersion: source.toolkit.fluxcd.io/v1beta1
kind: HelmRepository
metadata:
  name: bitnami
spec:
  interval: 30m
  url: https://charts.bitnami.com/bitnami
```

按照 External DNS for [Amazon Route 53][route53] 的文档为 `external-dns` POD [创建执行 IAM 角色][external-dns-route53-iam]，
可以通过 Route 53 API 来创建修改相应的域名解析。针对 External DNS 部署的在 K8S 集群配置如下，

1. 为 External DNS 创建独立的 service account，同对应的 AWS IAM Role 绑定，限制该 Pod 仅拥有必需的最小权限。
关于 EKS 上如何绑定最小 AWS 权限到 pod 上请参考[IAM roles for service accounts][eks-irsa]。
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: external-dns
  annotations:
    # create IAM role via following docs,
    # https://docs.aws.amazon.com/eks/latest/userguide/specify-service-account-role.html
    # https://github.com/kubernetes-sigs/external-dns/blob/master/docs/tutorials/aws.md#iam-permissions
    # the role specified by kustomize
    # eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/external-dns-role
    eks.amazonaws.com/sts-regional-endpoints: true
```
2. 定义 [`HelmRelease` Flux 对象][flux-helmrelease] 从 Bitnami 的 Helm Charts 仓库安装 `external-dns` 。
```yaml
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  name: external-dns
spec:
  releaseName: external-dns
  targetNamespace: kube-system
  chart:
    spec:
      chart: external-dns
      version: '>=6.2.1 <7'
      sourceRef:
        kind: HelmRepository
        name: bitnami
        namespace: flux-system
  interval: 1h0m0s
  install:
    remediation:
      retries: 3
  values:
    provider: aws
    aws:
      zoneType: public
    serviceAccount:
      create: false
      name: external-dns
    podSecurityContext:
      fsGroup: 65534
      runAsUser: 0
```
3. 使用 Kustomization 将相关的配置整合。
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: kube-system
resources:
  - serviceaccount.yaml
  - release.yaml
```
4. 用 Kustomization 整合多个组件的配置。
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - sources
  - aws-load-balancer-controller
  - dns
```

以上所有配置都保存在Git仓库`infrastructure/base`下（详见下图）作为多套环境通用的配置，按照 Kustomize 的 [Overlays][kustomize-overlays] 布局。

```
./infrastructure/
|-- base
|   |-- aws-load-balancer-controller
|   |   |-- kustomization.yaml
|   |   |-- release.yaml
|   |   `-- serviceaccount.yaml
|   |-- dns
|   |   |-- kustomization.yaml
|   |   |-- release.yaml
|   |   `-- serviceaccount.yaml
|   |-- kustomization.yaml
|   `-- sources
|       |-- bitnami.yaml
|       |-- eks-charts.yaml
|       `-- kustomization.yaml
`-- overlays
    |-- development
    |   |-- aws-load-balancer-controller-patch.yaml
    |   |-- aws-load-balancer-serviceaccount-patch.yaml
    |   |-- dns-patch.yaml
    |   |-- dns-sa-patch.yaml
    |   `-- kustomization.yaml
```

在`DEV`环境对应的 overlay 下面创建如下的补丁来覆盖跟`DEV`环境相关的信息声明，如集群名称、域名、
为External DNS pod所创建AWS IAM Role的ARN。

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  name: external-dns
spec:
  values:
    txtOwnerId: gitops-cluster
    domainFilters[0]: test.kane.mx
    policy: sync
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: external-dns
  annotations:
    eks.amazonaws.com/role-arn: >-
      arn:aws:iam::845861764576:role/gitops-cluster-external-dns-role
```

{{% notice tip "最佳实践" %}}
充分利用 Kustomize 的 Overlays 机制来抽象通用的配置和覆盖每个环境所对应的特殊部分。
{{% /notice %}}

同样在`DEV`环境验证External DNS组件部署成功后，将相似的配置应用到`STAGING`和`PRODUCT`环境。
通过Kustomize的Overlays分别设置`STAGING`和`PRODUCT`环境相关的配置。再将变更推送到Git仓库，
Flux将会为我们部署这些声明在Git仓库中的组件！可查阅[DEV][infra-dev-commit], [STAGING][infra-staging-commit],
[PRODUCT][infra-product-commit]这三个提交查看完整实现。

## 3. 密钥的管理

GitOps 的理念是将一切配置以声明式文本方式保存在仓库中。而对保存 [Kubernetes Secrets][k8s-secrets] 是个挑战，
因为 Git 仓库对所有读权限的用户公开，甚至项目的仓库是开源。Flux 通过支持 [Bitnami Sealed Secrets][bitnami-sealed-secrets] 和 
[Mozilla SOPS][flux-sops] 安全的在 Git 仓库中管理密钥。接下来将示例如何使用 [Sealed Secrets][flux-sealed-secrets]
为 MariaDB 创建密码。

1. 首先使用 HelmRelease 部署 Bitnami Sealed Secrets。类似上面部署 External DNS，将 sealed secrets 添加到 `infrastructure/base` 里作为共享组件。
```yaml
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  name: sealed-secrets
  namespace: flux-system
spec:
  chart:
    spec:
      chart: sealed-secrets
      sourceRef:
        kind: HelmRepository
        name: sealed-secrets
      version: ">=1.15.0-0"
  interval: 1h0m0s
  releaseName: sealed-secrets-controller
  targetNamespace: flux-system
  install:
    crds: Create
  upgrade:
    crds: CreateReplace
```
2. 按照 Flux 的 [Sealed Secrets 文档][flux-sealed-secrets]，安装 `kubeseal`。
3. 使用 `kubeseal` 从集群中下载公钥。
```bash
kubeseal --fetch-cert \
--controller-name=sealed-secrets-controller \
--controller-namespace=flux-system \
> pub-sealed-secrets-dev.pem
```
4. 为 [Bitnami MariaDB][bitnami-mariadb] 生成密钥。
```
kubectl -n mariadb create secret generic prestashop-mariadb \
--from-literal=mariadb-root-password=<put the ariadb root password here> \
--from-literal=mariadb-replication-password=<put the replication password here> \
--from-literal=mariadb-password=<put the mariadb password here> \
--dry-run=client \
-o yaml > /tmp/mariadb-secrets.yaml
```
5. 从 K8S 内置的 Opaque Secrets 格式文件生成 sealed secret。
```
kubeseal --format=yaml --cert=pub-sealed-secrets-dev.pem \
< /tmp/mariadb-secrets.yaml > infrastructure/overlays/development/prestashop-mariadb-secrets.yaml
```
6. 部署 Bitnami Helm Chart MariaDB，使用提前创建的密钥作为 DB 的密钥。
```yaml
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  name: prestashop-mariadb
spec:
  releaseName: mariadb
  chart:
    spec:
      chart: mariadb
      sourceRef:
        kind: HelmRepository
        name: bitnami
        namespace: flux-system
      version: 10.4.0
  interval: 1h0m0s
  install:
    remediation:
      retries: 3
  valuesFrom:
    - kind: ConfigMap
      name: prestashop-values
---
auth:
  existingSecret: prestashop-mariadb
primary:
  persistence:
    enabled: false
    storageClass: standard
```

{{% notice tip "最佳实践" %}}
切记使用 Sealed Secrets, SOPS 等工具仅将加密后的密钥提交到 Git 仓库，避免密钥的泄露！
{{% /notice %}}

查阅[DEV][sealed-secret-dev-commit], [STAGING][sealed-secret-staging-commit],
[PRODUCT][sealed-secret-product-commit]这三个提交查看完整 sealed secrets 使用。

## 4. 通知集成

在运维集群的时候，不同的团队有订阅不同的 GitOps 流水线通知的需求。
例如，oncall 团队将收到有关集群中协调失败的警报，
而开发团队可能希望在部署新版本的应用程序以及部署是否健康时收到警报。

Flux 内置了同 Slack, MS Teams, Discord 等知名 IM 工具的集成，也支持将消息发送到 webhook 接口，
由用户自行实现消息通知。

下面以 Slack 为例，示例如何集成 GitOps 流水线消息。

1. 定义一个名为 `slack` 的 Flux 自定义资源 `Provider`
```yaml
apiVersion: notification.toolkit.fluxcd.io/v1beta1
kind: Provider
metadata:
  name: slack
  namespace: flux-system
spec:
  type: slack
  secretRef:
    name: slack-url
```
因为 Slack WebHook 并没有额外的鉴权保护，这里我们使用上一节的密钥管理机制加密保存在 Git 仓库的 slack webhook url，
同时 `Provider` 引用 Secrets 对象中保存的 url。
2. 创建 Flux `Alert` 对象订阅命名空间的各类 Flux 对象事件，并且同第一步定义的 `Provider` 关联。
3. 当创建多个 Alert 和不同的 `Provider` 关联，可以将消息发送到不同的 Slack `channel` 甚至是不同的 IM。
```yaml
apiVersion: notification.toolkit.fluxcd.io/v1beta1
kind: Alert
metadata:
  name: flux-alert
  namespace: flux-system
spec:
  providerRef:
    name: slack
  eventSeverity: info
  eventSources:
    - kind: GitRepository
      name: '*'
    - kind: Kustomization
      name: '*'
    - kind: HelmRelease
      name: '*'
---
apiVersion: notification.toolkit.fluxcd.io/v1beta1
kind: Alert
metadata:
  name: kube-system-alert
  namespace: flux-system
spec:
  providerRef:
    name: slack
  eventSeverity: info
  eventSources:
    - kind: Kustomization
      name: '*'
      namespace: 'kube-system'
    - kind: HelmRelease
      name: '*'
      namespace: 'kube-system'
```

查阅[DEV][slack-notify-dev-commit], [STAGING][slack-notify-staging-commit],
[PRODUCT][slack-notify-product-commit]这三个提交查看完整 commits 如何在不同环境集群中部署了 Slack 通知集成。

{{< figure src="/posts/gitops/images/gitops-slack-notify.jpg" alt="图1：Slack channel 订阅 GitOps 流水线消息通知" >}}

{{% notice tip "最佳实践" %}}
针对订阅不同命名空间(非`Alert`对象定义的命令空间)的事件通知，需要显示指定命名空间属性。
{{% /notice %}}

## 5. GitOps 代码的 CI

GitOps 模式带来的又一个好处是可以使用企业成熟且惯用的代码管理工作流来自动化验证变更及代码审核审批。
针对 GitOps 代码可以引入如下 CI 步骤，

- 由于 Flux 大量使用 `Kustomize` 来生成最终的声明式配置，可以实现在每次提交 Pull Request/Merge Request 后的验证阶段引入 
kustomize CLI 验证 GitOps 配置是否可以正确的被生成。同时，使用 Flux OpenAPI 结合 [kubeconform][kubeconform]
验证 Kubernetes 内置资源和 Flux CRD 类型是否配置正确。
- 借助 [KIND(Kubernetes in Docker)][kind] 实现完整的端到端测试。KIND 实现了 Docker 容器打包的 Kubernetes 环境，
可以每次 PR 验证阶段启动新的 KIND 环境且安装 Flux 后，执行 GitOps 代码的 reconciliation，
验证 GitOps 代码配置的资源是否可以被创建且状态为`READY`。
- 借助 Git 服务的 CI 能力，如 [Github Actions][github-actions], [Gitlab CI/CD][gitlab-ci] 等，
实现 GitOps 代码的上述两种自动化检查，以及同代码审核审批集成。

查阅此 [Github Actions workflow 配置实现在 KIND 环境 End-To-End 验证 GitOps 配置][e2e-test]，和 [声明式配置 Manifests 验证][manifests-test]。

{{% notice tip "最佳实践" %}}
利用 Github Actions 或 Gitlab CI/CD 非常容易的将 GitOps 代码集成到 CI 环境，
通过 KIND/Kubeconform 验证代码的正确性。
{{% /notice %}}

## 6. 小结

本文介绍使用 GitOps 工具 FluxCD v2 实现了管理多账户多 VPC 环境下的 Kubernetes 集群的共享组件，实践了 Secrets 使用的最佳实践，
CD 部署事件同 IM(Slack) 的集成，最终示例了通过 GitOps 代码的 CI 流程来提高 GitOps 代码的质量，减少部署中断事故。

下篇将带领大家基于 Flux 实现 GitOps 工作模型下的[共享服务平台][ssp]。

[gitops-best-practise]: {{< relref "/posts/gitops/the-best-practise-of-gitops-in-kubernetes.md" >}}
[ssp]: {{< relref "/posts/2021/shared-service-platform-for-decentralized-developer-teams/index.md" >}}
[eks]: https://aws.amazon.com/eks/
[create-eks-cluster]: https://docs.aws.amazon.com/eks/latest/userguide/create-cluster.html
[install-flux-cli]: https://fluxcd.io/docs/installation/#install-the-flux-cli
[github-bootstrap]: https://fluxcd.io/docs/installation/#github-and-github-enterprise
[eksctl-gitops]: https://eksctl.io/usage/gitops-v2/
[terraform-boostrap]: https://fluxcd.io/docs/installation/#bootstrap-with-terraform
[aws-load-balancer-controller]: https://github.com/kubernetes-sigs/aws-load-balancer-controller/
[external-dns]: https://github.com/kubernetes-sigs/external-dns
[flux-kustomize]: https://fluxcd.io/docs/components/kustomize/
[kustomize]: https://kustomize.io/
[flux-helmrepo]: https://fluxcd.io/docs/components/source/helmrepositories/
[external-dns-route53-iam]: https://github.com/kubernetes-sigs/external-dns/blob/master/docs/tutorials/aws.md#iam-policy
[route53]: https://aws.amazon.com/route53/
[eks-irsa]: https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html
[flux-helmrelease]: https://fluxcd.io/docs/components/helm/helmreleases/
[kustomize-overlays]: https://kubectl.docs.kubernetes.io/guides/introduction/kustomize/#2-create-variants-using-overlays
[infra-dev-commit]: https://github.com/zxkane/eks-gitops/commit/08c37ca9867732c3c4329c33a34555ae450bb0b6
[infra-staging-commit]: https://github.com/zxkane/eks-gitops/commit/375a3ccd95b4c976e7720c9ffc125d4574fc4075
[infra-product-commit]: https://github.com/zxkane/eks-gitops/commit/f9e67f41a77275f232269354031e9ae0bbcb237d
[k8s-secrets]: https://kubernetes.io/docs/concepts/configuration/secret/
[flux-sealed-secrets]: https://fluxcd.io/docs/guides/sealed-secrets/
[bitnami-sealed-secrets]: https://github.com/bitnami-labs/sealed-secrets
[flux-sops]: https://fluxcd.io/docs/guides/mozilla-sops/
[bitnami-mariadb]: https://github.com/bitnami/charts/tree/master/bitnami/mariadb
[sealed-secret-dev-commit]: https://github.com/zxkane/eks-gitops/commit/cfa5fe11263bcddb6e4565b50f7673a282d4b7b2
[sealed-secret-staging-commit]: https://github.com/zxkane/eks-gitops/commit/948d07dd5668bd6edb330b3a5a178074a4792ad9
[sealed-secret-product-commit]: https://github.com/zxkane/eks-gitops/commit/6b57d08c3715d4ee07f14e7dfdfe7562095c7694
[slack-notify-dev-commit]: https://github.com/zxkane/eks-gitops/commit/d5f79f52c66e5518300b11e48afbd2c2d26a492a
[slack-notify-staging-commit]: https://github.com/zxkane/eks-gitops/commit/f6d8059c8373c99c1b3a2cdad940450aad46fa08
[slack-notify-product-commit]: https://github.com/zxkane/eks-gitops/commit/90d8d35786c7126cd2c0291a91da4cf502f778fd
[kubeconform]: https://github.com/yannh/kubeconform
[kind]: https://kind.sigs.k8s.io/
[github-actions]: https://github.com/features/actions
[gitlab-ci]: https://docs.gitlab.com/ee/ci/
[e2e-test]: https://github.com/zxkane/eks-gitops/blob/main/.github/workflows/e2e.yaml
[manifests-test]: https://github.com/zxkane/eks-gitops/blob/main/.github/workflows/test.yaml