const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
];

// Configure resolver to handle package exports and .mjs files
config.resolver.unstable_enablePackageExports = true;
config.resolver.sourceExts = [
  "expo.tsx",
  "expo.ts",
  "expo.js",
  "expo.jsx",
  "tsx",
  "ts",
  "jsx",
  "js",
  "mjs",
  "json",
  "wasm",
];

module.exports = config;
