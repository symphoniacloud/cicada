#!/usr/bin/env node
import { App } from 'aws-cdk-lib'
import { MainStack } from './stacks/main/MainStack.js'
import { StorageStack } from './stacks/StorageStack.js'
import * as dotenv from 'dotenv'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildWebConfig } from './preSynth/buildWeb.js'
import { createAllStacksProps } from './preSynth/allStacksPropsLoader.js'

// Get the directory name in ESM
// Loads /.env file into environment if there is one
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env') })

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
