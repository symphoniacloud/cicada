# Cicada

Hello, and welcome!

## What is Cicada?

Cicada is two things:

* A reasonably-sized example of a lot of techniques that can be used for building serverless applications with Amazon Web Services (AWS)
* A monitoring tool for GitHub and GitHub Actions

### Cicada as Example

Over the last few years I've helped several clients build applications on AWS. Each of these applications placed serverless techniques and
services at their core. In that time I've formed many opinions of good ways to code, architect, and operate such applications.

Cicada is an application that helps me demonstrate many of these opinions, including:

* Architecture - which services to use, and how to use them
* Coding - what techniques work well when writing TypeScript code that runs in Lambda functions
* Operations - how I think about using CDK and GitHub Actions when deploying something more significant than a "Hello World" app

My hope is that I'll write a few articles that explain my recommendations, using Cicada as a living example.

Please follow https://blog.symphonia.io to hear more.

### Cicada as App

I first used the technique of Continuous Integration (CI) over 20 years ago, and have spent many of the years in between
using and/or building CI and CD (Continuous Delivery or Continous Deployment) tools and processes. My current tooling preference for CI and CD
automation is GitHub Actions - however one of the areas I don't love about GitHub Actions is its UI - especially for notifications and cross-repository status.

Cicada is an application that you can attach to your GitHub account and get useful data about your GitHub Actions workflows, and other
Github activity.

Here is an example of Cicada's home screen:

![img.png](docs/images/latestStatusExample.png)

This shows the status all of the GitHub Actions workflows in my account, as well as recently active branches.
I can drill into more detailed views for a repository, or an individual workflow, or I can navigate straight to
Github's own pages.

Cicada also provides realtime notifications to both desktop and mobile devices by way of _Web Push_ notifications.
This allows you to keep on top of what's going on in your GitHub Actions workflows.

Here's what a notification looks like on my iPhone:

![img.png](docs/images/webPushiPhoneExample.png)

You might be able to realize why Cicada has its name when you see it written as CICaDa. :)

## Using Cicada

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

### Prerequisites

Before trying to install Cicada you need the following:

_GitHub_

Admin-level access to a GitHub Account. The Account can either be a personal account to monitor personal repositories, or an organization account.

**AT PRESENT EACH RUNNING DEPLOYMENT OF CICADA ONLY SUPPORTS ONE GITHUB ACCOUNT**
(you can have multiple deployments in one AWS account though.)

You need GitHub admin-level access because Cicada needs to be installed as a "GitHub App".

_AWS_

1. Access to an AWS account with enough privs to create a bunch of resources. Typically "Admin" or "Power User" level permissions is best.
2. Publicly reachable Route53 DNS zone in same AWS account as you are deploying Cicada to.
3. AWS Certificate Manager Certificate **with wildcard** in the same account
   as you are deploying Cicada to.
   The non-wildcard-part of the domain **MUST** be the same as the domain name of the Route 53 zone in the previous step
