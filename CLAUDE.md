# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

Sentio SDK is a TypeScript-based blockchain data indexing and analytics platform that supports multiple blockchain ecosystems. The codebase is organized as a monorepo using pnpm workspaces with the following key components:

### Core Packages
- **`packages/sdk/`**: Main SDK with blockchain-specific processors and utilities
- **`packages/cli/`**: Command-line interface for project management, deployment, and AI-powered processor generation
- **`packages/runtime/`**: Runtime engine for processing blockchain data
- **`packages/protos/`**: Protocol buffer definitions for service communication
- **`packages/action/`**: Action processing capabilities

### Blockchain Support
The SDK supports multiple blockchain ecosystems through dedicated modules in `packages/sdk/src/`:
- **Ethereum (`eth/`)**: EVM-compatible chains with contract interaction, ABI decoding, and event processing
- **Aptos (`aptos/`)**: Move-based blockchain with resource and event processing
- **Sui (`sui/`)**: Move-based blockchain with object and transaction processing
- **IOTA (`iota/`)**: Move-based blockchain similar to Sui
- **Solana (`solana/`)**: Solana blockchain with program and instruction processing
- **Starknet (`stark/`)**: Cairo-based blockchain with event and transaction processing
- **Bitcoin (`btc/`)**: Bitcoin blockchain with transaction and UTXO processing
- **Cosmos (`cosmos/`)**: Cosmos SDK-based chains with transaction processing
- **Fuel (`fuel/`)**: Fuel VM blockchain with asset and transaction processing

### Key Architecture Patterns
- **Processor Pattern**: Each blockchain has dedicated processor classes that handle chain-specific data
- **Context Pattern**: Chain-specific contexts provide access to blockchain state and utilities
- **Plugin System**: Modular plugin architecture for extending functionality
- **Template System**: Code generation templates for creating type-safe contract bindings
- **Testing Framework**: Comprehensive testing utilities for all supported chains

## Development Commands

### Build Commands
```bash
# Build all packages and examples
./scripts/build-all.sh

# Build specific package
pnpm --filter "./packages/sdk" build

# Build CLI templates
pnpm --filter "./packages/cli/templates/**" build --skip-deps
```

### Test Commands
```bash
# Run all tests (builds first)
./scripts/test-all.sh

# Test specific package
pnpm --filter "./packages/sdk" test
```

### Linting and Formatting
```bash
# Lint all files
pnpm lint

# Format code
pnpm format
```

### Package Management
```bash
# Install dependencies (pnpm required)
pnpm install

# Add dependency to specific package
pnpm --filter "./packages/sdk" add dependency-name
```

## CLI Usage

The Sentio CLI (`packages/cli/`) provides project management capabilities:

### Project Management
```bash
# Create new project from template
sentio create

# Add contract ABI to project
sentio add

# Build project (generates ABIs and compiles)
sentio build

# Generate ABIs only
sentio gen

# Generate processor code using AI (run after sentio gen)
sentio generate-processor --prompt "Track token transfers and calculate volume metrics"
sentio gen-processor --prompt "Monitor staking events"  # Shorter alias

# Run tests
sentio test
```

### AI Processor Generation
```bash
# Generate processor code using Sentio AI service
# Automatically uses contract info from sentio.yaml (run after sentio gen)
sentio generate-processor --prompt "Track all token transfer events and calculate daily volume metrics"

# Override specific parameters if needed
sentio gen-processor --prompt "Monitor DEX swaps" --chain-id "1" --contract "0x123..." --project-name "dex-analytics"

# The AI will:
# - Analyze your contract ABI
# - Generate production-ready processor code
# - Include appropriate metrics and event logging
# - Follow Sentio SDK best practices
```

### Deployment
```bash
# Login to Sentio platform
sentio login --host=test

# Upload processor to platform
sentio upload --host=test

# Upload subgraph processor
sentio graph
```

## Project Structure

### Configuration Files
- **`sentio.yaml`**: Project configuration file defining project name, host, and contracts
- **`package.json`**: Standard Node.js package configuration
- **`tsconfig.json`**: TypeScript configuration

### Example Projects
The `examples/` directory contains reference implementations for each supported blockchain:
- `examples/eth/`: Ethereum processor example
- `examples/aptos/`: Aptos processor example  
- `examples/sui/`: Sui processor example
- And more for each supported chain

### Code Generation
The SDK includes powerful code generation capabilities:
- **ABI Generation**: Automatic TypeScript binding generation from contract ABIs
- **Type Safety**: Full type safety for contract interactions and event handling
- **Template System**: Extensible template system for custom code generation

## Testing

### Test Structure
Each package contains comprehensive tests:
- Unit tests for core functionality
- Integration tests for blockchain interactions
- Template tests for code generation

### Running Tests
Tests require building the project first. Use `./scripts/test-all.sh` to build and test everything, or target specific packages with pnpm filters.

## Development Notes

- **Node.js**: Requires Node.js 20+
- **Package Manager**: Uses pnpm exclusively (enforced by preinstall script)
- **Monorepo**: Uses pnpm workspaces for dependency management
- **TypeScript**: Full TypeScript codebase with strict type checking
- **ESLint**: Code quality enforcement with custom rules
- **Git Hooks**: Automated formatting and linting on commit

## Chain-Specific Development

When working with blockchain-specific code:

1. **Contract ABIs**: Store in `abis/{chain}/` directories
2. **Code Generation**: Run `sentio gen` to generate TypeScript bindings from ABIs
3. **AI Processor Generation**: Use `sentio generate-processor --prompt "..."` to generate starter processor code with AI assistance
4. **Processors**: Implement using chain-specific processor classes (or start with AI-generated code)
5. **Testing**: Use chain-specific testing utilities from `packages/sdk/src/testing/`

## Debugging

The SDK includes comprehensive logging and debugging capabilities:
- Set `debug: true` in `sentio.yaml` for verbose logging
- Use testing framework for local development and debugging
- Leverage chain-specific context utilities for data access and manipulation