#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings'
import { createLoginCommand } from './commands/login.js'
import { createCreateCommand } from './commands/create.js'
import { createVersionCommand } from './commands/version.js'
import { createTestCommand } from './commands/test.js'
import { createAddCommand } from './commands/add.js'
import { createCompileCommand } from './commands/compile.js'
import { createGraphCommand } from './commands/graph.js'
import { createUploadCommand } from './commands/upload.js'
import { createBuildCommand, createGenCommand } from './commands/build.js'
import { createAiCommand } from './commands/ai.js'
import { createDataCommand } from './commands/data.js'
import { createProjectCommand } from './commands/project.js'
import { createProcessorCommand } from './commands/processor.js'
import { createAlertCommand } from './commands/alert.js'
import { createPriceCommand } from './commands/price.js'
import { createSimulationCommand } from './commands/simulation.js'
import { createEndpointCommand } from './commands/endpoint.js'
import { createDashboardCommand } from './commands/dashboard.js'
import { enableApiDebug } from './api.js'
import { printVersions } from './utils.js'

const program = new Command()

program.name('sentio').description('Login & Manage your project files to Sentio.')
program.option('--debug', 'Print API requests for debugging')

await printVersions()

if (process.argv.includes('--debug')) {
  enableApiDebug()
}

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
program.addCommand(createAiCommand())
program.addCommand(createDataCommand())
program.addCommand(createProjectCommand())
program.addCommand(createProcessorCommand())
program.addCommand(createAlertCommand())
program.addCommand(createPriceCommand())
program.addCommand(createSimulationCommand())
program.addCommand(createEndpointCommand())
program.addCommand(createDashboardCommand())

program.parse()
