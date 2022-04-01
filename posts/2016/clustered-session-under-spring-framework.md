---
title: Spring框架下的分布式session管理
date: 2016-05-07
tags: 
- web-2.0 
- session-management 
- spring-framework 
- spring-session 
- spring-boot
categories: 
- blogging 
isCJKLanguage: true
---

在微服务和容器等技术的帮助下，Web应用可以较为容易的进行水平扩展，来部署更多的应用实例来提升请求处理数QPS。当Web服务有状态的时候，如何在集群下管理用户session成为新的待解决问题。

<!-- more -->

[Spring Framework][spring]针对此问题衍生出了一个子项目[Spring Session][spring-session]来实现集群下的session管理。该项目提供了以下功能：

- 提供API和实现管理用户session
- HttpSession - 替换实现应用容器(tomcat)中的HttpSession
  + Clustered Sessions - 实现集群的session而不依赖任何应用容器特定的解决方案
  + Multiple Browser Sessions - 支持多个用户session保存在同一个浏览器实例中 (例如，类似Google的多用户认证).
  + RESTful APIs - 通过支持session ids在Http请求头来支持Restful API的认证
- WebSocket - 能够保证HttpSession的存活当在接受WebSocket消息时

从上面的功能列表中，我们可以看到[Spring Session][spring-session]能够满足集群下各种session的使用场景和需求。

[Spring Session][spring-session]在1.0.0 GA可以使用[Redis][redis]做为session储存的backend。

通过changelog，在最新的1.1.0 GA中支持[自定义Cookie的创建][1.1.0-what-is-new]，允许自定义Cookie的过期时间，作用域等。在即将发布的[1.2.0 GA][1.2.0-what-is-new]版本中，将添加支持JDBC的关系数据库和[MongoDB][mongo]作为session保存的backend。

此外，[Spring Session][spring-session]同[Spring-boot][spring-boot]的应用有很好的[集成][spring-boot-spring-session-integration]，只需要十多行代码及配置即可集成！

[spring]: https://spring.io
[spring-session]: http://projects.spring.io/spring-session/
[redis]: http://redis.io/
[1.1.0-what-is-new]: http://docs.spring.io/spring-session/docs/1.1.1.RELEASE/reference/html5/#what-s-new-in-1-1
[1.2.0-what-is-new]: http://docs.spring.io/spring-session/docs/1.2.0.RC2/reference/html5/#what-s-new-in-1-2
[mongo]: https://www.mongodb.org/
[spring-boot-spring-session-integration]: http://docs.spring.io/spring-session/docs/current/reference/html5/guides/boot.html
[spring-boot]: http://projects.spring.io/spring-boot/