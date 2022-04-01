---
title: "Effective AWS CDK for AWS CloudFormation"
description : "Effectively write AWS CDK application then deploy it via AWS CloudFormation across multiple regions"
date: 2020-12-16
draft: false
thumbnail: posts/2020/effective-aws-cdk-for-aws-cloudformation/images/cover.jpg
categories:
- blogging
series:
- effective-cloud-computing
isCJKLanguage: false
tags:
- Infrastructure as Code
- AWS CloudFormation
- AWS CDK
- AWS
---

[Infrastructure as Code][infra-as-cdoe] is the trend to manage the resources of application. [AWS CloudFormation][aws-cloudformation] is the managed serive offering the IaC capability on AWS [since 2011][cloudformation-announcement-blog]. CloudFormation uses the [declarative language][declarative-programming] to manage your AWS resources with the style what you get is what you declare.

However there are cons of CloudFormation as a declarative language,
- the readability and maintanence for applications involving lots of resources
- the reuseable of code, [CloudFormation modules][cloudformation-modules] released in re:Invent 2020 might help mitgate it

[AWS CDK][cdk-intro] provides the programming way to define the infra in code by your preferred programming languages, such as Typescript, Javascripte, Python, Java and C#. AWS CDK will synthesis the code to CloudFormation template, then deploying the stack via AWS CloudForamtion service. It benefits the Devops engineers manage the infra on AWS as programming application, having version control, code review, unit testing, integration testing and CI/CD pipelines, the deployment still depends on the mature CloudFormation service to rolling update the resources and rollback when failing.

For solution development, using CDK indeed improves the productivity then publish the deployment assets as CloudFormation templates.

Though CDK application can be synthesized to CloudFormation template, there are still some differences blocking the synthesized tempaltes to be deployed across multiple AWS regeions. 

This post will share the tips on how effectively writing AWS CDK application then deploying the application by CloudFormation across multiple regions.

<!--more-->

## General
### Environment-agnostic stack

Don’t specify env with `account` and `region` like below that will generate account/region hardcode in CloudFormation template.

{{< highlight ts >}}
new MyStack(app, 'Stack1', {
    env: {
      account: '123456789012',
      region: 'us-east-1'
    },
});
{{< /highlight >}}

### use CfnMapping/CfnCondition instead of if-else clause

CloudFormation does not have logistic processing like programming language. Use `CfnMapping` or `CfnCondition` instead.

**Note**: the `CfnMapping` does not support default value, you have to list all supported regions like below code snippet,

{{< highlight ts >}}
getAwsLoadBalancerControllerRepo() {
    const albImageMapping = new cdk.CfnMapping(this, 'ALBImageMapping', {
      mapping: {
        'me-south-1': {
          2: '558608220178',
        },
        'eu-south-1': {
          2: '590381155156',
        },
        'ap-northeast-1': {
          2: '602401143452',
        },
        'ap-northeast-2': {
          2: '602401143452',
        },
        ...        
        'ap-east-1': {
          2: '800184023465',
        },
        'af-south-1': {
          2: '877085696533',
        },
        'cn-north-1': {
          2: '918309763551',
        },
        'cn-northwest-1': {
          2: '961992271922',
        },
      }
    }); 
    return `${albImageMapping.findInMap(cdk.Aws.REGION, '2')}.dkr.ecr.${cdk.Aws.REGION}.${cdk.Aws.URL_SUFFIX}/amazon/aws-load-balancer-controller`;
  }
{{< /highlight >}}

## never use Stack.region

**Don’t** rely on `stack.region` to do the logistic for China regions. Use additional `context` parameter or `CfnMapping` like below snippet,

{{< highlight ts >}}
const partitionMapping = new cdk.CfnMapping(this, 'PartitionMapping', {
    mapping: {
      aws: {
        nexus: 'quay.io/travelaudience/docker-nexus',
        nexusProxy: 'quay.io/travelaudience/docker-nexus-proxy',
      },
      'aws-cn': {
        nexus: '048912060910.dkr.ecr.cn-northwest-1.amazonaws.com.cn/quay/travelaudience/docker-nexus',
        nexusProxy: '048912060910.dkr.ecr.cn-northwest-1.amazonaws.com.cn/quay/travelaudience/docker-nexus-proxy',
      },
    }
  });
