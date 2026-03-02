---
name: openclaw-setup-guide
description: Interactive step-by-step setup assistant for OpenClaw with automated configuration and error handling.
version: 1.0.0
author: OpenClaw
tags:
  - setup
  - configuration
  - onboarding
  - wizard
---

# openclaw-setup-guide

Interactive step-by-step setup assistant for OpenClaw with automated configuration and error handling.

## Core Capabilities

- Interactive prompts guiding users through each setup step
- Automatic system detection (OS, dependencies, environment)
- Configuration file generation from validated templates
- Contextual troubleshooting guidance during setup
- Setup validation and issue detection
- Setup report and documentation generation

## Out of Scope

- Complex network configuration beyond basic setup
- Custom plugin or skill development
- Advanced security hardening beyond basic setup
- Multi-server or distributed system setup
- Migration between different OpenClaw versions
- Performance optimization or tuning

## Trigger Scenarios

- "Help me set up OpenClaw"
- "I need to install OpenClaw step by step"
- "OpenClaw setup guide"
- "How do I configure OpenClaw?"
- "Automate my OpenClaw installation"
- "OpenClaw wizard setup"
- "I'm having trouble with OpenClaw setup"

## Required Resources

- `scripts/` — Core setup automation logic, CLI interface, system detection
- `references/` — Setup documentation, configuration templates, troubleshooting
- `assets/` — Skill icon and branding

## Usage

```bash
# Interactive setup wizard
node scripts/cli-interface.js

# Non-interactive setup with defaults
node scripts/cli-interface.js --non-interactive

# Validate an existing setup
node scripts/cli-interface.js --validate-only

# Detect system info
node scripts/cli-interface.js --detect-only
```
