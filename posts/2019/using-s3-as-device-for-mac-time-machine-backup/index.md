---
title: "使用AWS S3作为MacOSX时间机器(Time Machine)的备份存储"
description : "为MacOSX提供无限存储且加密安全的备份方案"
date: 2019-06-30
draft: false
thumbnail: posts/2019/using-s3-as-device-for-mac-time-machine-backup/images/cover.jpg
categories:
- blogging
isCJKLanguage: true
tags:
- MacOSX
- AWS
- AWS S3
- Tip
---
个人电脑数据备份一直都是一个强烈的需求。使用网盘等云存储产品可以部分满足数据的备份需求，仍然无法做到使用便利性和很高的数据安全保障。

MacOSX上系统内置了备份解决方案 -- [时间机器(Time Machine)][time-machine-doc]。Time Machine支持AirPort Time Capsule，NAS存储或者外置的存储设备。然而这些备份方案都依赖于硬件设备，有容量限制或不便于移动。在云计算已经大行其道的今天，有没有使用云计算厂商对象存储作为目标存储的备份方案，为MacOSX数据备份提供无限容量、高度的安全性的云方案？经过一番搜索，既找到了开源免费的工具[Restic][restic]，也有付费软件[Arq][Arq]。无论Restic还是Arq提供的是独立的三方工具来实现备份到云端存储或从云端恢复，有没有将Time Machine和云端储存结合在一起的方案呢？

<!--more-->

TimeMchine支持将外置存储作为备份设备，这里介绍的方法就是将远端云计算厂商的对象存储挂载为本地设备，设置Time Machine将它作为目标备份设备，实现将备份放到云厂商的对象储存。

接下来我将一步步演示如何将AWS S3对象存储的bucket作为Time Machine备份的设备。

> 此方法适用于将任意云厂商的对象存储作为备份存储，只要该厂商的对象存储支持被MacOSX挂载为本地磁盘。

有很多成熟的方案将AWS S3挂载为MacOSX磁盘，例如[S3fs][s3fs]、[Goofys][goofys]。本文推荐的方案是[Juicefs][juicefs]，Juicefs为对象存储的元数据提供了缓存，能极大的优化对挂载磁盘的list，get等操作。

1. 首先按照[Juicefs 文档][juicefs-installation]安装必要的依赖和Juicefs客户端。接下来在Juicefs注册完成后，创建一个文件系统保存备份数据。注意：这里的bucket名称需要同随后创建或已有的bucket名称一致。
{{< figure src="/posts/2019/using-s3-as-device-for-mac-time-machine-backup/images/create-juicefs-fs.png" alt="创建Juicefs文件系统" >}}
1. 创建新的AWS S3 bucket(或者使用已有的bucket)，同时为该bucket专门创建用于Juicefs客户端使用的IAM用户。强烈建议不要使用云帐号的access token用于挂载，最佳实践是为不同的用途创建单独的IAM用户。更多IAM用户实践，请参考文章[IAM最佳实践][iam-best-practice]。下面是使用AWS CLI创建新S3 bucket及IAM用户的参考命令，
{{< highlight bash >}}
# 创建S3 bucket
aws s3 mb s3://my-bucket-for-mac-backup

# 创建IAM用户
aws iam create-user --user-name juicefs
# 为juicefs用户授予读写备份S3 bucket权限
echo '{
    "UserName": "juicefs",
    "PolicyName": "mac-backup-bucket-all-permissions",
    "PolicyDocument": "{ \"Version\": \"2012-10-17\", \"Statement\": [ { \"Effect\": \"Allow\", \"Action\": \"s3:*\", \"Resource\": [ \"arn:aws-cn:s3:::my-bucket-for-mac-backup/*\", \"arn:aws-cn:s3:::my-bucket-for-mac-backup\" ] } ] }"
  1 {
}' > policy.json
aws iam put-user-policy --cli-input-json file://policy.json
# 为juicefs用户创建access token用于juicefs客户端挂载bucket
aws iam create-access-key --user-name juicefs
{
    "AccessKey": {
        "UserName": "juicefs",
        "AccessKeyId": "<key id>",
        "Status": "Active",
        "SecretAccessKey": "<access key>",
        "CreateDate": "2019-06-30T15:25:41Z"
    }
}
{{< /highlight >}}
1. 按照[Juicefs文档挂载][juicefs-mount]挂载S3 bucket。
1. 进入挂载后的目录(如`/jfs`)，创建**Sparse Image**用于Time Machine写入备份。
{{< highlight bash >}}
cd /jfs
hdiutil create -size 600g -type SPARSEBUNDLE -fs "HFS+J" Time Machine.sparsebundle
{{< /highlight >}}
上面命令将创建一个名为`TimeMachine`600 GB大小的镜像(初始仅占用数百MB，实际文件磁盘空间只有当文件写入后才会占用)。根据你的需要随意调整镜像大小，通常建议设置为Mac磁盘大小的两倍。
不熟悉命令行的用户，也可以使用磁盘工具(Disk Utility)创建。
{{< figure src="/posts/2019/using-s3-as-device-for-mac-time-machine-backup/images/create-sparse-image.png" alt="创建Sparse Image" >}}
1. 通过Finder挂载之前创建的Sparse Image
{{< figure src="/posts/2019/using-s3-as-device-for-mac-time-machine-backup/images/mount-sparse-image.png" alt="挂载Sparse Image" >}}
1. 现在是魔术步骤，告诉Time Machine使用之前创建的虚拟设备作为备份磁盘。
{{< highlight bash >}}
sudo tmutil setdestination /Volumes/Time MachineDisk
{{< /highlight >}} 
{{< figure src="/posts/2019/using-s3-as-device-for-mac-time-machine-backup/images/time-machine.png" alt="Time Machine备份" >}}

由于S3 Bucket用于备份数据，建议开启S3 智能分层存储或者IA储存，降低花费。同时可以启用S3 KMS加密云端保存的数据，提升数据安全性。

[time-machine-doc]: https://support.apple.com/zh-cn/HT201250
[restic]: https://restic.net/
[Arq]: https://www.arqbackup.com/
[s3fs]: https://amazonaws-china.com/cn/blogs/china/s3fs-amazon-ec2-linux/
[goofys]: https://github.com/kahing/goofys
[juicefs]: https://juicefs.com
[juicefs-installation]: https://juicefs.com/docs/zh/getting_started.html#system-requirement
[juicefs-mount]: https://juicefs.com/docs/zh/getting_started.html#mount-filesystem
[iam-best-practice]: {{< relref "/posts/effective-cloud-computing/iam-best-practice/index.md" >}}
