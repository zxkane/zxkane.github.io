---
title: 'Using the certificate of Windows code signing to sign jars'
date: 2011-07-18T21:03:00.000+08:00
draft: false
tags : [code signing, java, certificate]
---

I did sign the jars via reusing the existing certificate of Windows code signing several months ago. Writing it down for further reference.  
  
Whatever your purpose of reusing the existing Windows code certificate, I only document the way from technical perspective.  
  
After buying the certificate of Windows code signing from CA, you will get a .pvk file that stores both the certificate and private key. PVK file is the PKCS12 format\[1\], however java uses JKS format by default. So you need convert the pvk file to JKS keystore and certificate.  
  
  
Since 6.0 JDK supports PKCS12 directly, you can use 'jarsigner' and PVK file to sign jars directly\[2\].  

  {{< highlight bash >}}  
jarsigner -keystore /working/mystore.pvk -storetype pkcs12 -storepass myspass -keypass j638klm -signedjar sbundle.jar bundle.jar jane  
{{< /highlight >}}

Or using keytool to convert the PKCS#12 to JKS format\[3\] if using Eclipse PDE build to sign your jars.  
  
 {{< highlight bash >}} 
keytool -importkeystore -srckeystore KEYSTORE.pvk -destkeystore KEYSTORE.jks  -srcstoretype PKCS12 -deststoretype JKS -srcstorepass mysecret -deststorepass mysecret -srcalias myalias -destalias myalias -srckeypass mykeypass -destkeypass mykeypass -noprompt   
{{< /highlight >}}

\[1\] http://en.wikipedia.org/wiki/PKCS  
\[2\] http://download.oracle.com/javase/6/docs/technotes/tools/solaris/jarsigner.html  
\[3\] http://shib.kuleuven.be/docs/ssl_commands.shtml#keytool