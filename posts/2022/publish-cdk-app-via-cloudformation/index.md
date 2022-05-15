---
title: "Publish your AWS CDK applications via AWS CloudFormation templates"
description : "Provide one-click deployment user experience for your CDK applications"
date: 2022-05-15
draft: false
toc: true
figurePositionShow: true
thumbnail: posts/2022/publish-cdk-app-via-cloudformation/images/cover.png
categories:
- blogging
series:
- effective-cloud-computing 
isCJKLanguage: false
tags:
- AWS CDK
- AWS CloudFormation
- AWS
- Tip
---

[AWS CDK][cdk-intro] is a great abstract to accelerate managing the cloud infrastructure as code.
The journey will be enjoyful with leveraging the [Construct Hub][construct-hub] to use the high level contributions from AWS partners and commnunity.

### Use Case

[AWS CloudFormation][cloudformation] is one of the underly technologies of AWS CDK to manage the cloud infrastructure.
It easily to enable the IT administrators even business operators whom has no/limited developer skills to
develop the [end-to-end solutions][solutions-library] with one-click user experience.

So it's a use case for effectively developing the **Cloud Application** via AWS CDK, 
then publishing it as CloudFormation template with better user experimental experience.

<!--more-->

### `cdk synth` command

CDK has a built-in capability to synthesize its application to CloudFormation templates, 
as known as the [cdk synth][cdk-synth] command. You can upload the syntheized output templates to Amazon S3 bucket,
then deploy it via AWS CloudFormation. Looks like it's quite easy to publish the CDK application as CloudFormation templates.

### Why `cdk synth` does not work

However above procedure is not working in most case while orchestrating a large application in cloud.
Due to the CDK applications probably contains [assets][cdk-assets] which need be uploaded to S3 and ECR before deploying the application.
For example, a CDK application with using [Node.js Function][aws-lambda-nodejs], [Python Function][aws-lambda-python],
[S3 Deployment][aws-s3-deployment], [Docker Image Assets][aws-ecr-assets] and so on will be synthesized to the templates
that are not deployable directly. It requires to publish those assets(both S3 and ECR assets) firstly, then deploy
the templates with [parameters][cfn-parameters] pointing to the assets. This step is difficult to be completed manually,
because the assets are named with its content hash are not readable by human being.

### `cdk-assets` command

Hence there is another experimental tool provided with CDK project, it's [cdk-assets][cdk-assets-cli].
`cdk-assets` command use the outputs of `cdk synth`, then publish the assets of application to S3 and ECR,
and update the templates to refer to the assets in S3 and ECR. Looks like the utility perfectly fits the requirement of my use case.

### `cdk-assets` drawbacks

But it still has some drawbacks for this solution. For some AWS services, the assets are mandatorily required from same region.
It means that the Lambda code packages(reside on S3) must be from same region S3 bucket, 
the container images(reside on ECR) must be from same region of SageMaker training job / inference endpoint.
For the applications with multiple regions support, we have to replicate above procedure in multiple times 
and provide multiple CloudFormation links per region like below. It means the users can not switch to another region via region selector after opening one of the links.

<!--{{< figure src="/posts/2022/publish-cdk-app-via-cloudformation/images/cfn-for-multiple-regions.jpg" alt="CloudFormation link per region" >}}-->
![CloudFormation link per region](/posts/2022/publish-cdk-app-via-cloudformation/images/cfn-for-multiple-regions.jpg "CloudFormation link per region")

### the solution `cdk-bootstrapless-synthesizer`

There is another commnuity tool [cdk-bootstrapless-synthesizer][cdk-bootstrapless-synthesizer] to resolve above painful perfectly.
It can help synthesize a single CloudFormation template entrypoint, then deploy it to any supported regions.
Also it provides [a pipeline example][pipeline-example](based on AWS CodePipeline) to publish a CDK application to CloudFormation template with multiple regions supported.

[cdk-intro]: {{< relref "/posts/2019/aws-cdk.md" >}}
[construct-hub]: https://constructs.dev/
[cloudformation]: https://aws.amazon.com/cloudformation/?nc1=h_ls
[solutions-library]: https://aws.amazon.com/solutions/browse-all/
[cdk-synth]: https://docs.aws.amazon.com/cdk/v2/guide/cli.html#cli-synth
[cdk-assets]: https://docs.aws.amazon.com/cdk/v2/guide/assets.html
[aws-lambda-nodejs]: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs-readme.html
[aws-lambda-python]: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-lambda-python-alpha-readme.html
[aws-s3-deployment]: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3_deployment-readme.html
[aws-ecr-assets]: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ecr_assets-readme.html
[cfn-parameters]: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/parameters-section-structure.html
[cdk-assets-cli]: https://www.npmjs.com/package/cdk-assets
[cdk-bootstrapless-synthesizer]: https://github.com/aws-samples/cdk-bootstrapless-synthesizer
[pipeline-example]: https://github.com/aws-samples/cdk-bootstrapless-synthesizer/tree/main/sample-pipeline