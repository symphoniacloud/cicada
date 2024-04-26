# Setting up Cicada

Before I get started on how to use Cicada some important...

**WARNINGS!**

* I'm still actively developing Cicada and will probably make breaking changes.
  If you use Cicada please be ready to roll with this!
  Eventually I'll set up a mailing list or similar, but for now if you use Cicada drop me an email at [mike@symphonia.io](mailto:mike@symphonia.io) and I'll let you know of changes.
* I haven't done any load testing, and there are almost certainly a few behaviors that won't work for large GitHub accounts. E.g. I
  **don't recommend trying Cicada today in accounts of more than a few hundred repositories**.
* Cicada's security is based on that of your GitHub account, but it will lag by up to one day. So bare that in mind. (This will be improved once Cicada processes real-time administrative events from GitHub.)
* Further, for GitHub organizations, Cicada's security is based **ONLY ON ACCOUNT MEMBERSHIP**, not anything lower-level than that.
  In other words any user in your GitHub org will be able to see data about **any repository** in your organization.
  If this isn't appropriate for your organization then do not use Cicada at this time.
* You're going to need to know a decent amount about running apps in AWS. Please don't try to start using Cicada today if you aren't happy using CloudFormation, CloudWatch, Route53, Certificate Manager, etc.
* All of the resources that Cicada deploys in AWS should be free or very cheap BUT AS ALWAYS WITH AWS keep an eye on your AWS costs.
  I strongly recommend setting up [billing alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/monitor_estimated_charges_with_cloudwatch.html).

If you have questions please feel free to email me at [mike@symphonia.io](mailto:mike@symphonia.io) .

## Cicada and GitHub Accounts

