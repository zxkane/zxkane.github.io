---
title: "使用Openswan连接AWS VPC"
description : "搭建跨云的私有网络"
date: 2019-09-16
draft: false
thumbnail: https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhVhCAPtkt64t1r_xy4oXeTi3vXSmD80gN4tJp0dklwSxkLAv3
categories:
- blogging
isCJKLanguage: true
tags:
- AWS
- AWS VPN 
- Site-to-Site VPN
- Openswan
---

业务上云之后，经常也有需求将多云、数据中心或办公室的私有网络同云端的私有网络建立连接。[AWS Site-to-Site VPN][aws-site-to-site-vpn]正是AWS提供的托管VPN服务，我们可以在另一端的私有网络通过[Openswan][openswan]同AWS VPC网络建立基于IPSec协议的安全连接。

<!--more-->

下面是配置的详细步骤，

1. 如果是创建数据中心或办公室的连接，数据中心或办公室需要有公网IP。如果是在其他公有云上，需要创建带公网IP的EC2，或使用EIP。
   1. 如果使用AWS EC2配置Openswan，需要禁用 EC2 的 Source/Destination Check。
2. 在AWS上创建Virtual Private Gateway 和 Customer Gateway(指定对端的公网IP作为静态路由)。
3. 在AWS上创建Site-to-Site VPN连接，使用第一步和第二步创建的Virtual Private Gateway和Customer Gateway。
4. 在对端机器上安装`openswan`。
{{< highlight shell>}}
sudo yum install openswan
{{< /highlight >}}
5. 编辑`/etc/sysctl.conf`文件，确保有以下配置，
{{< highlight properties>}}
net.ipv4.ip_forward = 1
net.ipv4.conf.default.rp_filter = 0
net.ipv4.conf.default.accept_source_route = 0
{{< /highlight >}}
6. 重新加载sysctl配置并重启network服务。
{{< highlight shell>}}
sudo sysctl -p
sudo service network restart
{{< /highlight >}}
7. 编辑`/etc/ipsec.conf`确保`include /etc/ipsec.d/*.conf`没有被注释。
8. 创建`/etc/ipsec.d/aws.conf`文件，内容拷贝来自第三步创建的连接Openswan建议配置。
9. 创建`/etc/ipsec.d/aws.secrets`文件，内容拷贝来自第三步创建的连接Openswan配置。
10. 启动ipsec服务。
{{< highlight shell>}}
# Start the ipsec service.
sudo service ipsec start

# Check the logs.
sudo service ipsec status
sudo ipsec auto --status
{{< /highlight >}}

以上配置在Amazon Linux, Centos 6.9上验证通过。但是在Amazon Linux 2、Centos 7等较新的Linux发行版本上，启动`ipsec`服务遇到如下错误，
{{< highlight log>}}
Starting Internet Key Exchange (IKE) Protocol Daemon for IPsec...
ERROR: /etc/ipsec.d/aws.conf: 12: keyword auth, invalid value: esp
{{< /highlight >}}
解决方法是，从 AWS Site-to-Site VPN 下载的 Openswan 配置中删掉不支持的配置行`auth=esp`。

[aws-site-to-site-vpn]: https://docs.aws.amazon.com/zh_cn/vpn/latest/s2svpn/VPC_VPN.html
[openswan]: https://www.openswan.org/
