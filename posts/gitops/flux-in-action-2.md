---
title: "基于 Flux 的 GitOps 实战（下）"
description : "基于 GitOps 构建共享服务平台"
date: 2022-05-08
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
- CD
- Continuous Delivery
---

在[上篇][flux-in-action-1]介绍基于 CNCF 下的 GitOps 工具 FluxCD v2
实现了管理多账户的 Kubernetes 集群的共享组件，Secrets 使用的最佳实践，
GitOps 流水线事件同 IM(Slack) 的集成，以及对 GitOps 代码的 CI 流程。

本文将围绕如何使用 Flux 的多租户管理最佳实践，打造基于 GitOps 工作流程的共享服务平台，
实现租户(业务/应用团队)可自助的持续部署。

<!--more-->

## 一、基于 GitOps 的共享服务平台设定

Kubernetes 提供了命名空间作为一种机制将同一集群中的资源划分为相互隔离的组。
同一个集群中多租户多团队的应用管理将沿用 Kubernetes 内置的各种机制来为不同的租户、团队或应用进行隔离，包括且不限于，

- 命名空间([Namespaces][k8s-namespaces])
- 资源配额([Resource Quotas][resource-quotas])，限制应用的资源总量
- [RBAC 鉴权][k8s-rbac]，限制应用的权限，如可创建 Ingress，不可创建密钥可读取指定名称的密钥，不可创建[持久卷][persistent-volumes]等
- 网络策略([Network Policies][network-policies])

基于 Kubernetes 以上能力，为基于 GitOps 的共享服务平台设定如下，

- 平台团队通过一个 Git 仓库来管理多个跨网络跨账户跨云平台的 Kubernetes 集群，平台团队通过 GitOps 管理如下资源，
  - GitOps Toolkit 组件，如 Flux
  - 集群共享组件，如 CNI, CSI Driver, Ingress Class，Service Accounts, CRD, DNS 等
  - 可观测性的共享组件，如 Log, Metrics, Trace
  - 每个租户/团队/应用的基础资源，如 Namespaces, Resource Quotas, Open Policy，Service Accounts，密钥等
- 为集群中的每个租户/团队/应用使用独立的 Git 仓库来隔离其持续部署，假设有应用名为 `app-a`，
  - 应用 `app-a` 相关的资源都将部署在命名空间 `app-a`
  - 限制应用使用的总资源，如不超过 2 vCPU, 4 GiB 内存
  - 应用团队使用独立的 Git 仓库来管理应用编排，应用团队将负责应用发布到不同 stage 环境的节奏
  - 应用团队可以使用 Kustomization、Helm 部署应用
  - 应用团队无法创建集群相关的组件，如持久卷、CRD 等资源
  - 应用团队无法创建密钥、Service Account等资源，但仅可使用 infra 团队提前为应用创建的这类资源

## 二、Flux 多租户的安全设置

对于一个使用命名空间在隔离多租户的集群，Flux 提供了[选项][cross-namespace-ref]来禁止跨命令空间的引用，
例如，Flux 的 [Kustomization][kustomization] 或 [Helm Releases][helmreleases] 禁止引用其他命名空间定义的 [Source][flux-source]。
同时，启用[强制模拟][impersonation]功能，将 [Kustomization][kustomization] 或 [Helm Releases][helmreleases] 
资源的部署默认限制到最小来显示的提升部署的安全性。

遵循以上 Flux 的多租户安全最佳实践，进行如下 Flux Toolkits 配置（`./cluster/cluster-dev/kustomization.yaml`）
来禁用跨命名空间引用和强制模拟限制 Kustomization 和 Helm 部署的默认权限，

```yaml {hl_lines=["6-35"]}
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - gotk-components.yaml
  - gotk-sync.yaml
patches:
  - patch: |
      - op: add
        path: /spec/template/spec/containers/0/args/0
        value: --no-cross-namespace-refs=true
    target:
      kind: Deployment
      name: >-
        (kustomize-controller|helm-controller|notification-controller|image-reflector-controller|image-automation-controller)
  - patch: |
      - op: add
        path: /spec/template/spec/containers/0/args/0
        value: --default-service-account=default
    target:
      kind: Deployment
      name: (kustomize-controller|helm-controller)
  - patch: |
      - op: add
        path: /spec/serviceAccountName
        value: kustomize-controller
    target:
      kind: Kustomization
      name: flux-system
  - patch: |
      - op: add
        path: /spec/serviceAccountName
        value: helm-controller
    target:
      kind: HelmRelease
      name: flux-system  
```