Cicada depends on GitHub, and each Cicada installation is tied to a GitHub _Account_. 
A GitHub Account is either a _Personal Account_ - just used by one user - or an _Organization Account_.
Cicada works with both types of account.
To learn more about the differences between Personal and Organization Accounts [read the GitHub docs](https://docs.github.com/en/get-started/learning-about-github/types-of-github-accounts).

Each running deployment of Cicada only supports one GitHub Account.
If you want to monitor multiple GitHub accounts then deploy Cicada multiple times.

Cicada requires you to set up a resource in your GitHub account called a [_GitHub App_](https://docs.github.com/en/apps/overview).
Cicada automates most of the configuration of this App, however you'll require admin permissions in the GitHub account during setup.  

## Prerequisites

Before trying to install Cicada you need the following:

_GitHub_

Admin-level access to a personal or organization GitHub Account. 

_AWS_

Access to an AWS account with enough permissions to create various resources.
The easiest thing to do is have an AWS user with either "Administrative Access" or "Power User Access" permissions.

_Local_

A local environment with Node that you can use to deploy to AWS. Alternatively you can deploy from GitHub actions - see the example in repository. The minimum required version of Node is specified in the [~/.nvmrc](.nvmrc) file.

The current deployment scripting assumes a Unix / Mac environment. It may work with Windows / WSL, but I haven't tried. If you're using Windows and the deployment script fails then you'll need to replicate the logic in [_deploy.sh_](/deploy.sh) - it's not too complicated. 

### AWS Prerequisites for custom domain name (OPTIONAL)

By default Cicada won't set up a custom domain name, and you'll access Cicada via a generated URL.
Alternatively you can use a custom domain name, in which case you'll need to configure pre-requisite resources.

**I recommend you only configure a custom domain name if you're comfortable using AWS Route 53 and Certificate Manager**.

> You can configure a custom domain name _after_ you've deployed Cicada for the first time, but if you do so after you've configured Cicada's GitHub App then you'll need to manually update (and "reinstall") the GitHub App to use new URLs.

#### 1 - Decide on custom domain name

First you need to decide what your domain name will be.
This will be of the form `APP_NAME`.`PARENT_DOMAIN_NAME`, e.g. if your custom domain name 
is `cicada.example.com` then `APP_NAME` is `cicada`, and `PARENT_DOMAIN_NAME` is `example.com`.

#### 2 - Route 53 DNS Zone

You **must** have a publicly reachable Route53 DNS zone for `PARENT_DOMAIN_NAME` **in the same AWS account as you are deploying Cicada to**.

#### 3 - Certificate

You **must** have an AWS Certificate Manager Certificate in the same AWS account as you are deploying Cicada to. This certificate must cover your full custom domain name.

#### Example

Here is a CloudFormation template that configures required resources for the example of `cicada.example.com`

```yaml
Resources:
  HostedZone:
    Type: AWS::Route53::HostedZone
    Properties:
      Name: 'example.com'

  Certificate:
    Type: AWS::CertificateManager::Certificate
    Properties:
      DomainName: 'example.com'
      SubjectAlternativeNames:
        - '*.example.com'
      ValidationMethod: DNS

Outputs:
  CertificateArn:
    Value: !Ref Certificate
    Export:
      Name: YourCertificateExportName
```

A few things to note about this example:

* You'll need to separately make sure the Route 53 hosted zone is publicly reachable
* In this example I'm using a wildcard certificate - this allows using the same certificate for multiple deployments of Cicada with different hostnames
* I'm outputting the Certificate's ARN as a CloudFormation Export. 
  This is very-much optional, but Cicada can use this CloudFormation Export if you've created one.

## Prepare to deploy

### Retrieve source code

Cicada is not available as an NPM package since it's a deployed application rather than a library.
Therefore you'll need to clone this repo (or a fork of this repo) to your machine.

You can also use GitHub Actions to perform deployment, in which case you'll want to create your own copy of this repository, or a fork.

### Choose APP_NAME

Choose an `APP_NAME` value - this is used to prefix / namespace the names of deployed AWS resources. It's also the first part of the custom domain name, if you are using one.

By default when deploying from Unix or Mac environments `APP_NAME` will be `cicada-USER_NAME`, where `USER_NAME` is the name of the user running the deployment process. 

You can override `APP_NAME` either via environment variable, or when calling the deployment script.  

### Environment variables 

**If you are using a custom domain name** you'll need to set two environment variables for deployment:

* `PARENT_DOMAIN_NAME`, as described in the previous section
* **Either** `WEB_CERTIFICATE_ARN` - the full ARN of your certificate, **or** `WEB_CERTIFICATE_ARN_CLOUDFORMATION_EXPORT` - the name of a CloudFormation Export which stores your certificate's ARN (e.g. `YourCertificateExportName` in the earlier example)

You can also set `APP_NAME` via environment variable, if you choose. 

You can set environment variables in whatever way you want, but one option is to use a _.env_ file. If you want to use a _.env_ file you can use the included [.env-template](./.env-template) template file.

If you are deploying using GitHub Actions see the [included workflow file](/.github/workflows/ci.yml) for an example of setting environment variables from secrets.

## Deploy

If you haven't already done so open a terminal and switch to the home directory for Cicada.

Make sure your terminal is set up with the correct AWS configuration to connect to your desired AWS account and region.

Run `npm install` to get Node dependencies if you haven't done so already.

If you're happy to use the default `APP_NAME` of `cicada-USER_NAME` then run `./deploy.sh`. Otherwise set an environment variable (see previous section), or run `./deploy.sh YOUR_APP_NAME`.

Assuming everything works OK then wait a few minutes. Time for first deployment will typically be at least 4 minutes, and likely longer, because Cicada uses CloudFront as a web host, and this takes a long time to deploy.

If everything has worked OK you should see something like:

```
 ✅  Main (cicada-main)

✨  Deployment time: 319.38s

Outputs:
Main.CicadaHomePage = https://YOUR_WEB_HOST_NAME
Main.RestApiEndpoint00000000 = https://.....execute-api.us-east-1.amazonaws.com/prod/
Main.WebsiteBucketName = cicada-main-websitebucket....
Stack ARN:
arn:aws:cloudformation:us-east-1:123456789012:stack/cicada-main/74....

✨  Total time: 324.88s
```

**The value of the `Main.CicadaHomePage` Output is important** - that's the home page for running this installation of Cicada.

## Set up GitHub App

Cicada has to be **registered** and **installed** as a "GitHub App" in your GitHub account. This process is mostly automated, but you need to perform a few steps:

* Go to `https://YOUR_WEB_HOST_NAME/github/setup/start`, where `YOUR_WEB_HOST_NAME` is the value of `Main.CicadaHomePage` from the previous section.
* You should see instructions telling you to press one of two buttons.
  To register Cicada into a _Personal_ account just press the first button.
  To register Cicada into an _Organization_ account type the organization name into the box, and press the second button.
* Follow the GitHub workflow
* You should be redirected to a Cicada page that tells you you need to **_install_** the newly registered app - follow the link and do so
* If all goes well Cicada will now start downloading data from your Github account.
  **Wait a few seconds / minutes (depending on your account size)** - it will take a little while for Cicada to crawl your account resources.

Finally you can go back to the Cicada Home Page (`https://YOUR_WEB_HOST_NAME`) and login, at which point setup is complete.

On installation, Cicada loads the past 30 days of workflow run events, and however many pushes GitHub will provide - usually a few days.