---
title: 'Acess Intranet without VPN'
date: 2012-02-17T17:47:00.003+08:00
draft: false
tags : [ssh]
---

Sometimes I need access the Intranet of company, however I don't like to create VPN connection. The connection is slow, waste time to create the connection and have to change password due to security policy.  
  
My workstation is Linux, which has a lot of utility tools to help me access Intranet at home without VPN.  
  
Firstly I set up a ssh server on my personal computer. It's quite easy if you are using Linux, for Windows I installed [Copssh](https://www.itefix.no/i2/copssh).  
Then register a free domain name and configure it in my router. And let router forward port `22`(or any port you wan to use) to my personal computer.  
In my working Linux machine, create a ssh tunnel to my personal computer. Must use the [public/private key for authenticating]({{< relref "ssh-key.md" >}}). For example,  

{{< gist zxkane 1876750 "ssh-tunnel0.sh" >}}

It means remote server can access my workstation's port `22` via accessing its port `1002` after the ssh tunnel is created successfully. Above command line also forwards the ports `5900` and `6500`. The default VNC session will listen the port `5900`.  
But it only works when my personal computer is running. And the connection can't be reconnected after it fails once.  
The graceful solution is installing 'autossh' in my Linux, which is an utility to retry the ssh connection with an interval if it's disconnected or failed.  
  
{{< gist zxkane 1876750 "ssh-tunnel1.sh" >}}

Then create a script and running it when OS is booted. The script will be executed by root user, so we need configure it ran by the normal user.  

{{< gist zxkane 1876750 "ssh-tunnel2.sh" >}}

After my personal computer is booted a while(**the default interval of autossh is 300 seconds**), I can use `localhost:10002` to login my workstation, `localhost:5900` to access my VNC session. Of course you can use 'froxyproxy' of Firefox via a localport to access web page of Intranet.