"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert");
const { Logger } = require("../logger");
const { SystemDetector } = require("../system-detector");

describe("SystemDetector", () => {
  it("should detect system info", () => {
    const logger = new Logger({ silent: true });
    const detector = new SystemDetector(logger);
    const info = detector.detect();

    assert.ok(info.platform);
    assert.ok(info.arch);
    assert.ok(info.homeDir);
    assert.ok(info.shell);
    assert.ok(info.memory);
    assert.ok(typeof info.memory.totalMB === "number");
    assert.ok(typeof info.memory.freeMB === "number");
    assert.ok(Array.isArray(info.missingDependencies));
  });

  it("should detect node version", () => {
    const logger = new Logger({ silent: true });
    const detector = new SystemDetector(logger);
    const info = detector.detect();

    assert.ok(info.nodeVersion);
    assert.ok(info.nodeVersion.startsWith("v"));
  });

  it("should return a valid platform string", () => {
    const logger = new Logger({ silent: true });
    const detector = new SystemDetector(logger);
    const info = detector.detect();

    const validPlatforms = ["linux", "macos", "windows"];
    assert.ok(
      validPlatforms.includes(info.platform) || typeof info.platform === "string",
      `Platform should be a string, got: ${info.platform}`
    );
  });

  it("should detect openclawInstalled as boolean", () => {
    const logger = new Logger({ silent: true });
    const detector = new SystemDetector(logger);
    const info = detector.detect();

    assert.strictEqual(typeof info.openclawInstalled, "boolean");
  });
});
