#!/usr/bin/env node
import 'source-map-support/register'
import { App } from 'aws-cdk-lib'
import { MainStack } from './stacks/main/MainStack'
import { StorageStack } from './stacks/StorageStack'
import * as dotenv from 'dotenv'
import { buildWebConfig } from './preSynth/buildWeb'
import { createAllStacksProps } from './preSynth/allStacksPropsLoader'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

async function createApp(app: App) {
  const allStacksProps = await createAllStacksProps()

  await buildWebConfig(allStacksProps.webPushConfig.publicKey)

  const storageStack = new StorageStack(app, 'Storage', {
    stackName: `${allStacksProps.appName}-storage`,
    ...allStacksProps
  })

  const mainStack = new MainStack(app, 'Main', {
    stackName: `${allStacksProps.appName}-main`,
    ...allStacksProps
  })
  // Need to create / update storage resources before app resources
  mainStack.addDependency(storageStack)
}

// noinspection JSIgnoredPromiseFromCall
createApp(new App())
