'use strict';

// Thin re-export layer to provide ergonomic Node.js imports via
// `import { parseMarkers, generateMarkers, validateMarkers } from "lookatni-file-markers/lib"`.
// This package depends on `lookatni-core` and simply forwards its API.

const core = require('lookatni-core');

module.exports = {
  // Classes
  MarkerExtractor: core.MarkerExtractor,
  MarkerGenerator: core.MarkerGenerator,
  MarkerValidator: core.MarkerValidator,

  // Factories
  createExtractor: core.createExtractor,
  createGenerator: core.createGenerator,
  createValidator: core.createValidator,

  // Helpers
  parseMarkers: core.parseMarkers,
  parseMarkersFromFile: core.parseMarkersFromFile,
  generateMarkers: core.generateMarkers,
  validateMarkers: core.validateMarkers,
  validateMarkerFile: core.validateMarkerFile,

  // Utilities
  Logger: core.Logger,
  FileScanner: core.FileScanner,

  // Types are available via lookatni-core typings
};

