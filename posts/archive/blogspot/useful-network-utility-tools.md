---
title: 'useful network utility tools'
date: 2010-03-11T14:53:00.000+08:00
draft: false
---

1\. tcpdump  
tcpdump -n port 80 -i eth0|lo  
monitor all package transferred on 80 port on the network interface eth0/lo  
2\. netstat  
netstat -anp|grep java  
trace all network traffic on the process named java  
netstat -anp|grep 128.224.159.xxx  
trace all network traffic on the host whose ip address is 128.224.159.xxx  
3\. nslookup  
nslookup 206.191.52.46  
look up the domain name whose ip address is 206.191.52.46