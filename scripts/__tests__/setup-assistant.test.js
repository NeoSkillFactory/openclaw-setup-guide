"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { Logger } = require("../logger");
const { SetupAssistant } = require("../setup-assistant");

describe("SetupAssistant", () => {
  it("should run full setup successfully", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-test-"));
    const outPath = path.join(tmpDir, "config.json");

    const assistant = new SetupAssistant({
      silent: true,
      outputPath: outPath,
      logger: new Logger({ silent: true }),
    });

    const result = assistant.run();
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.stage, "complete");
    assert.ok(fs.existsSync(outPath));
    assert.ok(result.report);
    assert.ok(result.configPath);

    // Verify written file is valid JSON
    const config = JSON.parse(fs.readFileSync(outPath, "utf8"));
    assert.ok(config.system);
    assert.ok(config.workspace);
    assert.ok(config.agent);

    fs.rmSync(tmpDir, { recursive: true });
  });

  it("should detect only", () => {
    const assistant = new SetupAssistant({
      silent: true,
      logger: new Logger({ silent: true }),
    });

    const result = assistant.detectOnly();
    assert.ok(result.systemInfo);
    assert.ok(result.validation);
    assert.ok(result.systemInfo.platform);
  });

  it("should validate only with missing file", () => {
    const assistant = new SetupAssistant({
      silent: true,
      logger: new Logger({ silent: true }),
    });

    const result = assistant.validateOnly("/nonexistent/config.json");
    assert.strictEqual(result.validation.valid, false);
    assert.ok(result.report);
  });

  it("should validate only with valid file", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-test-"));
    const filePath = path.join(tmpDir, "config.json");
    const config = {
      system: { platform: "linux" },
      workspace: { name: "test", path: "/tmp/ws" },
      agent: { enabled: true, logLevel: "info" },
    };
    fs.writeFileSync(filePath, JSON.stringify(config));

    const assistant = new SetupAssistant({
      silent: true,
      logger: new Logger({ silent: true }),
    });

    const result = assistant.validateOnly(filePath);
    assert.strictEqual(result.validation.valid, true);

    fs.rmSync(tmpDir, { recursive: true });
  });

  it("should accept user choices", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-test-"));
    const outPath = path.join(tmpDir, "config.json");

    const assistant = new SetupAssistant({
      silent: true,
      outputPath: outPath,
      logger: new Logger({ silent: true }),
      userChoices: {
        workspaceName: "my-project",
        agentEnabled: false,
        logLevel: "debug",
      },
    });

    const result = assistant.run();
    assert.strictEqual(result.success, true);

    const config = JSON.parse(fs.readFileSync(outPath, "utf8"));
    assert.strictEqual(config.workspace.name, "my-project");
    assert.strictEqual(config.agent.enabled, false);
    assert.strictEqual(config.agent.logLevel, "debug");

    fs.rmSync(tmpDir, { recursive: true });
  });
});