同时为 infra 团队管理的共享 Kustomization/Helm 组件部署显示的指定部署权限，
例如，`DEV`环境 infrastructure 配置的入口`./clusters/cluster-dev/infrastructure.yaml`

```yaml {hl_lines=["8"]}
apiVersion: kustomize.toolkit.fluxcd.io/v1beta2
kind: Kustomization
metadata:
  name: infrastructure
  namespace: flux-system
spec:
  interval: 10m0s
  serviceAccountName: kustomize-controller
  path: ./infrastructure/overlays/product
  prune: true
  sourceRef:
    kind: GitRepository
    name: flux-system
```

或通过 Kustomize 的补丁机制为所有的 Kustomization/Helm Flux 自定义资源指定部署权限，
例如`DEV`环境的overlay的入口`./infrastructure/overlays/development/kustomization.yaml`配置，

```yaml {hl_lines=["12-25"]}
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ../../base
  - ./secrets.yaml
patches:
  - path: ./aws-load-balancer-controller-patch.yaml
  - path: ./aws-load-balancer-serviceaccount-patch.yaml
  - path: ./dns-patch.yaml
  - path: ./dns-sa-patch.yaml
  - path: ./slack-patch.yaml
  - patch: |
      - op: add
        path: /spec/serviceAccountName
        value: kustomize-controller
    target:
      kind: Kustomization
      namespace: (flux-system|kube-system|mariadb)
  - patch: |
      - op: add
        path: /spec/serviceAccountName
        value: helm-controller
    target:
      kind: HelmRelease
      namespace: (flux-system|kube-system|mariadb)  
```

{{% notice tip "最佳实践" %}}
通过在平台团队管理的 Kustomization 配置中，强制为应用团队 Git 仓库的 `Kustomization`, `HelmRelease` 
等部署对象指定部署时使用的 `Service Account`。
{{% /notice %}}

## 三、租户的集群资源管理

基于前面的管理需求假设，在 infrastructure Git 仓库中，专门为多租户/多团队/多应用创建如下目录结构，
共享 apps 通常的租户配置，例如，**命名空间**，**RBAC**(通过 Service Account)加上 **Policy** 实现等。

```
apps
|-- base
|   |-- app-a
|   |   |-- bitnami.yaml
|   |   |-- kustomization.yaml
|   |   |-- namespace.yaml
|   |   |-- policies.yaml
|   |   `-- rbac.yaml
|   `-- kustomization.yaml
`-- overlays
    `-- development
        |-- app-a
        |   |-- kustomization.yaml
        |   `-- prestashop-sealed-secrets.yaml
        `-- kustomization.yaml
```

同时创建一个 apps 的 Kustomization 入口配置同集群集成，例如 `./clusters/cluster-dev/apps.yaml` 文件内容如下，

``` {hl_lines=["10-11"]}
apiVersion: kustomize.toolkit.fluxcd.io/v1beta2
kind: Kustomization
metadata:
  name: apps
  namespace: flux-system
spec:
  dependsOn:
    - name: infrastructure
  interval: 3m0s
  serviceAccountName: kustomize-controller
  path: ./apps/overlays/development
  prune: true
  sourceRef:
    kind: GitRepository
    name: flux-system
```

