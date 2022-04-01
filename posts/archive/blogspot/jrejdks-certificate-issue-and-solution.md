---
title: 'JRE/JDK''s certificate issue and solution'
date: 2011-11-24T15:58:00.001+08:00
draft: false
tags : [Java, gerrit, configuration, smtp, certificate]
---

The problem came from I tried to set up send mail server(SMTP) for my Gerrit server. My Gerrit server is using OpenID for user authorization, so I registered a new email account to send notification from Gerrit.  
  
Most of email service providers require the secure authorization when using its SMTP server to send mail. However the root CA of my email provider is not added into the default certificate of JRE. So Gerrit always failed to send email due to ssl verification exception.  
  
My solution is adding the certificate of SMTP server into the certificate used by JRE.  
  
The detail steps are below,  
  

1.  Use **open_ssl** utility to the certificate of SMTP server or its root CA of email provider. Below command can list the certificate of SMTP and its chain. You can paste any of them into a file.  
    
       openssl s_client -connect smtp.163.com:465 
    
2.  Then import the certificate saved in previous step into my JRE's key store. The default password of JRE's default keystore is '**changeit**'. You can find the _cacerts_ under jre/lib/security folder.  
    
     sudo keytool -import -keystore cacerts -alias Smtp163com -file /tmp/smtp.163.PEM