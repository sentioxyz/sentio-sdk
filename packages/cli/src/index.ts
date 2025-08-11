#!/usr/bin/env node

import { Command } from 'commander'
import { createLoginCommand } from './commands/run-login.js'
import { createCreateCommand } from './commands/run-create.js'
import { createVersionCommand } from './commands/run-version.js'
import { createTestCommand } from './commands/run-test.js'
import { createAddCommand } from './commands/run-add.js'
import { createCompileCommand } from './commands/run-compile.js'
import { createGraphCommand } from './commands/run-graph.js'
import { createUploadCommand } from './commands/run-upload.js'
import { createBuildCommand, createGenCommand } from './commands/build.js'
import { getCliVersion, printVersions } from './utils.js'

const program = new Command()

program.name('sentio').description('Login & Manage your project files to Sentio.').version(getCliVersion())

await printVersions()

program.addCommand(createLoginCommand())
program.addCommand(createCreateCommand())
program.addCommand(createVersionCommand())
program.addCommand(createTestCommand())
program.addCommand(createAddCommand())
program.addCommand(createCompileCommand())
program.addCommand(createGraphCommand())
program.addCommand(createUploadCommand())
program.addCommand(createBuildCommand())
program.addCommand(createGenCommand())

program.parse()
