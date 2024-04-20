#!/bin/bash

# ** Decide on the app name **
# If the calling process already set the APP_NAME env var then just use it
if [ -n "$APP_NAME" ]; then
  echo "Using pre-set APP_NAME for app name"
# Otherwise if an argument was passed when this script was called then use that as the suffix of the app name
elif [ "$#" -gt 0 ]; then
  APP_NAME="cicada-$1"
# Otherwise use the local username as the app name suffix (THIS WON'T WORK ON WINDOWS - THERE IS NO SHORT USERNAME)
elif [ -n "$USER" ]; then
  APP_NAME="cicada-${USER}"
# Otherwise fail
else
  echo "Usage: ./deploy.sh APP_NAME, e.g. run \"./deploy.sh alice\" to deploy the cicada-alice app"
  exit 1
fi

export APP_NAME
echo "APP_NAME set to ${APP_NAME}"

deployParams=("--" "--all")

# If calling process has set NO_HOTSWAP to anything, then DON'T hotswap, otherwise DO hotswap
# NB - don't use hotswap in production
if [ -z "$NO_HOTSWAP" ]; then
  deployParams+=("--hotswap-fallback")
fi

# Bash settings to protect against various errors
set -euo pipefail

# ** START OF WEB BUILD **

# Loads required vars - from environment, or using .env file (hence references to dotenv/config)
read -r VAPID_PUBLIC_KEY <<< "$(npx ts-node -r dotenv/config src/tools/getDeployConfig.ts)"

echo "VAPID_PUBLIC_KEY set to ${VAPID_PUBLIC_KEY}"

rm -rf build/web
mkdir -p build/web
cp -rp src/web build/

# Use slightly different sed syntax on Mac
if [[ $(uname) == "Darwin" ]]; then
  find build/web -type f -exec sed -i '' "s/{{VAPID_PUBLIC_KEY}}/$VAPID_PUBLIC_KEY/g" {} +
else
  find build/web -type f -exec sed -i "s/{{VAPID_PUBLIC_KEY}}/$VAPID_PUBLIC_KEY/g" {} +
fi

# ** END OF WEB BUILD **

set +u

if [ -n "$ONLY_WEB_CONTENT" ]; then
  BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name $APP_NAME-main --query 'Stacks[0].Outputs[?OutputKey==`WebsiteBucketName`].OutputValue' --output text)
  echo "Writing web content to bucket $BUCKET_NAME"
  aws s3 sync build/web "s3://$BUCKET_NAME"
else
  npm run deploy "${deployParams[@]}"
fi

set -u
