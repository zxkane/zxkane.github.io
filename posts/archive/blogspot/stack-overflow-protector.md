---
title: 'stack overflow protector'
date: 2010-12-23T13:25:00.001+08:00
draft: false
---

Latest gcc compiler enables the stack overflow protector that is since GLIBC 2.4. So the library or executable is compiled by latest gcc could be loaded or executed in RHEL4 or Solaris 9 that only have GLIBC 2.3. Hence using option '-fno-stack-protector' to compile the library or executable to make sure it could be executed in older linux release.  
  
g++ -fno-stack-protector -o test.o test