{{% notice tip "最佳实践" %}}
Kubernetes 原生的 RBAC 权限控制无法细粒度的控制资源权限，如资源创建必须指定某些 Label 等。
但结合 Policy as Code，如 [Gatekeeper](https://github.com/open-policy-agent/gatekeeper), [Kyverno](https://kyverno.io/) 可以满足细粒度的管理需求。
{{% /notice %}}

为应用 `app-a` 创建了如下 Policy，仅允许应用通过自助的 Git 仓库在部署时仅可创建 Helm Chart 部署必须的 Secrets。

```yaml
apiVersion: kyverno.io/v1
kind: Policy
metadata:
  name: restrict-secrets-by-type
  namespace: app-a
  annotations:
    policies.kyverno.io/title: Restrict Secrets by Name
    policies.kyverno.io/category: security
    policies.kyverno.io/subject: Secret
    policies.kyverno.io/description: >-
      Disallow creating/deleting secrets in namespace 'app-a' beside the helm
      storage.
spec:
  background: false
  validationFailureAction: enforce
  rules:
    - name: safe-secrets-for-helm-storage
      match:
        resources:
          kinds:
            - Secret
      preconditions:
        all:
          - key: '{{request.operation}}'
            operator: In
            value:
              - CREATE
              - UPDATE
              - DELETE
          - key: '{{serviceAccountName}}'
            operator: Equals
            value: app-a-reconciler
      validate:
        message: Only Secrets are created by Helm v3+
        pattern:
          type: helm.sh/release.v1
```

## 四、租户隔离且自服务的应用持续部署

上一步为租户/应用 `app-a` 配置了独立的命令空间，部署权限，策略等。同时为应用 `app-a` 创建了[独立的 GitOps 仓库][tenant-a-repo]，
应用团队可以通过独立的 Git 仓库自主的发布其应用程序到不同的 STAGING 集群。
如示例中的仓库，应用团队使用 Kustomize 管理不同 STAGING 环境的部署，且通过 Helm 方式部署了电商应用 [Prestashop][prestashop]。
应用团队的部署可以使用由 infrastructure 团队统一管理的 External DNS, Ingress Class, 应用所在命名空间的 Secrets。

最终平台团队将应用 `app-a` 独立的仓库作为一个新的 GitOps 来源，通过如下配置将应用仓库的部署同集群关联上，

```yaml {hl_lines=[2,"7-9","20-23"]}
apiVersion: source.toolkit.fluxcd.io/v1beta1
kind: GitRepository
metadata:
  name: app-a-tenant
spec:
  interval: 1m
  url: https://github.com/zxkane/eks-gitops-app-a.git
  ref:
    branch: main  
---
apiVersion: kustomize.toolkit.fluxcd.io/v1beta2
kind: Kustomization
metadata:
  name: app-a-tenant
spec:
  serviceAccountName: app-a-reconciler
  interval: 5m0s
  retryInterval: 5m0s
  prune: true
  sourceRef:
    kind: GitRepository
    name: app-a-tenant
    namespace: app-a
  patches:
    - patch: |-
        - op: replace
          path: /spec/serviceAccountName
          value: app-a-reconciler
        - op: replace
          path: /metadata/namespace
          value: app-a
      target:
        group: helm.toolkit.fluxcd.io
        version: v2beta1
        kind: HelmRelease
    - patch: |-
        - op: replace
          path: /spec/serviceAccountName
          value: app-a-reconciler
        - op: replace
          path: /metadata/namespace
          value: app-a
      target:
        group: kustomize.toolkit.fluxcd.io
        version: v1beta2
        kind: Kustomization
    - patch: |-
        - op: replace
          path: /namespace
          value: app-a
      target:
        group: kustomize.config.k8s.io
        version: v1beta1
        kind: Kustomization
```

应用 `app-a` 团队将自助的通过**独立**的应用 [GitOps 仓库][app-a-repo]持续发布团队的应用。
如下示例 `app-a` 在其自助的 Git 仓库通过 [`HelmRelease` 部署了 Web 应用][app-a-helmrelease]。

```yaml
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  name: prestashop
spec:
  releaseName: prestashop
  chart:
    spec:
      chart: prestashop
      sourceRef:
        kind: HelmRepository
        name: bitnami
        namespace: app-a
      version: 14.0.10
  values:
    existingSecret: prestashop
    service:
      type: ClusterIP
    ingress:
      enabled: true
      path: '/*'
      annotations:
        alb.ingress.kubernetes.io/scheme: internet-facing
        alb.ingress.kubernetes.io/inbound-cidrs: '0.0.0.0/0'
        alb.ingress.kubernetes.io/auth-type: none
        alb.ingress.kubernetes.io/target-type: ip
        kubernetes.io/ingress.class: alb
        alb.ingress.kubernetes.io/ssl-policy: ELBSecurityPolicy-TLS-1-2-Ext-2018-06
        alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}]'
        alb.ingress.kubernetes.io/backend-protocol: HTTP
        alb.ingress.kubernetes.io/healthcheck-path: '/'
    persistence:
      enabled: false
      storageClass: gp2
    # for mariadb
    mariadb:
      enabled: false
    externalDatabase:
      host: mariadb.kube-system.svc.cluster.local
      user: prestashop
      database: prestashop
      existingSecret: prestashop-db-secrets
    allowEmptyPassword: false
  interval: 1h0m0s
  install:
    remediation:
      retries: 3
```

## 五、自动发布镜像更新

在本节实践中我们将使用 [Sock Shop][microservices-demo]（一个使用 Spring Boot, Go kit, Node.js 容器化的微服务示例应用）。
同在第三，第四章节配置应用 `app-a` 一样，为 `sock-shop` 应用在 infrastructure GitOps 仓库中创建了单独的命名空间、RBAC、独立的 Git 仓库来管理应用的发布，
具体实现可参考 [commit1][socks-shop-commit1], [commit2][socks-shop-commit2]。

### 1. 部署微服务应用程序 Sock Shop

在我们分叉的 [Sock Shop][microservices-demo] 通过 [Kustomization 实现][microservices-kustomize]了多集群部署的支持，
同时将 **front-end** 服务通过 `LoadBalancer` 类型对外暴露出来，利用 Amazon EKS 同 [Amazon Elastic Load Balancing][elb]
的集成来负载均衡 Sock Shop 应用的入口 **front-end** 服务。

```yaml {hl_lines=["8-24"]}
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ./complete-demo.yaml
patchesStrategicMerge:
  - delete-ns.yaml  
patches:
  - patch: |-
      - op: replace
        path: /spec/type
        value: LoadBalancer
      - op: replace
        path: /metadata/annotations/service.beta.kubernetes.io~1aws-load-balancer-type
        value: external
      - op: replace
        path: /metadata/annotations/service.beta.kubernetes.io~1aws-load-balancer-nlb-target-type
        value: ip
      - op: replace
        path: /metadata/annotations/service.beta.kubernetes.io~1aws-load-balancer-scheme
        value: internet-facing
    target:
      version: v1
      kind: Service
      name: front-end
```

通过定制化 **front-end** 微服务为我们的 Sock Shop 应用持续改进，最新的 **front-end**
通过自动化测试后打包的镜像版本通过 [Github packages][ghcr-front-end] 容器镜像仓库对外发布。
我们在 `DEV` 环境将使用 Kustomization overlays 将 **front-end** 微服务替换为定制化更新的版本。

```yaml {hl_lines=["14-17"]}
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ../../base
patches:
  - patch: |-
      - op: replace
        path: /metadata/annotations/external-dns.alpha.kubernetes.io~1hostname
        value: socks-dev.test.kane.mx
    target:
      version: v1
      kind: Service
      name: front-end
images:
- name: weaveworksdemos/front-end
  newName: ghcr.io/zxkane/weaveworksdemos/front-end
  newTag: 0.3.13-rc0
```

在 `DEV` 等可持续集成的敏捷环境，在构建新服务镜像且发布后，通过人工或脚本更新 GitOps 代码仓库显得过于繁琐。
Flux 自身提供了完善且强大的 [Git 仓库镜像自动升级][flux-automate-image-updates]功能。下面在我们的 GitOps 部署仓库来实现该能力。

{{% notice info "注意" %}}
镜像自动更新功能需要确保 Flux 在安装配置时已启用镜像自动更新组件。如未启用，可重复 **bootstrap** Flux 时加上
`--components-extra=image-reflector-controller,image-automation-controller` 参数来启用。
{{% /notice %}}

### 2. 注册 `front-end` 微服务的[镜像仓库][ghcr-front-end]

```yaml
apiVersion: image.toolkit.fluxcd.io/v1beta1
kind: ImageRepository
metadata:
  name: sock-shop-front-end
spec:
  image: ghcr.io/zxkane/weaveworksdemos/front-end
  interval: 1m0s
```

### 3. 设置镜像更新策略

如下规则 `^0.3.x-0` 将匹配 `0.3.13-rc0`, `0.3.13-rc1`, `0.3.13` 等镜像版本。

```yaml {hl_lines=["8-10"]}
apiVersion: image.toolkit.fluxcd.io/v1beta1
kind: ImagePolicy
metadata:
  name: sock-shop-front-end
spec:
  imageRepositoryRef:
    name: sock-shop-front-end
  policy:
    semver:
      range: '^0.3.x-0'
```

### 4. 创建自动镜像更新配置

Flux 自动镜像配置会指定应用配置的 Git 仓库，包括分支、路径等信息。

```yaml {hl_lines=["6-16","18-21"]}
apiVersion: image.toolkit.fluxcd.io/v1beta1
kind: ImageUpdateAutomation
metadata:
  name: sock-shop-front-end
spec:
  git:
    checkout:
      ref:
        branch: gitops
    commit:
      author:
        email: fluxcdbot@users.noreply.github.com
        name: fluxcdbot
      messageTemplate: '{{range .Updated.Images}}{{println .}}{{end}}'
    push:
      branch: gitops
  interval: 1m0s
  sourceRef:
    kind: GitRepository
    name: sock-shop-tenant
    namespace: sock-shop
  update:
    path: ./deploy/kubernetes/overlays/development
    strategy: Setters
```

### 5. 为应用 GitOps 仓库配置读写凭证

由于 Flux 需要将更新后的镜像版本信息提交回应用仓库，需要为 Flux 中配置的应用 `GitRepository` 指定**可读写**的访问凭证。
下面提供参考步骤创建 Git 仓库访问凭证并配置。

#### 1. 创建 Sealed Secret 保存 Git 仓库读写权限的私钥

```bash
kubectl -n sock-shop create secret generic flux-image-automation \
--from-file=identity=/path/gitops-image-update-id-ecdsa \
--from-file=identity.pub=/path/gitops-image-update-id-ecdsa.pub \ # 确保此公钥已配置在 Git 仓库且具有读写权限，如 Github 仓库的 `Deploy Keys`
--from-literal=known_hosts="github.com ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBEmKSENjQEezOmxkZMy7opKgwFB9nkt5YRrYMjNuG5N87uRgg6CLrbo5wAdT/y6v0mKV0U2w0WZ2YB/++Tpockg=" \
--dry-run=client \
-o yaml > flux-image-automation-secrets.yaml

kubeseal --format=yaml --cert=pub-sealed-secrets-dev.pem \    
< flux-image-automation-secrets.yaml > ./apps/overlays/development/sock-shop/sealed-git-token.yaml 
```

#### 2. 通过 Kustomize 为 `DEV` 环境的 `GitRepository` 配置指定访问凭证

```yaml {hl_lines=["6-10","30-44"]}
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: sock-shop
resources:
  - ../../../base/sock-shop
  - ./sealed-slack-secrets.yaml
  - ./sealed-git-token.yaml
  - ./registry.yaml
  - ./policy.yaml
  - ./image-automation.yaml
patches:
  - patch: |-
      - op: replace
        path: /spec/path
        value: ./deploy/kubernetes/overlays/development
    target:
      group: kustomize.toolkit.fluxcd.io
      version: v1beta2
      kind: Kustomization
      name: sock-shop-tenant
  - patch: |
      - op: replace
        path: /spec/channel
        value: gitops-flux
    target:
      group: notification.toolkit.fluxcd.io
      version: v1beta1
      kind: Provider
      name: slack
  - patch: |
      - op: replace
        path: /spec/url
        value: git@github.com:zxkane/microservices-demo.git
      - op: replace
        path: /spec/secretRef
        value: {}
      - op: replace
        path: /spec/secretRef/name
        value: flux-image-automation
    target:
      group: source.toolkit.fluxcd.io
      version: v1beta1
      kind: GitRepository
      name: sock-shop-tenant  
```

### 6. 验证镜像自动更新

更新微服务 `front-end` 代码且**tag**版本后，新的镜像版本被发布到[镜像仓库][ghcr-front-end]。
通过前面配置的 `ImageRepository` 和 `ImagePolicy` 扫描到 `front-end` 镜像符合策略的新版本发布，
根据 `ImageUpdateAutomation` 配置的 [Sock Shop 应用仓库][sock-shop-repo]，查找指定的镜像变量，
Flux 的 `image-automation-controller` 自动将[更新的镜像信息提交到应用仓库][flux-image-update-commit]实现持续部署。

{{< figure src="/posts/gitops/images/flux-image-automation-update-event.jpg" alt="图1：镜像自动更新消息通知" >}}

## 六、小结及展望

本文介绍了如何使用 GitOps 工具 FluxCD v2 构建企业内部在 Kubernetes 上持续交付共享服务平台，
将平台团队和应用/业务团队统一在同样的 Git 工作流程下，同时授权应用/业务团队用自服务的方式持续交付应用的敏捷部署。
此方案将**安全**和**效率**有效的结合在一起。前述的示例可在[此仓库][repo]获取完整的 GitOps 代码。

同时面对复杂的企业场景，还有一些方面还可以持续的优化，例如，

- 面对关键的线上生产系统，如何安全增量的灰度发布？
- Sealed Secrets 引入了额外的私钥管理需求，在云计算环境如何改善 GitOps 秘钥的管理？
- 如何将云平台的资源 IaC 同 Kubernetes 内资源 GitOps 协同管理？
- 如何更加高效的开发 Kubernetes manifests(YAML)？

将在后续的文章中逐个探讨这些问题。

[flux-in-action-1]: {{< relref "/posts/gitops/flux-in-action-1.md" >}}
[k8s-namespaces]: https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/
[resource-quotas]: https://kubernetes.io/docs/concepts/policy/resource-quotas/
[k8s-rbac]: https://kubernetes.io/docs/reference/access-authn-authz/rbac/
[network-policies]: https://kubernetes.io/docs/concepts/services-networking/network-policies/
[persistent-volumes]: https://kubernetes.io/docs/concepts/storage/persistent-volumes/
[repo]: https://github.com/zxkane/eks-gitops
[cross-namespace-ref]: https://fluxcd.io/docs/components/kustomize/kustomization/#cross-namespace-references
[kustomization]: https://fluxcd.io/docs/components/kustomize/kustomization/
[helmreleases]: https://fluxcd.io/docs/components/helm/helmreleases/
[flux-source]: https://fluxcd.io/docs/components/source/
[impersonation]: https://fluxcd.io/docs/components/kustomize/kustomization/#enforce-impersonation
[tenant-a-repo]: https://github.com/zxkane/eks-gitops-app-a
[prestashop]: https://github.com/bitnami/charts/tree/master/bitnami/prestashop
[microservices-demo]: https://github.com/microservices-demo/microservices-demo
[socks-shop-commit1]: https://github.com/zxkane/eks-gitops/commit/67ae5a74069d51f5a38ea2e5e7322932543db9b3
[socks-shop-commit2]: https://github.com/zxkane/eks-gitops/commit/abbcb3c1326e546f2b5dcbda8c68815d76d0a22e
[microservices-kustomize]: https://github.com/zxkane/microservices-demo/blob/gitops/deploy/kubernetes/base/kustomization.yaml
[elb]: https://aws.amazon.com/elasticloadbalancing/
[ghcr-front-end]: https://github.com/zxkane/front-end/pkgs/container/weaveworksdemos%2Ffront-end
[flux-automate-image-updates]: https://fluxcd.io/docs/guides/image-update/
[gatekeeper]: https://github.com/open-policy-agent/gatekeeper
[kyverno]: https://kyverno.io/
[app-a-repo]: https://github.com/zxkane/eks-gitops-app-a
[app-a-helmrelease]: https://github.com/zxkane/eks-gitops-app-a/blob/main/base/prestashop.yaml
[sock-shop-repo]: https://github.com/zxkane/microservices-demo
[flux-image-update-commit]: https://github.com/zxkane/microservices-demo/commit/adc652eee462a7db9df1388a9be5fb5dc73626b2