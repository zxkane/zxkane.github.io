---
title: '[tip]ssh key'
date: 2009-12-29T11:33:00.000+08:00
draft: false
tags : [ssh, Tip]
---

Setup SSH without password.  
a) execute "ssh-keygen -t rsa" under your linux/unix login to get the RSA keys.  
(press Enter for all)  
You will get 2 files uner ~/.ssh/, id\_rsa and id\_rsa.pub  
b) Put the public key id\_rsa.pub to your remote host: ~/.ssh/authorized\_keys If the remote host share the same nfs, just try " cat id\_rsa.pub >> ~/.ssh/authorized\_keys"  
\* Remember to modify hostname or ip info in ~/.ssh/authorized_keys to "*", so that you can login from any host without password in your NIS domain.  
For example:  
ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEA4Ri5J0s1BL/+mR7RfAuDW6FY2P6ILc61Zvw1BdDkvHMFrTzaC/AUMw33H7biAMCXuCleakCuSoV8ZDiGHYs4wOVvet5sDmphkwdiC4xTekdl3dRNvGjMVbvFUta/Y5CiayL6YIu47Ro6Vvu4Mutsrv/13pTlifrEz+NTR/+bzMb9nTniCwiryMyYod3E46b8WvS8yE3WK+tH4BZE8bjiCwdvAzSdPyk/OFNrlBNuF1yewwnxv1roRD3UalT2+7O4kfEG9sMvvBHjuX2l7xlUe3stBftYpigBbwGmmadxjRpNIlk88t5xKcQX6nSu7V8HI3GWPHI0D+ISIlbfU5Sunw== kzhu0@*