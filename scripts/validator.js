"use strict";

const fs = require("fs");
const path = require("path");

class Validator {
  constructor(logger) {
    this.logger = logger;
  }

  validateConfig(config) {
    this.logger.info("Validating configuration...");
    const issues = [];

    if (!config || typeof config !== "object") {
      issues.push({ severity: "error", field: "root", message: "Configuration must be a non-null object." });
      return { valid: false, issues };
    }

    // Check required top-level sections
    const requiredSections = ["system", "workspace", "agent"];
    for (const section of requiredSections) {
      if (!config[section]) {
        issues.push({ severity: "error", field: section, message: `Missing required section: ${section}` });
      }
    }

    // Validate system section
    if (config.system) {
      if (!config.system.platform) {
        issues.push({ severity: "error", field: "system.platform", message: "Platform is required." });
      }
      const validPlatforms = ["linux", "macos", "windows"];
      if (config.system.platform && !validPlatforms.includes(config.system.platform)) {
        issues.push({ severity: "warn", field: "system.platform", message: `Unexpected platform: ${config.system.platform}` });
      }
    }

    // Validate workspace section
    if (config.workspace) {
      if (!config.workspace.name || typeof config.workspace.name !== "string") {
        issues.push({ severity: "error", field: "workspace.name", message: "Workspace name is required and must be a string." });
      }
      if (!config.workspace.path || typeof config.workspace.path !== "string") {
        issues.push({ severity: "error", field: "workspace.path", message: "Workspace path is required and must be a string." });
      }
    }

    // Validate agent section
    if (config.agent) {
      if (typeof config.agent.enabled !== "boolean") {
        issues.push({ severity: "warn", field: "agent.enabled", message: "agent.enabled should be a boolean." });
      }
      const validLogLevels = ["debug", "info", "warn", "error"];
      if (config.agent.logLevel && !validLogLevels.includes(config.agent.logLevel)) {
        issues.push({ severity: "warn", field: "agent.logLevel", message: `Invalid log level: ${config.agent.logLevel}` });
      }
    }

    const hasErrors = issues.some((i) => i.severity === "error");
    if (hasErrors) {
      this.logger.error(`Validation failed with ${issues.length} issue(s).`);
    } else if (issues.length > 0) {
      this.logger.warn(`Validation passed with ${issues.length} warning(s).`);
    } else {
      this.logger.info("Validation passed with no issues.");
    }

    return { valid: !hasErrors, issues };
  }

  validateConfigFile(filePath) {
    this.logger.info(`Validating config file: ${filePath}`);
    if (!fs.existsSync(filePath)) {
      return {
        valid: false,
        issues: [{ severity: "error", field: "file", message: `File not found: ${filePath}` }],
      };
    }

    let config;
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      config = JSON.parse(raw);
    } catch (err) {
      return {
        valid: false,
        issues: [{ severity: "error", field: "file", message: `Invalid JSON: ${err.message}` }],
      };
    }

    return this.validateConfig(config);
  }

  validateSystemRequirements(systemInfo) {
    this.logger.info("Validating system requirements...");
    const issues = [];

    if (!systemInfo.nodeVersion) {
      issues.push({ severity: "error", field: "node", message: "Node.js is required but not found." });
    } else {
      const major = parseInt(systemInfo.nodeVersion.replace("v", ""), 10);
      if (major < 18) {
        issues.push({ severity: "error", field: "node", message: `Node.js >= 18 required, found ${systemInfo.nodeVersion}` });
      }
    }

    if (!systemInfo.npmVersion) {
      issues.push({ severity: "warn", field: "npm", message: "npm is not found. Package management will be limited." });
    }

    if (!systemInfo.gitVersion) {
      issues.push({ severity: "warn", field: "git", message: "git is not found. Version control features will be unavailable." });
    }

    if (systemInfo.memory && systemInfo.memory.freeMB < 256) {
      issues.push({ severity: "warn", field: "memory", message: `Low available memory: ${systemInfo.memory.freeMB} MB` });
    }

    const hasErrors = issues.some((i) => i.severity === "error");
    if (hasErrors) {
      this.logger.error("System requirements not met.");
    } else {
      this.logger.info("System requirements met.");
    }

    return { valid: !hasErrors, issues };
  }

  formatReport(results) {
    const lines = ["=== Setup Validation Report ===", ""];
    for (const [section, result] of Object.entries(results)) {
      const status = result.valid ? "PASS" : "FAIL";
      lines.push(`[${status}] ${section}`);
      for (const issue of result.issues) {
        const prefix = issue.severity === "error" ? "  ERROR" : "  WARN ";
        lines.push(`${prefix} ${issue.field}: ${issue.message}`);
      }
    }
    lines.push("");
    const allValid = Object.values(results).every((r) => r.valid);
    lines.push(allValid ? "Overall: PASS" : "Overall: FAIL");
    return lines.join("\n");
  }
}

module.exports = { Validator };
