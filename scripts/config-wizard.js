"use strict";

const fs = require("fs");
const path = require("path");

const TEMPLATES_DIR = path.join(__dirname, "..", "references", "templates");

class ConfigWizard {
  constructor(logger) {
    this.logger = logger;
  }

  loadTemplate(platform) {
    const templateName = this._resolveTemplateName(platform);
    const templatePath = path.join(TEMPLATES_DIR, templateName);

    this.logger.info(`Loading template: ${templateName}`);
    if (!fs.existsSync(templatePath)) {
      this.logger.warn(`Template ${templateName} not found, falling back to default.json`);
      const defaultPath = path.join(TEMPLATES_DIR, "default.json");
      if (!fs.existsSync(defaultPath)) {
        this.logger.error("No default template found.");
        return this._getBuiltinDefault();
      }
      return JSON.parse(fs.readFileSync(defaultPath, "utf8"));
    }

    return JSON.parse(fs.readFileSync(templatePath, "utf8"));
  }

  generateConfig(systemInfo, userChoices = {}) {
    this.logger.info("Generating configuration...");
    const template = this.loadTemplate(systemInfo.platform);

    const config = {
      ...template,
      system: {
        platform: systemInfo.platform,
        arch: systemInfo.arch,
        nodeVersion: systemInfo.nodeVersion,
        detectedAt: new Date().toISOString(),
      },
      workspace: {
        name: userChoices.workspaceName || "default",
        path: userChoices.workspacePath || path.join(systemInfo.homeDir, ".openclaw", "workspace"),
      },
      agent: {
        enabled: userChoices.agentEnabled !== undefined ? userChoices.agentEnabled : true,
        autostart: userChoices.autostart !== undefined ? userChoices.autostart : false,
        logLevel: userChoices.logLevel || "info",
      },
    };

    this.logger.info("Configuration generated successfully.");
    return config;
  }

  writeConfig(config, outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      this.logger.info(`Created directory: ${dir}`);
    }

    const content = JSON.stringify(config, null, 2) + "\n";
    fs.writeFileSync(outputPath, content, "utf8");
    this.logger.info(`Configuration written to: ${outputPath}`);
    return outputPath;
  }

  _resolveTemplateName(platform) {
    const map = {
      linux: "linux.json",
      macos: "default.json",
      windows: "windows.json",
    };
    return map[platform] || "default.json";
  }

  _getBuiltinDefault() {
    return {
      version: "1.0.0",
      environment: "default",
      settings: {
        autoUpdate: true,
        telemetry: false,
        shell: "auto",
      },
    };
  }
}

module.exports = { ConfigWizard };
