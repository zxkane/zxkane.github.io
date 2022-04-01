---
title: '[Eclipse]get rid of the menus of eclipse platform'
date: 2007-03-09T13:46:00.000+08:00
draft: false
tags : [Eclipse, RCP]
---

When you develop a rich client application base on eclipse framework, and your application require eclipse platform feature, you would find that your application has some menu items contributed by eclipse platform. Those menu items are defined by several plug-ins' implementation of actionSet extention point. In fact Eclipse provides an activity mechanism to suppress the extension points which you don't want to use. However, you must know the identification name of extension points which you want to suppress. It's a hard work to find out all of them from dozens of plugins. so, I wrote a utility function to list all the extension points of specified name.

        IExtensionRegistry registry = Platform.getExtensionRegistry();  
  
      IExtensionPoint extensionPoint = registry.getExtensionPoint("org.eclipse.ui.actionSets");  
  
      IExtension\[\] extensions = extensionPoint.getExtensions();  
  
      for(int i = 0; i < extensions.length; i++){  
  
          IConfigurationElement elements\[\] = extensions\[i \].getConfigurationElements();  
  
          for(int j = 0; j < elements.length; j++){  
  
              String pluginId = elements\[j\].getNamespaceIdentifier();  
  
              if(pluginId.indexOf("org.eclipse") > -1){ //$NON-NLS-1$  
  
                  IConfigurationElement\[\] subElements = elements\[j\].getChildren("action");                   
  
                  for(int m = 0; m < subElements.length; m++){  
  
                      System.out.println("Plugin: " + pluginId + "  Id: " +  
  
                              subElements\[m\].getAttribute("id"));  
  
                  }  
  
              }  
  
          }  
  
      }  
  
and the follow snippet is about the activities of menus of eclipse platform:

   <extension point="org.eclipse.ui.activities">  
    <activity id="activity.platform" name="hidePlatformMenus"/>  
   <activityPatternBinding activityId="activity.platform" pattern="org\\.eclipse\\.platform/org\\.eclipse\\.ui\\.cheatsheets\\.actions\\.CheatSheetHelpMenuAction"/>  
  
 <activity id="activity.search" name="hideSearchMenus"/>  
 <activityPatternBinding activityId="activity.search" pattern="org\\.eclipse\\.search/org\\.eclipse\\.search\\..*"/>  
 <activity  
      id="activity.ide"  
      name="hideIDEMenus">  
</activity>  
<activityPatternBinding  
      activityId="activity.ide"  
      pattern="org\\.eclipse\\.ui\\.ide/org\\.eclipse\\.ui\\.actions\\.showKeyAssistHandler">  
 </activityPatternBinding>  
<activityPatternBinding  
      activityId="activity.ide"  
      pattern="org\\.eclipse\\.ui\\.ide/org\\.eclipse\\.update\\.ui\\..*">  
</activityPatternBinding>  
 <activity  
      id="activity.editor"  
      name="hideEditorMenus">  
</activity>  
<activityPatternBinding  
      activityId="activity.editor"  
      pattern="org\\.eclipse\\.ui\\.editors/org\\.eclipse\\.ui\\.edit\\.text\\.openExternalFile">  
 </activityPatternBinding>  
<activityPatternBinding  
      activityId="activity.editor"  
      pattern="org\\.eclipse\\.ui\\.editors/org\\.eclipse\\.ui\\.edit\\.text\\.delimiter\\..*">  
 </activityPatternBinding>  
<activity  
      id="activity.externaltool"  
      name="hideExternaltoolMenus">  
</activity>  
<activityPatternBinding  
      activityId="activity.externaltool"  
       pattern="org\\.eclipse\\.ui\\.externaltools/org\\.eclipse\\.ui\\.externaltools\\.ExternalToolMenuDelegateMenu">  
</activityPatternBinding>  
</extension>