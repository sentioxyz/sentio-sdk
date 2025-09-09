import chalk from 'chalk'
import { Command } from '@commander-js/extra-typings'
import { loadProcessorConfig, getFinalizedHost } from '../config.js'
import { ReadKey } from '../key.js'
import fetch from 'node-fetch'
import fs from 'fs-extra'
import path from 'path'
import { CommandOptionsType } from './types.js'

interface StartGenerationRequest {
  chain_id: string
  contract_address: string
  user_prompt: string
  project_name: string
}

interface StartGenerationResponse {
  sessionId: string
  currentCursorPosition: number
}

interface ChatMessage {
  role: string
  text: string
  isFinal: boolean
  runId: string
  resources: Array<{
    uri: string
    name: string
    description?: string
    mimeType?: string
    text?: string
    content?: string // Keep for backward compatibility
  }>
}

interface ChatResponse {
  messages: ChatMessage[]
}

// API_BASE_URL will be determined from host configuration

export function createAiCommand() {
  return new Command('generate-processor')
    .alias('gen-processor')
    .description('Generate processor code using Sentio AI service (run after "sentio gen")')
    .requiredOption('--prompt <prompt>', 'User prompt for AI generation')
    .option('--chain-id <chainId>', 'Override chain ID (optional if contracts configured)')
    .option('--contract <address>', 'Override contract address (optional if contracts configured)')
    .option('--project-name <name>', 'Override project name (optional)')
    .option('--verbose', 'Show all AI messages instead of just the latest')
    .option('--save', 'Automatically save generated code to src/ directory')
    .option('--host <host>', 'Override Sentio host (optional)')
    .action(async (options) => {
      await generateProcessor(options)
    })
}

