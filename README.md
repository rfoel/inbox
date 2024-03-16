# inbox

## Setup

You should pre-create a [ReceiptRuleSet](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-ses-receiptruleset.html) named `inbox` and activate it in order to receive emails. Check [Email receiving with Amazon SES](https://docs.aws.amazon.com/ses/latest/dg/receiving-email.html) for more information.

Also, this setup assumes your domain is configured in Route 53 as SST tries to create MX records to allow AWS to receive emails. It should work in your own DNS provider setting the following value as the MX record for the domain:

```
10 inbound-smtp.us-east-1.amazonaws.com
```

## Development

[SST](https://sst.dev/) is being use, so there's no need to run local DynamoDB instances or Docker containers, SST takes care of it creating a dev environment in your AWS account. 

You will use the `npm run dev` command to run your development environment, but first you need to setup the SST environment with:

```
npm run sst:dev
```

This command will ask for a stage name and you can use whatever you want. After that simply run `npm run dev` to start both the SST environment and the [Astro](https://astro.build/) application.

## Deploy

Go ahead and deploy your inbox with:

```
npm run sst:deploy -- --stage prod
```