4. The ARN of the Certificate in the previous step must be available as a CloudFormation Export. (I'll loosen requirement eventually)

For points 2 through 4, here is an example CloudFormation template you can use, but you'll need to make sure that the Route53 zone is publicly reachable.

```yaml
Resources:
  HostedZone:
    Type: AWS::Route53::HostedZone
    Properties:
      Name: 'youraccount.example.com'

  Certificate:
    Type: AWS::CertificateManager::Certificate
    Properties:
      DomainName: 'youraccount.example.com'
      SubjectAlternativeNames:
        - '*.youraccount.example.com'
      ValidationMethod: DNS

Outputs:
  CertificateArn:
    Value: !Ref Certificate
    Export:
      Name: YourCertificateExportName
```

_Local_

A local environment with Node that you can use to deploy to AWS. Alternatively you can deploy from GitHub actions - see the example in repository. The minimum required version of Node is specified in the [~/.nvmrc](.nvmrc) file.

### Prepare to deploy

First - clone this repo, or a fork, to your local machine

Then copy the [.env-template](./.env-template) file in the project root to a file named _.env_, open it, and update as follows

* Set `WEB_PARENT_DOMAIN_NAME` to the same as the Route 53 hosted zone name described in the previous section
* Set `WEB_CERTIFICATE_ARN_CLOUDFORMATION_EXPORT` to the **name**
  of the CloudFormation Export for the certificate described in the previous section. If you used the example CloudFormation template I provided it's whatever you replaced `YourCertificateExportName` with.

Finally - choose an `APP_NAME` value - this will be used as the prefix for the full web hostname for the app, and will be used as the prefix for CloudFormation stack names. By default you can just use `cicada`.

### Deploy

If you haven't already done so open a terminal and switch to the home directory for Cicada.

Make sure your terminal is setup with the correct AWS configuration to connect to your desired AWS account and region.

Run `npm install` to get Node dependencies if you haven't done so already.

If you're happy to use the default `APP_NAME` of `cicada` then run `./deploy.sh`. Otherwise run `APP_NAME=YOUR_APP_NAME ./deploy.sh` substituting `YOUR_APP_NAME`.

Assuming everything works OK then wait a few minutes. First deployment time is a little variable because Cicada uses CloudFront as a web host, which can take a while sometimes.

If everything has worked OK you should see something like:

```
 ✅  Main (cicada-main)

✨  Deployment time: 319.38s

Outputs:
Main.RestApiEndpoint00000000 = https://.....execute-api.us-east-1.amazonaws.com/prod/
Main.WebsiteBucketName = cicada-main-websitebucket....
Stack ARN:
arn:aws:cloudformation:us-east-1:123456789012:stack/cicada-main/74....

✨  Total time: 324.88s
```

### Setup GitHub App

Cicada has to be **registered** and **installed** as a "GitHub App" in your GitHub account. This process is mostly automated, but you need to perform a few steps:

* Go to `https://APP_NAME.WEB_PARENT_DOMAIN_NAME/github/setup/start` where `APP_NAME` and `WEB_PARENT_DOMAIN_NAME` are as described already.
* You should see instructions telling you to press one of two buttons. 
  To register Cicada into a _Personal_ account just press the first button.
  To register Cicada into an _Organization_ account type the organization name into the box, and press the second button.
* Follow the GitHub workflow
* You should be redirected to a Cicada page that tells you you need to **_install_** the newly registered app - follow the link and do so
* If all goes well Cicada will now start downloading data from your Github account.
  Give it a few seconds / minutes (depending on your account size) then go to the next step. 

### Use Cicada

If everything has worked you should be able to now use Cicada. Visit https://APP_NAME.PARENT_DOMAIN_NAME/, substituting APP_NAME and PARENT_DOMAIN_NAME as you've been doing above. You should see a welcome screen.

Now try logging in - click the "login with your GitHub user" link. You'll go through the GitHub login flow, and then eventually you'll end up at a screen that says "GitHub Actions Status".

Depending on how recently you've had activity in your account you may already see some data here. If not then:

* Go to the Lambda Console in your account
* Go to the _githubCrawler_ function for your installation
* Go to the "Test" tab
* Set the _Event JSON_ section to `{"lookbackDays": 90}` (adjust the value to more or few days)
* Click the "Test" button

This will load more data from your GitHub account, but consider that only GitHub Actions Runs data will be available more than a couple of weeks in the past - you won't see any older Push events

### Use Push Notifications

On each Cicada screen you'll see a "Manage Web Push Notifications" link - choosing this will allow you to subscribe for notifications.

**IMPORTANT FOR IPHONE USERS** :
On an iPhone you need to "install" Cicada as a Progressive Web App (PWA) first - you do this by adding it to your home screen via the "share" button. Open the PWA version of Cicada and then you should be able to subscribe for notifications.

At the moment notifications are all-or-nothing - you'll get notified of all GitHub Actions Workflow runs in your account. Eventually I'd like to have this be more configurable.

## Licensing and Contributions

My primary goal for Cicada, for now, is providing a freely-available example of many of the techniques I use in my client work.
However, there is a chance that in future I may wish to offer a version of Cicada as a commercial product. This has the following impacts:

1 - The [license](LICENSE) is a "Source Available License", specifically the Business Source License (BSL). This license is used by several software products, originally MariaDB.
The license basically says (although refer to the license for the actual legal version) that you can use Cicada however you want, apart from selling any version (or derivative) of it as a product or service.

2 - I absolutely welcome contributions, but please be aware that I have a [Contributor Agreement](ContributorAgreement.txt) to make sure we're covered should I ever decide to productize it.