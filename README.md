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
* Setup is **annoyingly complicated**, mostly because of lots of configuration
  with the "App" that needs to be created in GitHub. I hope to make this easier one day, but for now it's, what us Brits like to say, "a bit of a faff".
* All of the resources that Cicada deploys in AWS should be free or very cheap BUT AS ALWAYS WITH AWS keep an eye on your AWS costs.
  I strongly recommend setting up [billing alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/monitor_estimated_charges_with_cloudwatch.html).

Again, this is early days for Cicada as App, it's definitely **not** "batteries included".
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

A local environment with Node that you can use to deploy to AWS (You can do it from a GitHub Actions workflow too, but honestly you're going to want to run this locally for now, ideally. :) ). The minimum required version of Node is specified in the [~/.nvmrc](.nvmrc) file.

### Prepare to deploy

You know when I said above that setup was annoyingly complicated? Don't say I didn't warn you...

1. Clone this repo, or a fork, to your local machine
1. Copy the [.env-template](./.env-template) file in the project root to a file named
   _.env_ and open it - you'll be updating all the entries in this file.
1. Register a new GitHub App for your GitHub account (organization or personal).
2. **FOLLOW THE GITHUB INSTRUCTIONS [HERE](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app)
   UP TO AND INCLUDING THE PART ABOUT "HOMEPAGE URL"**.
   Homepage URL is required but only descriptive - so add anything that makes sense. If nothing else you can use
   _https://github.com/symphoniacloud/cicada_ .
    1. Set _Callback
       URL_ to `https://APP_NAME.PARENT_DOMAIN_NAME/auth/github/callback`, where `APP_NAME` is the name you'll give to the app during deployment (e.g. 'cicada') and `PARENT_DOMAIN_NAME` is the same as that of the Route53 zone described in the prerequisites earlier. E.g. `https://cicada.youraccount.example.com/auth/github/callback`
    2. Keep "Expire user authorization tokens" as enabled
    3. Ignore _Request user authorization_, _Enable Device Flow_, _Setup URL_, and _Redirect on update_
    4. For now, disable the "Active" checkbox for Webhook - you'll come back to that later
    5. Under "Repository permissions", select the following categories and levels:
        * _Actions_ : read-only
        * _Contents_ : read-only
        * _Metadata_ : read-only (will already be selected)
    6. Under _Organization permissions_, select _Members_ as read-only
    7. For _Where can this GitHub App be installed?_, leave as _Only on this account_
    8. Click "Create GitHub App"
1. From the resulting page...:
    1. Copy the short, numeric, _App ID_, and use it for the `GITHUB_APP_ID` variable in your _.env_ file
    2. Copy _Client ID_ and use it for `GITHUB_CLIENT_ID` in _.env_
    3. Click the "Generate a new Client Secret" button, copy the value, and use it for `GITHUB_CLIENT_SECRET` in _.env_
    4. Scroll down and click the "Generate a private key" button. Download the resulting file, open it, copy the contents,
       **including the '-----' header and footer** and use it for `GITHUB_PRIVATE_KEY` in _.env_ .
       **MAKE SURE THAT THERE ARE NO LEADING SPACES ON EACH LINE** and **KEEP THE SURROUNDING QUOTES** - you may need to use 'paste as plain text'. Your .env file should now start something like:

```
GITHUB_APP_ID=1...
GITHUB_CLIENT_ID=Iv1.1...
GITHUB_CLIENT_SECRET=ce2...
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
AA112233AA112233AA112233AA112233AA112233AA112233AA112233AA112233
AA112233AA112233AA112233AA112233AA112233AA112233AA112233AA112233
(etc.)
AA112233AA112233AA112233AA112233AA112233AA112233AA11223=
-----END RSA PRIVATE KEY-----"
```

5. If you haven't already done so open a terminal and switch to the home directory for Cicada. Run `npm install` to download all dependencies. Now run `npm run generate-vapid-keys`. From the output copy the value for
   _Public Key_ and use it for `WEB_PUSH_VAPID_PUBLIC_KEY` in _.env_. Use the value of
   _Private Key_ and use it for `WEB_PUSH_VAPID_PRIVATE_KEY` in _.env_
6. Set a value for `WEB_PUSH_SUBJECT` in
   _.env_ . I use the same as the "Homepage" value I use when setting up the GitHub App, but it's not too important what it is.
7. For `CONFIG_ALLOWED_INSTALLATION_ACCOUNT_NAME` in
   _.env_ use the account name of the GitHub account which you have registered the app in.
   If it's an organization account make sure to use the organization account name and **NOT**
   your personal account name. For a personal account the account name and your Github login name are the same thing.
8. For `WEB_PARENT_DOMAIN_NAME` in _.env_ use the same `PARENT_DOMAIN_NAME` value described earlier
9. For `WEB_CERTIFICATE_ARN_CLOUDFORMATION_EXPORT` in _.env_ use the **name**
   of the CloudFormation Export for the certificate described earlier in pre-requisites. If you used the example CloudFormation template I provided it's whatever you replaced `YourCertificateExportName` with.

### Deploy

Once you've setup _.env_ you can deploy the app.

1. Know what your `APP_NAME` value is - it's whatever you chose as the first part of the full web hostname earlier - e.g. `cicada`.
2. If you haven't already done so open a terminal and switch to the home directory for Cicada
3. Make sure your terminal is setup with the correct AWS configuration to connect to your desired AWS account and region
4. Substituting `YOUR_APP_NAME` for whatever your `APP_NAME` is, run `APP_NAME=YOUR_APP_NAME ./deploy.sh`

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

### Finish GitHub App setup

If you've got this far you're nearly done.

Deployment will have generated two random strings that you're going to need:

* If you can still see the entire output from the deployment script you'll see values for `GITHUB_WEBHOOK_URL_CODE` and `GITHUB_WEBHOOK_SECRET` - copy them.
* Otherwise find those values as SSM parameters in your AWS account [here](https://console.aws.amazon.com/systems-manager/parameters/) - they'll be named `/YOUR_APP_NAME/cicada/github-webhook-url-code` and `/YOUR_APP_NAME/github/webhook-secret`

Now head back to the "Developer Settings" configuration for your GitHub App on the GitHub website. Go to the _Webhook_ section:

* Set _Webhook URL_ to `https://APP_NAME.PARENT_DOMAIN_NAME/github/webhook/YOUR_WEBHOOK_URL_CODE`, where APP_NAME and PARENT_DOMAIN_NAME
  are as you set them for _Callback URL_, and `YOUR_WEBHOOK_URL_CODE` is the webhook **code** generated during deployment
* Set _Webhook Secret_ to the webhook **secret** generated during deployment
* Set the _Active_ checkbox to enabled

Press "Save Changes".

Now click on "Advanced" on the GitHub left hand side navigation - it should show "Recent Deliveries", and if you've configured everything OK you'll see a successful "ping" delivery.

![img.png](docs/images/githubPingExample.png)

Now you need to configure the webhook events GitHub will send. Click "Permissions & events", and then under "Subscribe to Events" choose:

* Workflow run
* Meta
* Organization
* Push
* Repository
* Workflow job

Then click "save changes"

By this point you've configured the GitHub App, but you still need to "install" it - click "Install App" on the
left hand side, then click the "Install" button for the target account, and follow the workflow.

Wait for a minute or so, then proceed to the next step.

### Use Cicada

If everything has worked you should be able to now use Cicada. Visit https://APP_NAME.PARENT_DOMAIN_NAME/, substituting APP_NAME and PARENT_DOMAIN_NAME as you've been doing above. You should see a welcome screen.

Now try logging in - click the "login with your GitHub user" link. You'll go through the GitHub login flow, and then eventually you'll end up at a screen that says "GitHub Actions Status".

Depending on how recently you've had activity in your account you may already see some data here. If not then:

* Go to the Lambda Console in your account
* Go to the _githubCrawler_ function for your installation
* Go to the "Test" tab
* Set the _Event JSON_ section to `{"lookbackDays": 90}` (adjust the value to more or few days)
* Click the "Test" button

This will load more data from your GitHub account, but consider only GitHub Actions Runs will be available more than a couple of weeks in the past.

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