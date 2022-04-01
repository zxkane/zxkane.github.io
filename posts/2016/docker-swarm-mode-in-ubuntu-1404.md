---
title: 创建于Docker Swarm的服务无法在Ubuntu 14.04 LTS中运行
date: 2016-09-13
tags: 
- docker 
- docker-swarm 
- ubuntu-1404
categories: 
- blogging 
isCJKLanguage: true
---

[V秘][vme]团队一直致力于用技术改善产品。[V秘][vme]后台的各种服务一直是通过完善的Devops流程自动部署到[Docker][docker]容器集群。随着[Swarm mode][docker swarm mode]在[Docker][docker] v1.12中正式发布，[Swarm mode][docker swarm mode]带来了诸如Docker集群，多主机网络等激动人心的特性。我们也在尝试将[V秘][vme]服务部署到[Docker Swarm Cluster][docker swarm mode]获取更好的弹性计算能力。

然而我们将[V秘][vme]的服务部署到[Docker Swarm Cluster][docker swarm mode]时遇到服务容器无法启动的错误。错误信息类似如下，

> starting container failed: could not add veth pair inside the network sandbox: could not find an appropriate master \"ov-000100-1wkbc\" for \"vethee39f9d\"

<!-- more -->

经过与[Docker 社区][docker issues]的回馈讨论，暂时通过升级Docker主机(OS: Ubuntu 14.04 LTS)的内核版本解决了这个错误。

具体方法如下，

{{< highlight bash >}}
root@swarm1:~# uname -r 
3.13.0-32-generic

root@swarm1:~# apt-get install linux-generic-lts-vivid
root@swarm1:~# reboot

root@swarm1:~# uname -r
3.19.0-69-generic
{{< / highlight >}}

至于这个错误的根本原因是[Docker][docker]的bug还是对Linux Kernel有特殊的要求，需要Docker开发进一步确认。如果对此问题有更多兴趣，可以关注[docker issue #25039][docker #25039]。

[vme]: https://vme360.com
[docker]: https://www.docker.com
[docker swarm mode]: https://docs.docker.com/engine/swarm/
[docker issues]: https://github.com/docker/docker/issues
[docker #25039]: https://github.com/docker/docker/issues/25039
