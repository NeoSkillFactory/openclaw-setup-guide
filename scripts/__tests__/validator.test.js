"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { Logger } = require("../logger");
const { Validator } = require("../validator");

describe("Validator", () => {
  it("should validate a correct config", () => {
    const logger = new Logger({ silent: true });
    const validator = new Validator(logger);
    const config = {
      system: { platform: "linux", arch: "x64" },
      workspace: { name: "default", path: "/tmp/ws" },
      agent: { enabled: true, autostart: false, logLevel: "info" },
    };

    const result = validator.validateConfig(config);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.issues.length, 0);
  });

  it("should fail for null config", () => {
    const logger = new Logger({ silent: true });
    const validator = new Validator(logger);
    const result = validator.validateConfig(null);
    assert.strictEqual(result.valid, false);
    assert.ok(result.issues.length > 0);
  });

  it("should flag missing sections", () => {
    const logger = new Logger({ silent: true });
    const validator = new Validator(logger);
    const result = validator.validateConfig({});
    assert.strictEqual(result.valid, false);
    assert.ok(result.issues.some((i) => i.field === "system"));
    assert.ok(result.issues.some((i) => i.field === "workspace"));
    assert.ok(result.issues.some((i) => i.field === "agent"));
  });

  it("should warn on unknown platform", () => {
    const logger = new Logger({ silent: true });
    const validator = new Validator(logger);
    const config = {
      system: { platform: "solaris" },
      workspace: { name: "default", path: "/tmp/ws" },
      agent: { enabled: true, logLevel: "info" },
    };

    const result = validator.validateConfig(config);
    assert.strictEqual(result.valid, true);
    assert.ok(result.issues.some((i) => i.severity === "warn" && i.field === "system.platform"));
  });

  it("should validate system requirements", () => {
    const logger = new Logger({ silent: true });
    const validator = new Validator(logger);
    const result = validator.validateSystemRequirements({
      nodeVersion: "v20.0.0",
      npmVersion: "9.0.0",
      gitVersion: "2.40.0",
      memory: { totalMB: 8192, freeMB: 4096 },
    });
    assert.strictEqual(result.valid, true);
  });

  it("should fail if node is missing", () => {
    const logger = new Logger({ silent: true });
    const validator = new Validator(logger);
    const result = validator.validateSystemRequirements({
      nodeVersion: null,
      npmVersion: null,
      gitVersion: null,
      memory: { totalMB: 8192, freeMB: 4096 },
    });
    assert.strictEqual(result.valid, false);
  });

  it("should validate a config file", () => {
    const logger = new Logger({ silent: true });
    const validator = new Validator(logger);
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "openclaw-test-"));
    const filePath = path.join(tmpDir, "config.json");

    const config = {
      system: { platform: "linux" },
      workspace: { name: "test", path: "/tmp/ws" },
      agent: { enabled: true, logLevel: "info" },
    };
    fs.writeFileSync(filePath, JSON.stringify(config));

    const result = validator.validateConfigFile(filePath);
    assert.strictEqual(result.valid, true);

    fs.rmSync(tmpDir, { recursive: true });
  });

  it("should fail for missing file", () => {
    const logger = new Logger({ silent: true });
    const validator = new Validator(logger);
    const result = validator.validateConfigFile("/nonexistent/path.json");
    assert.strictEqual(result.valid, false);
  });

  it("should format a report", () => {
    const logger = new Logger({ silent: true });
    const validator = new Validator(logger);
    const report = validator.formatReport({
      "Test Section": { valid: true, issues: [] },
    });
    assert.ok(report.includes("PASS"));
    assert.ok(report.includes("Test Section"));
  });
});