partitionMapping.findInMap(cdk.Aws.PARTITION, 'nexus');
{{< /highlight >}}

Use **core.Aws.region** token refered to the region which region of the stack is deployed.

### explicitly add dependencies on resources to control the creation/deletion order of resources

For example, when deploying a solution with creating a new VPC with NAT gateway, then deploying EMR cluster in private subnets of VPC. The EMR cluster might fail on creation due to network issue. It’s caused by the NAT gateway is not ready when initializing the EMR cluster, you have to manually create the dependencies among EMR cluster and NAT gateway.

## EKS module(@aws-cdk/aws-eks)

### ~~specify kubectl layer when creating EKS cluster~~

**NOTE**: This tricky only applies for AWS CDK prior to [1.81.0][cdk-release-1.81.0]. CDK will [bundle `kubectl`, `helm` and `awscli` as lambda layer][cdk-pr-12129] instead of SAR appliction since [1.81.0][cdk-release-1.81.0], it resolves below limitation.

EKS uses a lambda layer to run `kubectl`/`helm` cli as custom resource, the `@aws-cdk/aws-eks` module depends on the `Stack.region` to check the region to be deployed in synthesizing phase. It violates the principle of Environment-agnostic stack! Use below workaround to create the EKS cluster,

{{< highlight ts >}}
const partitionMapping = new cdk.CfnMapping(this, 'PartitionMapping', {
  mapping: {
    aws: {
      // see https://github.com/aws/aws-cdk/blob/60c782fe173449ebf912f509de7db6df89985915/packages/%40aws-cdk/aws-eks/lib/kubectl-layer.ts#L6
      kubectlLayerAppid: 'arn:aws:serverlessrepo:us-east-1:903779448426:applications/lambda-layer-kubectl',
    },
    'aws-cn': {
      kubectlLayerAppid: 'arn:aws-cn:serverlessrepo:cn-north-1:487369736442:applications/lambda-layer-kubectl',
    },
  }
});

const kubectlLayer = new eks.KubectlLayer(this, 'KubeLayer', {
  applicationId: partitionMapping.findInMap(cdk.Aws.PARTITION, 'kubectlLayerAppid'),
});
const cluster = new eks.Cluster(this, 'MyK8SCluster', {
  vpc,
  defaultCapacity: 0,
  kubectlEnabled: true,
  mastersRole: clusterAdmin,
  version: eks.KubernetesVersion.V1_16,
  coreDnsComputeType: eks.CoreDnsComputeType.EC2,
  kubectlLayer,
});
{{< /highlight >}}

If you're interested on this issue, [see cdk issue for detail](https://github.com/aws/aws-cdk/issues/12018).

### manage the lifecycle of helm chart deployment

The k8s helm chart might create AWS resources out of CloudFormation scope. You have to manage the lifecycle of those resources by yourself. 

For example, there is an EKS cluster with AWS load balancer controller, then you deploy a helm chart with ingress that will create ALB/NLB by the chart, you must clean those load balancers in deletion of the chart. Also the uninstallation of Helm chart is asynchronous, you have to watch the deletion of resource completing before continuing to clean other resources.

## THE END

> The tips will be updated when something new is found or the one is deprecated after CDK is updated.
> 
> HAPPY CDK :satisfied:

[infra-as-cdoe]: https://en.wikipedia.org/wiki/Infrastructure_as_code
[aws-cloudformation]: https://aws.amazon.com/cloudformation/
[cloudformation-announcement-blog]: https://aws.amazon.com/blogs/aws/cloudformation-create-your-aws-stack-from-a-recipe/
[declarative-programming]: https://en.wikipedia.org/wiki/Declarative_programming
[cloudformation-modules]: https://aws.amazon.com/blogs/mt/introducing-aws-cloudformation-modules/
[cdk-release-1.81.0]: https://github.com/aws/aws-cdk/releases/tag/v1.81.0
[cdk-pr-12129]: https://github.com/aws/aws-cdk/pull/12129
[cdk-intro]: {{< relref "/posts/2019/aws-cdk.md" >}}