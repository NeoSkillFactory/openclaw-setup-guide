"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert");
const { Logger, LOG_LEVELS } = require("../logger");

describe("Logger", () => {
  it("should create a logger with default settings", () => {
    const logger = new Logger({ silent: true });
    assert.deepStrictEqual(logger.getEntries(), []);
    assert.strictEqual(logger.level, LOG_LEVELS.info);
  });

  it("should log messages at different levels", () => {
    const logger = new Logger({ silent: true });
    logger.debug("debug msg");
    logger.info("info msg");
    logger.warn("warn msg");
    logger.error("error msg");

    const entries = logger.getEntries();
    // debug is below default level (info), so it should be filtered
    assert.strictEqual(entries.length, 3);
    assert.strictEqual(entries[0].level, "info");
    assert.strictEqual(entries[1].level, "warn");
    assert.strictEqual(entries[2].level, "error");
  });

  it("should include debug when level is set to debug", () => {
    const logger = new Logger({ silent: true, level: "debug" });
    logger.debug("debug msg");
    logger.info("info msg");

    const entries = logger.getEntries();
    assert.strictEqual(entries.length, 2);
    assert.strictEqual(entries[0].level, "debug");
  });

  it("should return correct summary", () => {
    const logger = new Logger({ silent: true });
    logger.info("a");
    logger.info("b");
    logger.warn("c");
    logger.error("d");

    const summary = logger.getSummary();
    assert.strictEqual(summary.info, 2);
    assert.strictEqual(summary.warn, 1);
    assert.strictEqual(summary.error, 1);
    assert.strictEqual(summary.debug, 0);
  });

  it("should clear entries", () => {
    const logger = new Logger({ silent: true });
    logger.info("test");
    assert.strictEqual(logger.getEntries().length, 1);
    logger.clear();
    assert.strictEqual(logger.getEntries().length, 0);
  });
});
