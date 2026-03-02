"use strict";

const path = require("path");
const { Logger } = require("./logger");
const { SystemDetector } = require("./system-detector");
const { ConfigWizard } = require("./config-wizard");
const { Validator } = require("./validator");

class SetupAssistant {
  constructor(options = {}) {
    this.logger = options.logger || new Logger({ silent: options.silent });
    this.detector = new SystemDetector(this.logger);
    this.wizard = new ConfigWizard(this.logger);
    this.validator = new Validator(this.logger);
    this.outputPath = options.outputPath || null;
    this.userChoices = options.userChoices || {};
  }

  run() {
    this.logger.info("OpenClaw Setup Assistant started.");

    // Step 1: Detect system
    const systemInfo = this.detector.detect();

    // Step 2: Validate system requirements
    const sysValidation = this.validator.validateSystemRequirements(systemInfo);
    if (!sysValidation.valid) {
      this.logger.error("System requirements not met. Please install missing dependencies.");
      return {
        success: false,
        stage: "system-check",
        systemInfo,
        validation: sysValidation,
      };
    }

    // Step 3: Generate configuration
    const config = this.wizard.generateConfig(systemInfo, this.userChoices);

    // Step 4: Validate generated configuration
    const configValidation = this.validator.validateConfig(config);
    if (!configValidation.valid) {
      this.logger.error("Generated configuration is invalid.");
      return {
        success: false,
        stage: "config-validation",
        systemInfo,
        config,
        validation: configValidation,
      };
    }

    // Step 5: Write config file
    const outputPath = this.outputPath || path.join(
      systemInfo.homeDir,
      ".openclaw",
      "config.json"
    );

    let writtenPath = null;
    try {
      writtenPath = this.wizard.writeConfig(config, outputPath);
    } catch (err) {
      this.logger.error(`Failed to write config: ${err.message}`);
      return {
        success: false,
        stage: "config-write",
        systemInfo,
        config,
        error: err.message,
      };
    }

    // Step 6: Final validation of written file
    const fileValidation = this.validator.validateConfigFile(writtenPath);

    // Step 7: Generate report
    const report = this.validator.formatReport({
      "System Requirements": sysValidation,
      "Configuration": configValidation,
      "Written File": fileValidation,
    });

    this.logger.info("Setup completed successfully.");
    this.logger.info(`Config written to: ${writtenPath}`);

    return {
      success: fileValidation.valid,
      stage: "complete",
      systemInfo,
      config,
      configPath: writtenPath,
      report,
      logSummary: this.logger.getSummary(),
    };
  }

  detectOnly() {
    this.logger.info("Running system detection only...");
    const systemInfo = this.detector.detect();
    const sysValidation = this.validator.validateSystemRequirements(systemInfo);
    return { systemInfo, validation: sysValidation };
  }

  validateOnly(configPath) {
    this.logger.info(`Validating existing config: ${configPath}`);
    const result = this.validator.validateConfigFile(configPath);
    const report = this.validator.formatReport({ "Configuration File": result });
    return { validation: result, report };
  }
}

module.exports = { SetupAssistant };
