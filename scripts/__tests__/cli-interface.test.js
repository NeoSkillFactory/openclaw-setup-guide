"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert");
const { parseArgs } = require("../cli-interface");

describe("CLI parseArgs", () => {
  it("should parse --non-interactive", () => {
    const args = parseArgs(["node", "cli.js", "--non-interactive"]);
    assert.strictEqual(args.nonInteractive, true);
  });

  it("should parse --detect-only", () => {
    const args = parseArgs(["node", "cli.js", "--detect-only"]);
    assert.strictEqual(args.detectOnly, true);
  });

  it("should parse --validate-only with path", () => {
    const args = parseArgs(["node", "cli.js", "--validate-only", "/tmp/config.json"]);
    assert.strictEqual(args.validateOnly, true);
    assert.strictEqual(args.configPath, "/tmp/config.json");
  });

  it("should parse --validate-only without path", () => {
    const args = parseArgs(["node", "cli.js", "--validate-only"]);
    assert.strictEqual(args.validateOnly, true);
    assert.strictEqual(args.configPath, null);
  });

  it("should parse --output with path", () => {
    const args = parseArgs(["node", "cli.js", "--output", "/tmp/out.json"]);
    assert.strictEqual(args.outputPath, "/tmp/out.json");
  });

  it("should parse --silent", () => {
    const args = parseArgs(["node", "cli.js", "--silent"]);
    assert.strictEqual(args.silent, true);
  });

  it("should parse --help", () => {
    const args = parseArgs(["node", "cli.js", "--help"]);
    assert.strictEqual(args.help, true);
  });

  it("should parse -h", () => {
    const args = parseArgs(["node", "cli.js", "-h"]);
    assert.strictEqual(args.help, true);
  });

  it("should return defaults for no args", () => {
    const args = parseArgs(["node", "cli.js"]);
    assert.strictEqual(args.nonInteractive, false);
    assert.strictEqual(args.validateOnly, false);
    assert.strictEqual(args.detectOnly, false);
    assert.strictEqual(args.outputPath, null);
    assert.strictEqual(args.silent, false);
    assert.strictEqual(args.help, false);
  });
});
