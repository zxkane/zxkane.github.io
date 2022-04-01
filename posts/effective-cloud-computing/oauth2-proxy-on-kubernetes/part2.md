---
title: "为Kubernetes中任意应用添加基于oauth2的认证保护 (下)"
description : "企业IAM实战(二)"
date: 2019-04-08
draft: false
thumbnail: /posts/effective-cloud-computing/oauth2-proxy-on-kubernetes/images/part2.png
series:
- effective-cloud-computing
categories:
- kubernetes
isCJKLanguage: true
tags:
- 云计算
- IAM
- kubernetes
- oauth2
- 钉钉
- dingtalk
- AWS
- AWS EKS
---
本文是[为Kubernetes中任意应用添加基于oauth2的认证保护][part1]的下篇，将图文详解如何使用基于[钉钉认证][dingtalk-auth]的[oauth2 proxy][oauth2-proxy]为自身本没有认证授权功能的Web站点实现认证及授权。

<!--more-->
> 示例是使用的[AWS EKS][aws-eks]服务作为K8S环境。鉴于K8S的应用运行时属性，该示例也可以部署在其他云厂商托管的K8S。

### 示例模块简介
- [Nginx Ingress Controller][nginx-ingress]为K8S集群内Web应用提供反向代理，以及支持外部认证。
- 简单的Web站点，基于[Nginx docker容器][docker-nginx]。该站点默认没有认证及授权功能，使用外部[钉钉][dingtalk-auth]应用作为认证及授权。
- [OAuth2 Proxy on Dingtalk][dingtalk-oauth2-proxy]提供基于[钉钉][dingtalk-auth]应用的扫码认证及授权，只有认证且授权的用户才可以访问上面的Web站点。

### 默认设定

- Web站点域名`web.kane.mx`
- 认证服务域名`oauth.kane.mx`

### 准备[AWS EKS][aws-eks]环境

1. [创建EKS集群][create-eks-cluster]。由于[Nginx Ingress][nginx-ingress]服务是LoadBalancer类型，EKS创建NLB或ELB对应的targets时需要targets部署在public VPC subnets，所以为了简化部署EKS集群的VPC subnets都选择public subnet。新建的EKS集群允许公开访问。
2. [本地安装配置kubectl, aws-iam-authenticator][eks-kubectl-config]用于远程管理集群。
3. [为集群添加worker节点][eks-launching-worker-nodes]。
4. [配置Helm部署环境][eks-helm]。

### 钉钉应用准备

1. 为企业或组织开通[钉钉开发平台][dingtalk-open-dev]
2. 创建一个新的[移动应用][dingtalk-login-app]。回调域名填写`<http or https>/<认证服务域名>/oauth2/callback`。记录下来应用的`appId`和`appSecret`。
3. 创建一个[企业内部工作台应用][dingtalk-create-bench]。地址可以随意设置。服务器出口IP设置为`EKS集群中工作节点的公网IP`或者`NAT EIP`，取决于工作节点如何访问Internet。并记录下来应用`appKey`和`appSecret`。

### 部署示例应用

1. 克隆[示例][hands-on-dingtalk-oauth2-proxy]部署脚本。
1. 替换`values.yaml`中的`dingtalk_corpid`为工作台应用的`appKey`， `dingtalk_corpsecret`为工作台应用的`appSecret`。
        由于社区维护的[oauth2-proxy charts][helm-charts-oauth2-proxy]并不支持dingtalk扩展的SECRET ENV，所以将密钥配置到了`configmap`中。用于生产环境的话，建议按[这个commit][helm-charts-oauth2-proxy-dingtalk]使用`secret`保存应用secret。
{{< highlight yaml "linenos=table,hl_lines=10-11,linenostart=62">}}
oauth2-proxy:
  config:
    clientID: aaa
    clientSecret: bbb
    cookieSecret: ccc
    configFile: |+
      email_domains = [ "*" ]
      cookie_domain = "kane.mx"
      cookie_secure = false
      dingtalk_corpid = "<appkey of dingtalk app>"
      dingtalk_corpsecret = "<appsecret of dingtalk app>"
{{< /highlight >}}
如果仅希望企业部分部门的员工可以获得授权，在上面`configFile`配置下添加如下配置，
{{< highlight yaml>}}
dingtalk_departments = ["xx公司/产品技术中心","xx公司/部门2/子部门3"]
{{< /highlight >}}
1. 替换部署应用的域名为你的域名。
1. 执行以下命令安装Helm部署依赖。
{{< highlight bash>}}
helm dep up
{{< /highlight >}}
1. 执行以下命令部署nginx ingress controller, web应用以及oauth2 proxy
{{< highlight bash>}}
helm upgrade --install -f values.yaml --set oauth2-proxy.config.clientID=<移动应用appid>,oauth2-proxy.config.clientSecret=<移动应用appsecret> site-with-auth --wait ./
{{< /highlight >}}
如果集群中已经部署了`Nginx Ingress Controller`，修改`values.yaml`如下将忽略部署Nginx ingress，
{{< highlight yaml "linenos=table,hl_lines=4,linenostart=47">}}
affinity: {}

nginx-ingress:
  enabled: false
  controller:
    ingressClass: nginx
    config:
{{< /highlight >}}
1. 部署成功后，获取`ELB`地址。
{{< highlight zsh>}}
kubectl get svc -o jsonpath='{ $.status.loadBalancer.ingress[*].hostname }' <deployment name>-nginx-ingress-controller;echo
a3afe672259c511e98e2a0a0d88fda3e-xx.elb.ap-southeast-1.amazonaws.com
{{< /highlight >}}

### 部署成功后配置
将站点和oauth服务域名解析到上面部署创建的ELB上。

### 测试
访问Web站点(如本示例中的`http://web.kane.mx`)，未授权的情况下，调转到钉钉应用扫码登录界面。使用组织内成员的钉钉扫码授权后，将跳转回Web站点应用，可以正常浏览该域名下的页面。

[dingtalk-auth]: https://open-doc.dingtalk.com/microapp/serverapi2/kymkv6
[oauth2-proxy]: https://github.com/bitly/oauth2_proxy
[part1]: {{< relref "part1.md" >}}
[create-eks-cluster]: https://docs.aws.amazon.com/eks/latest/userguide/create-cluster.html
[aws-eks]: https://aws.amazon.com/eks/?nc1=f_ls
[nginx-ingress]: https://github.com/kubernetes/ingress-nginx
[eks-kubectl-config]: https://docs.aws.amazon.com/eks/latest/userguide/managing-auth.html
[eks-launching-worker-nodes]: https://docs.aws.amazon.com/eks/latest/userguide/launch-workers.html
[eks-helm]: https://docs.aws.amazon.com/eks/latest/userguide/helm.html
[docker-nginx]: https://hub.docker.com/_/nginx
[dingtalk-oauth2-proxy]: https://github.com/zxkane/oauth2_proxy
[dingtalk-open-dev]: https://open-dev.dingtalk.com/#/index
[dingtalk-login-app]: https://open-dev.dingtalk.com/#/loginAndShareApp
[dingtalk-create-bench]: https://open-dev.dingtalk.com/#/create-bench/self
[hands-on-dingtalk-oauth2-proxy]: https://github.com/zxkane/hands-on-dingtalk-oauth2-proxy
[helm-charts-oauth2-proxy]: https://github.com/helm/charts/tree/master/stable/oauth2-proxy
[helm-charts-oauth2-proxy-dingtalk]: https://github.com/pilipa-cn/charts/commit/7ac0f67acc71577275f743bdcf9a870bd65361b0
