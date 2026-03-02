#!/usr/bin/env node
"use strict";

const path = require("path");
const { Logger } = require("./logger");
const { SetupAssistant } = require("./setup-assistant");

function parseArgs(argv) {
  const args = {
    nonInteractive: false,
    validateOnly: false,
    detectOnly: false,
    outputPath: null,
    configPath: null,
    silent: false,
    help: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--non-interactive":
        args.nonInteractive = true;
        break;
      case "--validate-only":
        args.validateOnly = true;
        args.configPath = argv[i + 1] || null;
        if (args.configPath && !args.configPath.startsWith("--")) {
          i++;
        } else {
          args.configPath = null;
        }
        break;
      case "--detect-only":
        args.detectOnly = true;
        break;
      case "--output":
        args.outputPath = argv[i + 1] || null;
        if (args.outputPath) i++;
        break;
      case "--silent":
        args.silent = true;
        break;
      case "--help":
      case "-h":
        args.help = true;
        break;
    }
  }
  return args;
}

function printBanner() {
  console.log("");
  console.log("  =============================================");
  console.log("   OpenClaw Setup Guide - Interactive Assistant");
  console.log("  =============================================");
  console.log("");
}

function printHelp() {
  printBanner();
  console.log("Usage: node cli-interface.js [options]");
  console.log("");
  console.log("Options:");
  console.log("  --non-interactive   Run with default settings, no prompts");
  console.log("  --validate-only [path]  Validate an existing config file");
  console.log("  --detect-only       Detect system info and exit");
  console.log("  --output <path>     Custom output path for config");
  console.log("  --silent            Suppress log output");
  console.log("  --help, -h          Show this help message");
  console.log("");
}

function printResult(result) {
  console.log("");
  if (result.report) {
    console.log(result.report);
    console.log("");
  }

  if (result.success) {
    console.log("  Setup completed successfully!");
    if (result.configPath) {
      console.log(`  Configuration saved to: ${result.configPath}`);
    }
  } else if (result.success === false) {
    console.log(`  Setup failed at stage: ${result.stage || "unknown"}`);
    if (result.validation && result.validation.issues) {
      for (const issue of result.validation.issues) {
        console.log(`    [${issue.severity.toUpperCase()}] ${issue.field}: ${issue.message}`);
      }
    }
    if (result.error) {
      console.log(`    Error: ${result.error}`);
    }
  }
  console.log("");
}

function printDetectionResult(result) {
  console.log("");
  console.log("  System Detection Results:");
  console.log("  -------------------------");
  const info = result.systemInfo;
  console.log(`  Platform:   ${info.platform} (${info.arch})`);
  console.log(`  Node.js:    ${info.nodeVersion || "NOT FOUND"}`);
  console.log(`  npm:        ${info.npmVersion || "NOT FOUND"}`);
  console.log(`  Git:        ${info.gitVersion || "NOT FOUND"}`);
  console.log(`  Shell:      ${info.shell}`);
  console.log(`  Memory:     ${info.memory.totalMB} MB total, ${info.memory.freeMB} MB free`);
  console.log(`  OpenClaw:   ${info.openclawInstalled ? "installed" : "not found"}`);
  console.log("");
  if (info.missingDependencies.length > 0) {
    console.log(`  Missing: ${info.missingDependencies.join(", ")}`);
  } else {
    console.log("  All dependencies found.");
  }
  console.log("");

  if (result.validation) {
    const status = result.validation.valid ? "PASS" : "FAIL";
    console.log(`  System Requirements: ${status}`);
    for (const issue of result.validation.issues) {
      console.log(`    [${issue.severity.toUpperCase()}] ${issue.message}`);
    }
  }
  console.log("");
}

function main() {
  const args = parseArgs(process.argv);

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  printBanner();

  const logger = new Logger({ silent: args.silent });
  const assistant = new SetupAssistant({
    logger,
    outputPath: args.outputPath,
    silent: args.silent,
  });

  if (args.detectOnly) {
    const result = assistant.detectOnly();
    printDetectionResult(result);
    process.exit(result.validation.valid ? 0 : 1);
  }

  if (args.validateOnly) {
    const configPath = args.configPath || path.join(
      require("os").homedir(),
      ".openclaw",
      "config.json"
    );
    const result = assistant.validateOnly(configPath);
    console.log("");
    console.log(result.report);
    console.log("");
    process.exit(result.validation.valid ? 0 : 1);
  }

  // Run full setup (non-interactive by default for CLI, interactive would use readline)
  const result = assistant.run();
  printResult(result);
  process.exit(result.success ? 0 : 1);
}

// Allow both direct execution and import
if (require.main === module) {
  main();
}

module.exports = { parseArgs, main };