async function generateProcessor(options: CommandOptionsType<typeof createAiCommand>) {
  try {
    // Get API credentials
    const host = getFinalizedHost(options.host || 'prod')
    const apiKey = ReadKey(host)

    if (!apiKey) {
      console.error(chalk.red('Error: Not logged in to Sentio.'))
      console.error(chalk.yellow('Please run: sentio login' + (options.host ? ` --host ${options.host}` : '')))
      process.exit(1)
    }

    // Construct API base URL from host
    const apiBaseUrl = `${host}/api/v1`

    // Load configuration and extract defaults
    const config = loadProcessorConfig()
    const firstContract = config.contracts?.[0]

    const chainId = options.chainId || firstContract?.chain || '1'
    const contractAddress = options.contract || firstContract?.address
    const projectName = options.projectName || config.project || process.cwd().split('/').pop() || 'unnamed-project'

    if (!contractAddress) {
      console.error(chalk.red('Error: No contract address found.'))
      console.error(chalk.yellow('Please either:'))
      console.error(chalk.yellow('  1. Add contracts to sentio.yaml and run "sentio gen"'))
      console.error(chalk.yellow('  2. Use --contract <address> flag'))
      process.exit(1)
    }

    console.log(chalk.blue('🤖 Starting AI processor generation...'))
    console.log(chalk.gray(`📋 Project: ${projectName}`))
    console.log(chalk.gray(`⛓️  Chain: ${chainId}`))
    console.log(chalk.gray(`📄 Contract: ${contractAddress}`))
    console.log(chalk.gray(`💭 Prompt: ${options.prompt}`))
    console.log()

    // Start generation session
    const session = await startGeneration(
      {
        chain_id: chainId,
        contract_address: contractAddress,
        user_prompt: options.prompt,
        project_name: projectName
      },
      apiBaseUrl
    )

    console.log(chalk.green(`✓ Generation session started: ${session.sessionId}`))
    console.log()

    // Poll for messages
    await pollAndDisplayMessages(
      session.sessionId,
      session.currentCursorPosition,
      options.verbose || false,
      options.save || false,
      apiBaseUrl,
      apiKey
    )
  } catch (error) {
    console.error(chalk.red('Error during AI generation:'), error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

async function startGeneration(request: StartGenerationRequest, apiBaseUrl: string): Promise<StartGenerationResponse> {
  const response = await fetch(`${apiBaseUrl}/ai/processor/generate/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    throw new Error(`Failed to start generation: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as StartGenerationResponse
}

async function pollAndDisplayMessages(
  sessionId: string,
  initialCursorPosition: number,
  verbose: boolean,
  autoSave: boolean,
  apiBaseUrl: string,
  apiKey: string
) {
  let cursorPosition = initialCursorPosition
  let isComplete = false
  let spinner = createSpinner('Starting AI processor generation')
  const allMessages: string[] = []

  const displayMessage = (text: string, isLatest: boolean = true) => {
    if (verbose) {
      // In verbose mode, show all messages normally
      console.log(chalk.cyan('AI:'), text)
    }
    // In normal mode, we don't display individual messages - only use them for spinner text
  }

  const displayFinalSummary = () => {
    if (!verbose && allMessages.length > 1) {
      console.log()
      console.log(chalk.gray(`💡 ${allMessages.length} steps completed. Use --verbose to see all steps.`))
    }
  }

  while (!isComplete) {
    try {
      const response = await fetch(`${apiBaseUrl}/ai/chat/${sessionId}?cursorPosition=${cursorPosition}`, {
        headers: {
          'api-key': apiKey
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get messages: ${response.status} ${response.statusText}`)
      }

      const chatResponse = (await response.json()) as ChatResponse

      if (chatResponse.messages && chatResponse.messages.length > 0) {
        // Stop spinner before showing messages
        spinner.stop()

        for (const message of chatResponse.messages) {
          if (message.role === 'ROLE_ASSISTANT') {
            const messageText = message.text

            // Just use the message as-is
            allMessages.push(messageText)
            displayMessage(messageText)

            if (message.isFinal) {
              isComplete = true
              spinner.stop()
              console.log(chalk.green('✓ Generation complete!'))
              displayFinalSummary()

              // Handle resources (generated code and zip files)
              if (message.resources && message.resources.length > 0) {
                console.log()
                console.log(chalk.blue('Generated files:'))
                for (const resource of message.resources) {
                  const description = resource.description || 'Generated file'
                  console.log(chalk.gray(`  • ${resource.name}: ${description}`))

                  // Handle zip files
                  if (resource.mimeType === 'application/zip' && resource.uri) {
                    console.log(chalk.cyan(`📦 Zip file: ${resource.name}`))
                    console.log(chalk.gray(`   Download URL: ${resource.uri}`))
                    console.log()
                    console.log(chalk.cyan('💡 To download and use the zip file:'))
                    console.log(chalk.gray(`   Download: curl -o ${resource.name} "${resource.uri}"`))
                    console.log(chalk.gray(`   Extract:  unzip ${resource.name}`))
                    console.log(chalk.gray(`   Review:   unzip -l ${resource.name}  # list contents`))
                  } else {
                    // Handle text/code content
                    const codeContent = resource.text || resource.content
                    if (codeContent) {
                      // Always create a temporary file first
                      const tempFileName = `${resource.name}.generated`
                      const tempFilePath = path.resolve(tempFileName)

                      try {
                        fs.writeFileSync(tempFilePath, codeContent)
                        console.log(chalk.cyan(`📄 Generated ${tempFilePath} (${codeContent.length} chars)`))

                        if (autoSave) {
                          // Also save to src/ directory
                          const srcDir = path.resolve('src')
                          fs.ensureDirSync(srcDir)
                          const finalPath = path.join(srcDir, resource.name)
                          fs.writeFileSync(finalPath, codeContent)
                          console.log(chalk.green(`✅ Saved to ${finalPath}`))
                        } else {
                          // Show instructions for manual move
                          console.log()
                          console.log(chalk.cyan('💡 To use the generated code:'))
                          console.log(chalk.gray(`   Review: cat ${tempFileName}`))
                          console.log(chalk.gray(`   Use:    mv ${tempFileName} src/${resource.name}`))
                          console.log(chalk.gray(`   Or:     sentio gen-processor --save --prompt "..." (auto-save)`))
                        }
                      } catch (error) {
                        console.error(
                          chalk.red(`Failed to write ${tempFileName}:`),
                          error instanceof Error ? error.message : error
                        )
                        // Fallback to showing truncated preview
                        console.log()
                        console.log(chalk.yellow('Generated code preview:'))
                        console.log(chalk.gray('─'.repeat(50)))
                        console.log(codeContent.substring(0, 800) + (codeContent.length > 800 ? '\n...' : ''))
                        console.log(chalk.gray('─'.repeat(50)))
                      }
                    }
                  }
                }
              }
              break
            }
          }
        }

        cursorPosition += chatResponse.messages.length

        if (!isComplete) {
          if (!verbose) {
            // Use the latest message as spinner text, or fallback to generic
            const latestMessage = allMessages[allMessages.length - 1] || 'Generating processor code'
            // For spinner, we do need to truncate to fit the terminal width
            const maxSpinnerLength = Math.min(80, (process.stdout.columns || 100) - 10)
            const spinnerText =
              latestMessage.length > maxSpinnerLength
                ? latestMessage.substring(0, maxSpinnerLength - 3) + '...'
                : latestMessage
            spinner = createSpinner(spinnerText)
          } else {
            spinner = createSpinner('Generating processor code')
          }
        }
      }

      // Wait before next poll
      if (!isComplete) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    } catch (error) {
      spinner.stop()
      throw error
    }
  }

  if (!isComplete) {
    spinner.stop()
  }
}

function createSpinner(text: string) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  let currentFrame = 0
  let isRunning = true
  let lastLineCount = 0

  const interval = setInterval(() => {
    if (!isRunning) return

    // Clear previous lines
    if (lastLineCount > 0) {
      // Move cursor up and clear each line
      for (let i = 0; i < lastLineCount; i++) {
        process.stdout.write('\r\x1b[K') // Clear current line
        if (i < lastLineCount - 1) {
          process.stdout.write('\x1b[1A') // Move cursor up one line
        }
      }
    }

    // Replace newlines with spaces for spinner display and truncate if too long
    const singleLineText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
    const maxLength = Math.min(80, (process.stdout.columns || 100) - 10)
    const truncatedText =
      singleLineText.length > maxLength ? singleLineText.substring(0, maxLength - 3) + '...' : singleLineText

    // Write the new line
    const line = `${chalk.cyan(frames[currentFrame])} ${truncatedText}`
    process.stdout.write(line)

    // Always count as 1 line since we convert newlines to spaces
    lastLineCount = 1
    currentFrame = (currentFrame + 1) % frames.length
  }, 100)

  return {
    stop: () => {
      isRunning = false
      clearInterval(interval)
      // Clear all lines when stopping
      if (lastLineCount > 0) {
        for (let i = 0; i < lastLineCount; i++) {
          process.stdout.write('\r\x1b[K') // Clear current line
          if (i < lastLineCount - 1) {
            process.stdout.write('\x1b[1A') // Move cursor up one line
          }
        }
      }
    }
  }
}
