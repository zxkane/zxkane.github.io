---
title: "Find out the most costly resources in your AWS account"
description : "Know how your money cost insightly"
date: 2022-02-20
draft: false
thumbnail: https://cdn.geekwire.com/wp-content/uploads/2018/04/header-630x450-630x450.png
categories:
- blogging
series:
- effective-cloud-computing
isCJKLanguage: false
tags:
- AWS
- Cost
- Athena
- Glue
- Tip
---
As a builder in cloud, you might feel confused about which resources cost mostly in your account.

In AWS, you can quickly find out which services even functionality cost a lot via [AWS Billing][aws-billing] or 
[AWS Cost Explorer][cost-explorer]. However sometimes it sucks on finding out which functions cost mostly if 
you have hundreds of Lambda functions, or which metrics/log groups cost mostly in [Amazon CloudWatch][cloudwatch].

<!--more-->

[AWS Cost and Usage Reports][cur] should be helpful in above scenairos. 
The AWS Cost and Usage Reports (AWS CUR) contains the most comprehensive set of cost and usage data available, 
including product and product resource, and tags that you define yourself.
You can use Cost and Usage Reports to publish your AWS billing reports to an Amazon S3 bucket that you own. 
The CUR reports are plain CSV text file, you still need analysis the report to find out the insight what you want.
So [Amazon Athena][athena] is one of simplest and effcientst ways to analyze your cost on demand. 
See [the doc][cur-query-athena] to how set up the Athea to analyze your AWS cost.

> Athena is out-of-the-box integrated with AWS Glue Data Catalog, allowing you to create a unified metadata repository across various services.
With Amazon Athena, you pay only for the queries that you run. See [my post][get-docker-image-size-post] how 
using Glue and Athena to analyze images in Docker repository.

Below are few samples to find out the mostly cost resources in your AWS account,

{{< highlight sql "codeFences=false">}}
SELECT line_item_resource_id as resource, sum(line_item_unblended_cost) as total_cost  FROM "athenacurcfn_main_account"."main_account" 
WHERE year='2022' and month='1' and product_product_name = 'AmazonCloudWatch' 
GROUP BY line_item_resource_id
ORDER BY total_cost DESC
LIMIT 10
{{< /highlight >}}
**Sample 1**: find out the top 10 costly resources in CloudWatch, including Log Groups, Metrics, Synthetics and so on

{{< highlight sql "codeFences=false">}}
SELECT line_item_resource_id, sum(line_item_usage_amount) as usage_amount, sum(line_item_blended_cost) as paid_amount FROM "athenacurcfn_main_account"."main_account"
    WHERE line_item_product_code='AWSLambda' and product_group='AWS-Lambda-Duration'
    and year='2022' and month='1'
    GROUP BY line_item_resource_id
    ORDER BY usage_amount desc
    LIMIT 10;
{{< /highlight >}}
**Sample 2**: find out the top 10 costly Lambda functions

You can refer to [Data dictionary of CUR][data-dict] to understand the field definitions of report.

[aws-billing]: https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/billing-what-is.html
[cost-explorer]: https://aws.amazon.com/aws-cost-management/aws-cost-explorer/
[cloudwatch]: https://aws.amazon.com/cloudwatch/
[cur]: https://docs.aws.amazon.com/cur/latest/userguide/what-is-cur.html
[cur-query-athena]: https://docs.aws.amazon.com/cur/latest/userguide/cur-query-athena.html
[athena]: https://aws.amazon.com/athena/
[get-docker-image-size-post]: {{< relref "/posts/2020/get-docker-image-size-without-pulling-image" >}}
[data-dict]: https://docs.aws.amazon.com/cur/latest/userguide/data-dictionary.html