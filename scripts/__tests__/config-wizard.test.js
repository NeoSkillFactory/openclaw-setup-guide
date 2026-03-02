"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { Logger } = require("../logger");
const { ConfigWizard } = require("../config-wizard");

describe("ConfigWizard", () => {
  it("should load a template for linux", () => {
    const logger = new Logger({ silent: true });
    const wizard = new ConfigWizard(logger);
    const template = wizard.loadTemplate("linux");

    assert.ok(template);
    assert.strictEqual(template.environment, "linux");
    assert.strictEqual(template.version, "1.0.0");
  });

  it("should load default template for unknown platform", () => {
    const logger = new Logger({ silent: true });
    const wizard = new ConfigWizard(logger);
    const template = wizard.loadTemplate("freebsd");

    assert.ok(template);
    assert.strictEqual(template.version, "1.0.0");
  });

  it("should generate a config with system info", () => {
    const logger = new Logger({ silent: true });
    const wizard = new ConfigWizard(logger);
    const systemInfo = {
      platform: "linux",
      arch: "x64",
      nodeVersion: "v20.0.0",
      homeDir: os.homedir(),
    };
    const config = wizard.generateConfig(systemInfo, { workspaceName: "test-ws" });

    assert.ok(config.system);
    assert.strictEqual(config.system.platform, "linux");
    assert.strictEqual(config.workspace.name, "test-ws");
    assert.strictEqual(config.agent.enabled, true);
    assert.strictEqual(config.agent.logLevel, "info");
  });

  it("should write config to file and read it back", () => {
    const logger = new Logger({ silent: true });
    const wizard = new ConfigWizard(logger);
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-test-"));
    const outPath = path.join(tmpDir, "config.json");

    const config = { test: true, version: "1.0.0" };
    wizard.writeConfig(config, outPath);

    assert.ok(fs.existsSync(outPath));
    const read = JSON.parse(fs.readFileSync(outPath, "utf8"));
    assert.deepStrictEqual(read, config);

    // Cleanup
    fs.rmSync(tmpDir, { recursive: true });
  });
});
