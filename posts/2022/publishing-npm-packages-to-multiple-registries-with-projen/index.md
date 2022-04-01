---
title: "Publishing npm packages to multiple registries with Projen"
description : "Use github actions to publish your CDK construct to multiple npm registries"
date: 2022-02-04
draft: false
thumbnail: https://raw.githubusercontent.com/projen/projen/main/logo/projen.svg
categories:
- blogging
isCJKLanguage: false
tags:
- CDK Construct
- AWS CDK
- npm
- projen
- continuous delivery
- construct hub
---

[Construct Hub][construct-hub] is a web portal to collect the [constructs][construct] for [AWS CDK][cdk], CDK8s and CDKtf. 
The construct could support multiple programming languages, such as Javascript/TypeScript, Python, Java and C#. 
Actually the construct is developed by TypeScript, then it's compiled as across languages library by [jsii][jsii]!
Any npm/pypi package with certain tags will be discovered by Construct Hub, the package will be automatically recognized as
construct package and listed in Construct Hub.

[Projen][projen] is a project generator to create project with simplifying the project configuration to support dependencies management,
building, unit testing, code style linting, CI/CD via Github actions PR and actions. So [projen][projen-construct]
supports the construct project out of box, which configures construct project with jsii configuration 
that build the construct to across languages library, though publish the packages
to kinds of package registries, such as npmjs, pypi and maven central.

<!--more-->

Projen provides a [Publishing][projen-publisher] capability to publish construct library to supported package managers. 
For example, [npm][npm] for JavaScript/TypeScript, it could publish the package to several npm registries, for example, npm public registry, 
[Github packages][github-packages], [AWS CodeArtifact][codeartifact] and any public accessible private npm registry.

However the projen only supports publishing the package to single npm registry by default, 
how about you would like to publish your package to both npm public registry and Github packages?

There is no mature way to archive it, but projen is a flexible tool, we can hack it like below to add multiple npm registries
support to publish the package to both npm public registry and Github packages,

{{< highlight javascript >}}
const target = 'js';
const REPO_TEMP_DIRECTORY = '.repo';
const options = {
  registry: 'npm.pkg.github.com',
  prePublishSteps: [
    {
      name: 'Prepare Repository',
      run: `mv ${project.artifactsDirectory} ${REPO_TEMP_DIRECTORY}`,
    },
    {
      name: 'Install Dependencies',
      run: `cd ${REPO_TEMP_DIRECTORY} && ${project.package.installCommand}`,
    },
    {
      // remove this if your package name already has scope
      name: 'Update package name',
      run: `cd ${REPO_TEMP_DIRECTORY} && sed -i "1,5s/\\"packagename\\"/\\"@scope\\/packagename\\"/g" package.json`,
    },
    {
      name: `Create ${target} artifact`,
      run: `cd ${REPO_TEMP_DIRECTORY} && npx projen package:js`,
    },
    {
      name: `Collect ${target} Artifact`,
      run: `mv ${REPO_TEMP_DIRECTORY}/${project.artifactsDirectory} ${project.artifactsDirectory}`,
    },
  ],
};
project.release.publisher.addPublishJob((_branch, branchOptions) => {
  return {
    name: 'npm_github',
    publishTools: {},
    prePublishSteps: options.prePublishSteps ?? [],
    run: project.release.publisher.publibCommand('publib-npm'),
    registryName: 'npm-github',
    env: {
      NPM_DIST_TAG: branchOptions.npmDistTag ?? options.distTag ?? 'latest',
      NPM_REGISTRY: options.registry,
    },
    permissions: {
      contents: github.workflows.JobPermission.READ,
      packages: github.workflows.JobPermission.WRITE,
    },
    workflowEnv: {
      NPM_TOKEN: '${{ secrets.YOUR_GITHUB_REGISTRY_TOKEN }}',
      // if we are publishing to AWS CodeArtifact, pass AWS access keys that will be used to generate NPM_TOKEN using AWS CLI.
      AWS_ACCESS_KEY_ID: undefined,
      AWS_SECRET_ACCESS_KEY: undefined,
      AWS_ROLE_TO_ASSUME: undefined,
    },
  };
});
{{< /highlight >}}

Above code snippet adds an additonal step in release workflow of Github action that is managed by projen, which publishes the 
package to Github packages.

HAPPY Projen!

[projen]: https://github.com/projen/projen
[construct-hub]: https://constructs.dev/
[cdk]: {{< relref "/posts/2019/aws-cdk.md" >}}
[construct]: https://docs.aws.amazon.com/cdk/latest/guide/constructs.html
[jsii]: https://aws.github.io/jsii/
[projen-construct]: https://projen.io/awscdk-construct.html
[projen-publisher]: https://github.com/projen/projen/blob/main/docs/publisher.md
[github-packages]: https://github.com/features/packages
[codeartifact]: https://aws.amazon.com/codeartifact/
[npm]: https://docs.npmjs.com/about-npm