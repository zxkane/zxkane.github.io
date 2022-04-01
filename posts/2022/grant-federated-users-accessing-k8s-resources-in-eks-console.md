---
title: "Grant federated users accessing kubernetes resources in EKS console"
description : "Explore your kubernetes resources in EKS console UI"
date: 2022-02-09
draft: false
thumbnail: https://cdn-ak.f.st-hatena.com/images/fotolife/c/cloudfish/20200116/20200116173700.png
categories:
- blogging
isCJKLanguage: false
tags:
- Kubernetes
- AWS EKS
- Tip
- AWS
---

Though you're administrator of your AWS account, you probably see below warnings when viewing your cluster in EKS console.

> Your current user or role does not have access to Kubernetes objects on this EKS cluster.

<!--more-->

It's caused by the Kuberentes has itself RBAC authorization. And AWS uses [IAM][iam] to grant permissions to users.
You have to [map your IAM user or role to K8S RBAC authorization][eks-add-user-role] to grant the permissions to access K8S resources in EKS cluster.

Above documentation demonstrate how adding IAM roles/users to EKS cluster to grant the roles/users to access K8S resources. 
However the documentation is not clear to how adding federated users to EKS cluser.

I'm facing two scenarios of federated AWS users to access K8S resources in EKS console,

1. Use corp SSO to access internal system, then logging into AWS account via assuming existing role of the AWS account
2. Use tool like [AWS Vault][aws-vault]/[Alfred workflow][alfred-aws-vault-worfklow] to login AWS console via ak/sk of an IAM user

Finally turn out below configuration to grant both federated users to access K8S resources in EKS console,

{{< highlight yaml "codeFences=false">}}
apiVersion: v1
data:
  mapRoles: |
    - groups:
      - system:bootstrappers
      - system:nodes
      rolearn: arn:aws:iam::123456789012:role/cluster-nodegroup-n-NodeInstanceRole-1OQT1WT84WVS8 # created by eksctl when bootrapping cluster
      username: system:node:{{EC2PrivateDNSName}}
    - groups:
        - eks-console-dashboard-full-access-group
      rolearn: arn:aws:iam::123456789012:role/Admin # granting the federated user via assuming role
      username: Admin/kane
  mapUsers: |
    - userarn: arn:aws:sts::123456789012:federated-user/kane # granting the federated user via aws-vault
      username: ops-user
      groups:
        - eks-console-dashboard-full-access-group
{{< /highlight >}}

[kuberenets-rbac]: https://kubernetes.io/docs/reference/access-authn-authz/rbac/
[security-iam-troubleshoot-cannot-view-nodes-or-workloads]: https://docs.aws.amazon.com/eks/latest/userguide/troubleshooting_iam.html#security-iam-troubleshoot-cannot-view-nodes-or-workloads
[iam]: https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html
[eks-add-user-role]: https://docs.aws.amazon.com/eks/latest/userguide/add-user-role.html
[aws-vault]: https://github.com/99designs/aws-vault
[alfred-aws-vault-worfklow]: http://www.packal.org/workflow/open-aws-aws-vault