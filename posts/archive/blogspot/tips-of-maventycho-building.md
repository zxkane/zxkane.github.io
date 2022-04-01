---
title: 'The tips of Maven/Tycho building crossplatform RCP and repository'
date: 2011-11-08T16:16:00.000+08:00
draft: false
tags : [Maven, Eclipse, build, Tycho]
---

I successfully converted our product build from PDE build to Maven/Tycho. Something is worth to be documented here.  
  
There are several examples and posts to demonstrate how using Tycho building your Eclipse plug-ins, features, applications and products. The most helpful example is the [demo](http://git.eclipse.org/c/tycho/org.eclipse.tycho.git/tree/tycho-demo) of Tycho project.  
  
Below are some traps I met when building my project by Tycho,  
  

1.  **product build**  
    Our product is based on plug-ins, however we added the '**featurelist**' in build.properties of PDE build to include some root binary for the product. However Tycho doesn't support this type of build, we create some features as the placeholder of plug-ins. Then change the product as features based. You have to manually remove the **plugins** tag in .product definition file, otherwise Tycho will fail on strange error if the .produce has both **features** and **plugins** tag. Then configure the director plugin as not installing features.  
    
       org.eclipse.tycho  
        tycho-p2-director-plugin  
        ${tycho-version}  
        materialize-products  
          materialize-products   
          false  
           myappprofile   
         archive-products  
          archive-products   
    
    And I used below way to customize the qualifier string of our build.  
    
        org.eclipse.tycho  
        tycho-packaging-plugin  
        ${tycho-version}  
        '${qualifier-prefix}_'yyyyMMddHHmm 
    
      
    An limitation of director plugin is that no way using different profile name for the application installed on different hosts. I contributed a patch on [bug 362550](https://bugs.eclipse.org/bugs/show_bug.cgi?id=362550) for this enhancement.
2.  **feature build**  
    We have some features to pack some binary files as root files. But Tycho doesn't support root folder that is recognized by PDE build. The workaround is creating an additional folder, then put the root files into it.  
    Meanwhile Tycho doesn't support wildcard to other native touch points, such as changing the files permission. For static file list use comma separated list as workaround.
3.  **eclipse test plug-in**  
    I have a plug-in whose scope is 'test', but it doesn't have test case and no dependency for any test framework, such as junit 3.8 or junit 4. And it's used for mocking test server. Configure surefire plugin to let it build as test plug-in as well.  
    
     org.eclipse.tycho  
        tycho-surefire-plugin  
        ${tycho-version}  
        junit  
           junit  
           4.1   
               
         false   
       
     junit  
       junit  
       4.1 
    
    And configure the surefire plugin like below to test code in Maven build.  
    
     org.eclipse.tycho  
        tycho-surefire-plugin  
        ${tycho-version}  
        my.group  
          my.feature   
          ${version}  
          eclipse-feature   
         my.group  
          my.testserver   
          1.0.0  
          eclipse-plugin   
         ${testSuiteName}  
         ${testClassName}     
         -Dcom.sun.management.jmxremote  
         -consoleLog  
         org.eclipse.equinox.ds  
           1  
           true   
    
4.  **sign jars**  
    Add below signjar plugin into parent pom.xml, however I met the md5 error when materializing the repository built on .product. There is a workaround mentioned on [Bug 344691](https://bugs.eclipse.org/bugs/show_bug.cgi?id=344691#c11).  
    
          org.apache.maven.plugins  
          maven-jarsigner-plugin  
          1.2  
          ${keystore}  
           MyCompany  
           ${storepass}  
           ${keypass}  
           true  
           ${skip.jar.signing}  
           -tsa  
            https://timestamp.geotrust.com/tsa   
           **/artifacts.jar  
            **/content.jar   
           jar  
            eclipse-plugin  
            eclipse-feature  
            eclipse-test-plugin   
          sign  
            sign   
           verify  
            verify