"use strict";

const os = require("os");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class SystemDetector {
  constructor(logger) {
    this.logger = logger;
  }

  detect() {
    this.logger.info("Detecting system environment...");
    const info = {
      platform: this._detectPlatform(),
      arch: os.arch(),
      nodeVersion: this._detectNodeVersion(),
      npmVersion: this._detectNpmVersion(),
      gitVersion: this._detectGitVersion(),
      homeDir: os.homedir(),
      shell: this._detectShell(),
      memory: this._detectMemory(),
      openclawInstalled: this._detectOpenClaw(),
      missingDependencies: [],
    };

    info.missingDependencies = this._checkDependencies(info);
    this.logger.info(`Platform: ${info.platform} (${info.arch})`);
    this.logger.info(`Node: ${info.nodeVersion || "NOT FOUND"}`);
    this.logger.info(`npm: ${info.npmVersion || "NOT FOUND"}`);
    this.logger.info(`Git: ${info.gitVersion || "NOT FOUND"}`);
    this.logger.info(`Shell: ${info.shell}`);
    this.logger.info(`OpenClaw installed: ${info.openclawInstalled ? "yes" : "no"}`);

    if (info.missingDependencies.length > 0) {
      this.logger.warn(`Missing dependencies: ${info.missingDependencies.join(", ")}`);
    } else {
      this.logger.info("All required dependencies found.");
    }

    return info;
  }

  _detectPlatform() {
    const p = os.platform();
    const map = { linux: "linux", darwin: "macos", win32: "windows" };
    return map[p] || p;
  }

  _detectNodeVersion() {
    try {
      return execSync("node --version", { encoding: "utf8" }).trim();
    } catch {
      return null;
    }
  }

  _detectNpmVersion() {
    try {
      return execSync("npm --version", { encoding: "utf8" }).trim();
    } catch {
      return null;
    }
  }

  _detectGitVersion() {
    try {
      const raw = execSync("git --version", { encoding: "utf8" }).trim();
      const match = raw.match(/(\d+\.\d+[\.\d]*)/);
      return match ? match[1] : raw;
    } catch {
      return null;
    }
  }

  _detectShell() {
    return process.env.SHELL || process.env.COMSPEC || "unknown";
  }

  _detectMemory() {
    const totalMB = Math.round(os.totalmem() / 1024 / 1024);
    const freeMB = Math.round(os.freemem() / 1024 / 1024);
    return { totalMB, freeMB };
  }

  _detectOpenClaw() {
    // Check for .openclaw directory in home or current path
    const homeDir = os.homedir();
    const candidates = [
      path.join(homeDir, ".openclaw"),
      path.join(homeDir, ".clawhub"),
      path.join(process.cwd(), ".openclaw"),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return true;
      }
    }
    // Check for openclaw binary in PATH
    try {
      execSync("which openclaw 2>/dev/null || where openclaw 2>nul", {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      return true;
    } catch {
      return false;
    }
  }

  _checkDependencies(info) {
    const missing = [];
    if (!info.nodeVersion) missing.push("node");
    if (!info.npmVersion) missing.push("npm");
    if (!info.gitVersion) missing.push("git");
    return missing;
  }
}

module.exports = { SystemDetector };
