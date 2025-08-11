#!/usr/bin/env node

import { Command } from 'commander'
import { createLoginCommand } from './commands/login.js'
import { createCreateCommand } from './commands/create.js'
import { createVersionCommand } from './commands/version.js'
import { createTestCommand } from './commands/test.js'
import { createAddCommand } from './commands/add.js'
import { createCompileCommand } from './commands/compile.js'
import { createGraphCommand } from './commands/graph.js'
import { createUploadCommand } from './commands/upload.js'
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
