"use strict";

const fs = require("fs");
const path = require("path");

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

class Logger {
  constructor(options = {}) {
    this.level = LOG_LEVELS[options.level] ?? LOG_LEVELS.info;
    this.entries = [];
    this.logFile = options.logFile || null;
    this.silent = options.silent || false;
  }

  _format(level, message) {
    const ts = new Date().toISOString();
    return `[${ts}] [${level.toUpperCase()}] ${message}`;
  }

  _write(level, message) {
    if (LOG_LEVELS[level] < this.level) return;
    const line = this._format(level, message);
    this.entries.push({ level, message, timestamp: new Date().toISOString() });
    if (!this.silent) {
      if (level === "error") {
        process.stderr.write(line + "\n");
      } else {
        process.stdout.write(line + "\n");
      }
    }
    if (this.logFile) {
      try {
        fs.appendFileSync(this.logFile, line + "\n");
      } catch {
        // Ignore write errors to log file
      }
    }
  }

  debug(msg) { this._write("debug", msg); }
  info(msg) { this._write("info", msg); }
  warn(msg) { this._write("warn", msg); }
  error(msg) { this._write("error", msg); }

  getEntries() {
    return [...this.entries];
  }

  getSummary() {
    const counts = { debug: 0, info: 0, warn: 0, error: 0 };
    for (const entry of this.entries) {
      counts[entry.level]++;
    }
    return counts;
  }

  clear() {
    this.entries = [];
  }
}

module.exports = { Logger, LOG_LEVELS };
