---
title: '[Eclipse][P2]Learn p2 step by step'
date: 2009-11-12T17:48:00.001+08:00
draft: false
tags : [Equinox, p2, Eclipse]
---

Learn p2 step by step
=====================

[Kane](mailto:kane.mx@gmail.com "Kane")                 
  
                       

1.  [Learn P2 step by step](http://www.blogger.com/post-edit.g?blogID=8314384370778429245&postID=6549693887265291061#Learn_P2_step_by_step)  
    
    1.  [p2 concept](http://www.blogger.com/post-edit.g?blogID=8314384370778429245&postID=6549693887265291061#p2_concept)
    2.  [p2 install](http://www.blogger.com/post-edit.g?blogID=8314384370778429245&postID=6549693887265291061#p2_install)
    3.  [p2 install practice](http://www.blogger.com/post-edit.g?blogID=8314384370778429245&postID=6549693887265291061#p2_install_practice)
    4.  [p2 repository publish](http://www.blogger.com/post-edit.g?blogID=8314384370778429245&postID=6549693887265291061#p2_repository_publish)
    5.  [customized p2 touchpoint](http://www.blogger.com/post-edit.g?blogID=8314384370778429245&postID=6549693887265291061#customized_p2_touchpoint)
    6.  [p2 repository publish practice](http://www.blogger.com/post-edit.g?blogID=8314384370778429245&postID=6549693887265291061#p2_repository_publish_practice)
    7.  [Example Code](http://www.blogger.com/post-edit.g?blogID=8314384370778429245&postID=6549693887265291061#Example_Code)
    8.  [Reference](http://www.blogger.com/post-edit.g?blogID=8314384370778429245&postID=6549693887265291061#Reference)
    
      
    

  

### p2 concept  

  
  
  
  
首先来理解p2引入的几个概念\[1\]  
  

*   **p2 / Agent**

*   The provisioning infrastructure on client machines

*   **Installable Unit (IU)**

*   **Metadata** that describes things that can be installed/configured

*   **Artifact**

*   The actual content being installed/configured(e.g., bundle JARs)

*   **Repository**

*   A store of metadata or artifacts

*   **Profile**

*   The target of install/management operations

*   **Planner**

*   The decision-making entity in the provisioning system

*   **Engine**

*   The mechanism for executing provisioning requests

*   **Touchpoint**

*   The part of the engine responsible for integrating the provisioning  
    system to a particular runtime or management system

IU比较好理解，就是对可安装或配置的部分一种描述，并不对应实际要安装的文件。  
Arifact就是来描述实际要安装的文件，bundle类型的jar，feature，binary文件。  
这时就有了Repository（仓库）这个概念，是用来保存artifacts信息，以及artifacts的元数据。元数据包括了对artifact的唯一标识符，版本，对外暴露的接口信息，以及它依赖的接口及其版本信息，各个安装阶段需要执行的配置。在p2默认的实现里面，这两个repository用xml文件来描述，同时被压缩为artifacts.jar, content.jar来减小文件大小，缩短传输时间。  
从Eclipse 3.4起，当从远程site安装新的软件时，就会看到有个work thread在后台下载content.jar文件。p2在安装时候，首先会根据content.xml（metadata repository）来解析正在安装软件的依赖。在当前runtime里面查找metadata中指定的依赖，如果满足才继续安装。据我个人经验，如果安装的软件比较复杂，那它产生的metadata文件就会比较大（很容易上兆），下载这个文件以及解析它的内容都会比较慢，从而影响用户体验。  
比较灵活的是，用户可以实现自己的ArtifactRepository和MetadataRepository，注册到它们各自的Manager里面就可以了。所有这些服务都被实现为OSGi Service.  
下一个Profile，是用来管理安装目标里的软件信息。p2在被设计的时候，希望解决多个eclipse实例共享一份安装的某软件。比如为了某种目的我机器上有好几个Eclipse，同时它们都需要CDT，免去为重复安装的麻烦。profile就会记录每次安装的内容，让整个应用程序被管理起来。在Galileo里安装的软件都可以软件管理里面查找到。  
Planner和Engine完全就是p2内部的东西。任何p2的操作（安装，删除，配置）都需要Planner实例来描述。有了Planner以后，还需要创建一个Engine对象，通过engine来执行对应的plan。这就是目前调用p2 API来完成安装的一个过程。  
最后一个Touchpoint。程序在安装的时候，可能会根据runtime(os, ws, arch等）或阶段(安装，卸载，配置等)执行某些配置，touchpoint就是帮助实现这些配置。具体操作是以IU为单位记录在metadata repository里的。p2默认实现了一些Eclipse touchpoint，比如拷贝，删除文件，执行外部程序等。如果用户有自己特殊的native操作需要执行，可以自己实现自定义的touchpoint。  
  

### p2 install  

有了这些概念以后，我们来看看如何使用p2 API。以安装为例，  

首先需要得到当前安装的profile。如果是全新安装，通过IProfileRegistry.addProfile创建一个新profile。是更新安装的话，可以通过IProfileRegistry查询到期望更新的profile。创建profile的时候，需要注意设置profile的属性，  

  

Map<String, String> profileProperties = new HashMap<String, String>();  

profileProperties.put(IProfile.PROP\_INSTALL\_FOLDER, installLocation.getAbsolutePath());  

profileProperties.put(IProfile.PROP_FLAVOR, "tooling"); //$NON-NLS-1$  

profileProperties.put(IProfile.PROP_ENVIRONMENTS, "osgi.os=" + Platform.getOS() + ",osgi.ws=" + Platform.getWS() + ",osgi.arch=" + Platform.getOSArch()); //$NON-NLS-1$;  

profileProperties.put(IProfile.PROP\_NL, "en\_US"); //$NON-NLS-1$  

profileProperties.put(IProfile.PROP\_INSTALL\_FEATURES, "true");  

profileProperties.put(IProfile.PROP\_CONFIGURATION\_FOLDER, new File(installLocation, "configuration").getAbsolutePath());  

profileProperties.put(IProfile.PROP_ROAMING, "true");  

profileProperties.put(IProfile.PROP_CACHE, installLocation.getAbsolutePath());  

currentProfile = registry.addProfile(PROFILE_ID, profileProperties);  

  

PROP\_INSTALL\_FOLDER设置安装的目录，PROP\_CACHE设置保存下载来的Eclipse IU(features/plugins)的目录，如果repository是以feature为单位来发布的话，需要设置PROP\_INSTALL\_FEATURES为true。如果repository包括native的binary（比如launcher）也需要指定正确的PROP\_ENVIROMENTS，包括OS,WS,ARCH或PROCESSOR。  

然后需要获得将要安装的IMetadataRepository集合。比如：  

ArrayList<IInstallableUnit> ius = new ArrayList<IInstallableUnit>();  

IMetadataRepositoryManager repositoryManager = (IMetadataRepositoryManager) ServiceHelper.getService(Activator.getDefault().getBundle().getBundleContext(),  

IMetadataRepositoryManager.class.getName());   

if (repositoryManager == null)   

       throw new InterruptedException("Failed to get IMetadataRepositoryManager.");  

try {  

  for (URI uri : uris) {  

  

    IMetadataRepository metaRepo = repositoryManager.loadRepository(uri, progress.newChild(50/uris.length));  

    Collector collector = metaRepo.query(new AccpetQuery(), new LatestNoninstalledIUCollector(currentProfile), progress.newChild(50/uris.length));  

  

     ius.addAll(collector.toCollection());  

  }  

} catch (ProvisionException e) {  

    throw new InterruptedException("Failed to get IMetadataRepository.");  

}  
     -同时这里也查找出IMetaRepository中没安装过的IUs。这就需要同当前安装的profile中已经安装过的内容来比较，  

    Collector collector = metaRepo.query(new AccpetQuery(), new LatestNoninstalledIUCollector(currentProfile), progress.newChild(50/uris.length));  

     这里需要指出的是，IMetadataRepository实现了IQueryable接口。IQueryable是p2引入的查找接口，返回满足特殊查询条件的集合，同时传入了一个IProgressMonitor对象，可以反应查找进度。这里的AcceptQuery，LatestNoninstalledIUCollector是自定义的Query和Collector对象。p2已经实现了许多有用的Query，经常用到的有InstallableUnitQuery，IUPropertyQuery，RangeQuery。  

    -接下来生成IEngine所需的ProvisionPlan。首先创建ProfileChangeRequest对象，将先前查找出的要安装的IUs添加进去。  

     request.addInstallableUnits(ius);  

     删除的话则与之相反。更新的话也需要通过ProfileChangeRequest.removeInstallableUnits()去掉旧版本的IUs。  

     调用IPlanner service的getProvisioningPlan(ProfileChangeRequest, ProvisioningContext, IProgressMonitor)得到对应于当前request的plan。  

    -最后就是调用IEngine.perform(IProfile, PhaseSet, Operand\[\], ProvisioningContext, IProgressMonitor)来执行provisioning操作。这里的PhaseSet是用来指定Engine将要执行的几个阶段，以及每个阶段的执行时间权重。这些阶段包括了Collect, Unconfigure, Uninstall, Property, CheckTrust, Install, Configure. 如果熟悉Eclipse之前的Installer Handler，对Unconfigure/Uninstall/Install/Configure应该都很熟悉。 在p2里，更是将Collect, CheckTrust这些过程也暴露了出来。下面是p2里默认PhaseSet的实现，  

        public DefaultPhaseSet() {  

            this(new Phase\[\] {new Collect(100), new Unconfigure(10, forcedUninstall), new Uninstall(50, forcedUninstall), new Property(1), new CheckTrust(10), new Install(50), new Configure(10)});  

        }  

     Operand\[\]通过ProvisionPlan.getOperands()获得。  
  
  
  
  
  

### p2 install practice  

  
  
先制作一个可安装的repository，这里的方法是基于Eclipse提供的模版创建一个RCP程序，比如mail template,  
  

[![](http://docs.google.com/File?id=ddqccrw2_871xs75p2fh_b)](http://docs.google.com/File?id=ddqccrw2_871xs75p2fh_b)  

[![](http://docs.google.com/File?id=ddqccrw2_872fzbmznfm_b)](http://docs.google.com/File?id=ddqccrw2_872fzbmznfm_b)  

  

然后创建一个feature包含刚才创建出来的plug-in 'com.example.mail'。  

  
基于存在的‘com.example.mail.product’创建product configuration，将其设置为base on features, 同时在dependencies页面添加以下feature。feature的qaulifier id依赖于用到的Eclipsse版本，从下图看到我这里使用的是Eclipse 3.5.1。如果要让RCP程序具有安装插件的能力（包含p2和p2 UI），就需要依赖更多的feature。后面的example里面会实现这部分功能。另外注意：[ID不能包括空格字符](https://bugs.eclipse.org/bugs/show_bug.cgi?id=291872 "ID不能包括空格字符")。  

[![](http://docs.google.com/File?id=ddqccrw2_873fx44c3ff_b)](http://docs.google.com/File?id=ddqccrw2_873fx44c3ff_b)  

  

  
接下来使用Eclipse Product Export Wizard生成repository。记得要勾选上generate metadata repository。  

[](http://docs.google.com/File?id=ddqccrw2_874qnh7n3gc_b)  

[![](http://docs.google.com/File?id=ddqccrw2_875gfs4p3d2_b)](http://docs.google.com/File?id=ddqccrw2_875gfs4p3d2_b)  

  

  
在成功创建了Mail Application的repository后，试用我们自己的p2 installer来安装这个应用程序。安装过程类似下面的截图。然后执行/folk/kzhu0/tmp/mailrcp/mail来运行Mail Application.  
  

[![](http://docs.google.com/File?id=ddqccrw2_877cm6fxcc6_b)](http://docs.google.com/File?id=ddqccrw2_877cm6fxcc6_b)  

[![](http://docs.google.com/File?id=ddqccrw2_878dg9g8kf4_b)](http://docs.google.com/File?id=ddqccrw2_878dg9g8kf4_b)  

  
  
  

### p2 repository publish

这一节将会展示如何发布/产生基于p2的repository。在p2最早的版本Eclipse 3.4中将生成repository这个程序称为generator，而3.5对此重构后命名为publisher。重构后的publish过程简单明了。首先需要创建一个IPublishInfo对象，它负责提供将要生成的repository的情况。包括了meta repository, artifact repository的信息，属性，以及提供辅助信息的advice对象。IPublisherAdvice可以看作类似创建RCP窗口时候的WorkbenchAdvice和WorkbenchWindowAdvice等辅助类。它用来提供需要记录在repository中的IU特殊信息。比如IU的属性，touchpoint的类型及各个阶段执行的action，对可执行文件或配置文件IU的处理。  
此外还需要创建IPublisherAction来处理不同类型的IU发布过程。例如BundlesAction来实现发布bundles到repository，FeaturesAction则是处理feature。此外p2已提供的IPublisherAction还包括product action, config action, launcher action和jre action等等\[2\]。  
有了描述repository情况的publishinfo和发布各种IUs的action后，调用Publisher.publish方法完成repository的发布。  
        IPublisherInfo info = createPublisherInfo();  
        IPublisherAction\[\] actions = createActions();  
        Publisher publisher = new Publisher(info);  
        publisher.publish(actions, new NullProgressMonitor());  
这里有一点需要注意，publish只是把将要用于部署的features/plugins/binary发布到repository，并不负责编译打包它们。先前我们使用过Eclipse Export功能既编译打包features/plugins同时又生成repository。Export实现的过程首先是调用PDE来编译打包features/plugins，再调用对应的publisher应用程序将编译后的features/plugins/product发布为repository。  
  
  

### customized p2 touchpoint  

前面一节已经提过IPublishInfo通过额外的IPublisherAdvise来定制发布到repository的IU信息。这里介绍为自己的IU定制新的touchpoint类型，并且要求在配置阶段在操作系统桌面创建应用程序的启动快捷方式。首先为我们的PublisherInfo添加处理touchpoint data的advice，NativeLauncherTouchPoint实现了ITouchpointAdvice接口，publisher在发布的时候当处理到touchpoint data部分，会查找实现了ITouchpointAdvice接口的advice。如果有advice可用，将会让这些advice处理现有的touchpoint data，并且得到新的touchpoint data，并把结果保存到metadata repository当中。  

        PublisherInfo result = new PublisherInfo();  
        result.addAdvice(new NativeLauncherTouchPoint());  

NativeLauncherTouchPoint将指定为特定的IU在configure阶段执行createDesktop操作，以及相反的操作，unconfigure阶段执行deleteDesktop操作。  
  

更改touchpoint type的方法如下。当然也可以为现有的touchpoint type扩展action。内置的touchpoint类型和action的具体命令用法，请参考p2 wiki\[3\]。  
iu.setTouchpointType(DesktopTouchpoint.TOUCHPOINT_TYPE);  
touchpoint类型和action都是通过extension point来扩展的。通过扩展“org.eclipse.equinox.p2.engine.touchpoints”来添加新的touchpoint类型，扩展”org.eclipse.equinox.p2.engine.actions“将新的action同某个类型关联起来。  
  

### p2 repository publish practice

我们创建plug-in 'com.example.p2.touchpoint'来实现桌面快捷方式的扩展，并且创建'com.example.p2.feature'包含touchpoint实现的plug-in。具体实现请参考p2 example源码。  
然后为Mail Application添加p2相关feature的依赖，重新发布得到支持安装软件的新版本。并且用p2 example installer安装它。p.s: 个人感觉Eclipse在包含第三方plug-in时，层次有些问题。p2作为一个runtime的project（跟equinox, ECF同级），居然需要直接或间接依赖help, rcp.platform这样的上层模块。  

[![](http://docs.google.com/File?id=ddqccrw2_879cjg6wrgg_b)](http://docs.google.com/File?id=ddqccrw2_879cjg6wrgg_b)  

接下来创建plug-in 'com.example.mail.desktop' 和 feature 'com.example.mail.desktop.feature'，作为提供桌面快捷方式的IU。用Eclipse Export Feature将'com.example.mail.desktop.feature'导出，实际就是用PDE替我们编译打包:)。  
运行‘com.example.p2.generator'提供的headless publisher来生成我们定制的repository。’/folk/kzhu0/tmp/mail/desktop-deploy'是先前desktop feature导出后的路径，而'/folk/kzhu0/tmp/mail/desktop'是生成repository的路径。  

[![](http://docs.google.com/File?id=ddqccrw2_880tk4fk8wd_b)](http://docs.google.com/File?id=ddqccrw2_880tk4fk8wd_b)  

运行新版本的Mail Application，在Help菜单下面会多出Install New Software选项。将自定义publisher生成的Desktop feature repository添加为新的软件源，安装Mail Desktop Feature。安装完成后，将在桌面找到Mail Application的快捷方式。在Installation Detail里面将会出现这次安装的内容。选中Desktop Feature后选择卸载，桌面的快捷方式文件将会被删除掉。当然也可以使用p2 example installer来为Mail Application安装desktop feature。p.s: example代码里只实现了创建linux/unix桌面快捷方式。  

[![](http://docs.google.com/File?id=ddqccrw2_8814qg7wvhs_b)](http://docs.google.com/File?id=ddqccrw2_8814qg7wvhs_b)  

  

### Example Code

Example Code应该只能编译运行在Eclipse 3.5.x。Example Code使用的都是p2 internal API, 而p2 public API将会随Eclipse 3.6首次发布。这些类和方法基本都会保留，但命名，包一定会有重构。  
http://code.google.com/p/kane-toolkit/source/browse/#svn/trunk/p2-example  
  

### Reference

\[1\] http://wiki.eclipse.org/Equinox/p2/Concepts  
\[2\] http://wiki.eclipse.org/Equinox/p2/Publisher  
\[3\] http://wiki.eclipse.org/Equinox/p2/Engine/Touchpoint_Instructions