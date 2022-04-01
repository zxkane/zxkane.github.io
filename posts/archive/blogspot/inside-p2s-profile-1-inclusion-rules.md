---
title: 'Inside P2''s profile (1) - inclusion rules'
date: 2010-12-28T11:13:00.007+08:00
draft: false
tags : [p2, Eclipse, profile]
---

You would see some interesting properties at the bottom of eclipse's profile.  
  
For example,  

<iuProperties id='org.eclipse.sdk.ide' version='3.6.1.M20100909-0800'>  
      <properties size='2'>  
        <property name='org.eclipse.equinox.p2.internal.inclusion.rules' value='STRICT'/>  
      </properties>  
</iuProperties>  

  
It attaches a property named 'org.eclipse.equinox.p2.internal.inclusion.rules' with value 'STRICT' on the IU 'org.eclipse.sdk.ide' with version 3.6.1.M20100909-0800.  
   
It's a very important property for the p2 engine. It means the IU 'org.eclipse.sdk.ide' has been explicitly installed into the profile, so it's not allowed be implicitly updated or removed.  
  
For example,  
We have top feature IU 'org.eclipse.sdk.ide' that represents the Eclipse SDK,   'org.eclipse.pde.feature' that represents the Plug-in Development Tool and 'org.eclipse.jdt.feature' that represents the Java Development Tool. And both JDT and PDT are part of Eclipse SDK, so 'org.eclipse.pde.feature' and 'org.eclipse.jdt.feature' are required by 'org.eclipse.sdk.ide'.  
  
If the profile only has the STRICT rule for 'org.eclipse.sdk.ide', 'org.eclipse.jdt.feature' and 'org.eclipse.pdt.feature' will implicitly be updated to 3.6.2 when updating 'org.eclipse.sdk.ide' from 3.6.1 to 3.6.2.  
  
However the profile has below STRICT rule for PDT feature,  
  
  

<iuProperties id='org.eclipse.pdt.feature' version='3.6.1.M20100909-0800'>  
      <properties size='2'>  
        <property name='org.eclipse.equinox.p2.internal.inclusion.rules' value='STRICT'/>  
      </properties>  
</iuProperties>  

  
  
The p2 engine will report errors due to 'org.eclipse.pdt.feature' has STRICT rule for updating. Hence third-party must explicitly update both 'org.eclipse.sdk.ide' and 'org.eclipse.pdt.feature' from 3.6.1 to 3.6.2.