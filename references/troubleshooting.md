# Troubleshooting Guide

## Common Issues

### Node.js Not Found

**Symptom:** System detection reports Node.js as NOT FOUND.

**Solution:**
1. Install Node.js from https://nodejs.org/ (LTS recommended)
2. Verify installation: `node --version`
3. Ensure Node.js is in your PATH

### Node.js Version Too Old

**Symptom:** Validation error "Node.js >= 18 required"

**Solution:**
1. Update Node.js to version 18 or later
2. Use a version manager like `nvm`:
   ```bash
   nvm install 18
   nvm use 18
   ```

### npm Not Found

**Symptom:** System detection reports npm as NOT FOUND.

**Solution:**
- npm is bundled with Node.js. Reinstalling Node.js should fix this.
- Alternatively: `npm install -g npm`

### Git Not Found

**Symptom:** Warning about git not being available.

**Solution:**
- Linux: `sudo apt install git` or `sudo yum install git`
- macOS: `xcode-select --install` or `brew install git`
- Windows: Download from https://git-scm.com/

### Permission Denied Writing Config

**Symptom:** Error "Failed to write config: EACCES"

**Solution:**
1. Check directory permissions: `ls -la ~/.openclaw/`
2. Fix permissions: `chmod 755 ~/.openclaw/`
3. Or specify a different output path: `--output ./config.json`

### Invalid JSON in Config File

**Symptom:** Validation error "Invalid JSON"

**Solution:**
1. Check the config file for syntax errors
2. Use a JSON validator or linter
3. Re-run setup to regenerate the config

### Low Memory Warning

**Symptom:** Warning about low available memory.

**Solution:**
- Close unused applications to free memory
- This is a warning only and does not prevent setup

## Getting Help

If you encounter issues not covered here:
1. Check the setup-guide.md for detailed instructions
2. Run `node scripts/cli-interface.js --detect-only` for system info
3. Review the setup log for error details
