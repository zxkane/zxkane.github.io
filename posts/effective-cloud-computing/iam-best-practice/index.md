---
title: "IAM最佳实践"
description : "企业上云最基本的账户权限安全实践"
date: 2019-02-01
draft: false
thumbnail: posts/effective-cloud-computing/iam-best-practice/images/cover.jpg
aliases:
- /posts/effective-cloud-computing-series/iam-best-practice/
series:
- effective-cloud-computing
isCJKLanguage: true
tags:
- 云计算
- 阿里云
- AWS
- IAM
---
企业使用公有云服务的第一件事情就是创建云帐号，有了帐号之后如何让企业员工安全合规的使用云帐号下的各种资源是开启云之旅后的第一个考验。

云计算厂商针对企业上云后面临的第一个需求已经推出了完善的解决方案--[Identity and Access Management][iam]。[IAM][iam]可以帮助云帐号安全地控制对云计算服务资源的访问。企业可以使用IAM控制对哪个用户进行身份验证 (登录) 和授权 (具有权限) 以使用资源。

云厂商是否提供完善的IAM服务可以作为整体产品解决方案是否成熟的一个衡量指标，比如AWS的[IAM][aws-iam]和阿里云的[访问控制][aliyun-ram]都是较为成熟完善的产品。国内某个以AI能力为卖点的云厂商，在IAM产品方面几乎为零，很难相信对安全合规有需求的企业会完整使用他的云产品作为解决方案。

<!--more-->
[IAM][iam]通常提供以下功能:

### 对云账户的共享访问权限
允许在一个云账户下创建并管理多个用户身份，并允许给单个身份或一组身份（既可以是当前云帐号下也可以是其他云帐号下）分配不同的权限策略，从而实现不同用户拥有不同的云资源访问权限，而不必共享云帐号根用户的密码或访问密钥。

### 精细权限
可以针对不同资源向不同人员授予不同权限。可以要求用户必须使用安全信道（如 SSL）、在指定时间范围、或在指定源 IP 条件下才能操作指定的云资源。

### 多重验证 (MFA)
可以向云账户和各个用户添加双重身份验证以实现更高安全性。借助[MFA][mfa]，用户不仅必须提供使用账户所需的密码或访问密钥，还必须提供来自经过特殊配置的设备的代码。

### 联合身份
可以允许已在其他位置（例如，在企业网络中或通过 Internet 身份提供商）获得密码的用户获取对云账户的用户访问权限。

后面会有专门的文章来讲如何实践联合身份。

### 统一账单
云账户接收包括所有用户的资源操作所发生费用的统一账单。

> 尽管[IAM][iam]提供了上面种种功能，云帐号的管理者仍可通过一些最佳实践来更好的使用IAM产品来提升安全级别和减少运维成本。

## IAM最佳实践

- 尽量不要使用云帐号的根用户，**不要为根用户创建AK**。云帐号管理员也使用各自独立的子账号。
- **为企业中每一个需要使用云服务的员工单独创建子账户，且默认不允许创建AK**。便于员工离职的时候，通过删除帐号来完全清理用户在云计算平台的各种权限。
- 密码安全实践，
  - 限制密码强度**不少于8位**，必须**由大小写字母、数字和符号中的三种组成**。
  - 强制密码**过期时间不超过90天**，且过期后不可登录。
  - 新密码至少**禁止使用前3次密码**。
  - 设置密码重试约束，例如，**一小时内使用错误密码最大尝试9次登录**。
- 强制所有用户启用[两步认证][mfa]。
- 对访问网络有限制的企业，可以开启登录IP限制。
- [**推荐做法**]已有SSO单点登录系统的企业，可以通过[SAML 2.0标准][saml-2.0]实现从企业本地账号系统登录到阿里云，从而满足企业的统一用户登录认证要求。
- 细粒度的权限管理，
  - **为各种云资源创建最细粒度的权限策略**。例如，分别为RDS实例`rds-instance-1`创建只读权限策略`rds-instance-1-readonly-access`，RDS实例`rds-instance-2`创建只读权限策略`rds-instance-2-readonly-access`。
  - **根据职能、部门等维度为云帐号子用户创建用户组**。例如，按项目创建用户组，`group-project-a`，`group-project-b`。如果`project-a`用户需要访问`rds-instance-1`的信息，将自定义权限`rds-instance-1-readonly-access`授权给`group-project-a`。再将相关用户加到用户组`group-project-a`中，这样这些用户就具有只读访问RDS实例`rds-instance-1`的权限。而不是将所有RDS的读写权限都授予这些用户，**最大限度的保证用户不获取超过实际需要的权限**。
  - 在实际场景中，通常会通过云计算服务的API来完成某些周期性任务，比如每日RDS中的慢查询统计、云帐号每日花费统计等。这些任务都需要一个云帐号的AK来完成API的身份认证。最佳的做法是，**为每类相关的任务创建一个`功能性子账号`**，禁用他们的web登录，且遵循特殊的命名规范(`functional-`开头)，比如`functional-rds-stats`、`functional-cost-stats`。创建最小的权限策略，然后分配给这些功能性用户。例如，`functional-rds-stats`仅被授予RDS只读权限，`functional-cost-stats`仅被授予费用的只读权限。为这些子账号创建AK，每类任务使用不同的AK来完成API认证，而不是都使用同一个AK。这样的好处是，不同类型任务的AK具有不同的权限，最大限度的保护了云帐号的安全，并且这些AK不跟实际的员工子账号关联，不会因为员工帐号的变更而受影响。如有更高的安全合规的要求下，可以定期作废已有AK，创建新AK替换。至于AK怎样安全管理，之后会有专门的文章来详解。

[iam]: https://en.wikipedia.org/wiki/Identity_management
[aws-iam]: https://docs.aws.amazon.com/zh_cn/IAM/latest/UserGuide/introduction.html
[aliyun-ram]: https://help.aliyun.com/document_detail/28627.html
[mfa]: https://en.wikipedia.org/wiki/Multi-factor_authentication
[saml-2.0]: https://en.wikipedia.org/wiki/SAML_2.0
