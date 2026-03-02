# OpenClaw Setup Guide

## Prerequisites

Before starting the setup, ensure you have:

- **Node.js** >= 18.0.0
- **npm** (comes with Node.js)
- **git** (for version control features)

## Step 1: System Check

Run the system detector to verify your environment:

```bash
node scripts/cli-interface.js --detect-only
```

This will check:
- Operating system and architecture
- Node.js and npm versions
- Git availability
- Available memory
- Existing OpenClaw installation

## Step 2: Run Setup

### Interactive Setup (recommended for first-time users)

```bash
node scripts/cli-interface.js
```

### Non-Interactive Setup (for automation)

```bash
node scripts/cli-interface.js --non-interactive
```

### Custom Output Path

```bash
node scripts/cli-interface.js --output /path/to/config.json
```

## Step 3: Verify Setup

Validate your configuration:

```bash
node scripts/cli-interface.js --validate-only /path/to/config.json
```

## Step 4: Start Using OpenClaw

Once setup is complete, your configuration file is ready at `~/.openclaw/config.json`.

## Configuration File Structure

```json
{
  "version": "1.0.0",
  "environment": "linux",
  "settings": {
    "autoUpdate": true,
    "telemetry": false,
    "shell": "auto"
  },
  "system": {
    "platform": "linux",
    "arch": "x64",
    "nodeVersion": "v20.0.0",
    "detectedAt": "2026-03-02T00:00:00.000Z"
  },
  "workspace": {
    "name": "default",
    "path": "/home/user/.openclaw/workspace"
  },
  "agent": {
    "enabled": true,
    "autostart": false,
    "logLevel": "info"
  }
}
```

## Environment-Specific Notes

### Linux
- Shell detection uses `$SHELL` environment variable
- Config stored in `~/.openclaw/`

### macOS
- Same as Linux in most respects
- Uses default template settings

### Windows
- Shell detection uses `%COMSPEC%`
- Paths use backslashes in configuration
- Config stored in `%USERPROFILE%\.openclaw\`
