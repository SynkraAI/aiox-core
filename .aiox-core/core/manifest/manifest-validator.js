/**
 * Manifest Validator
 *
 * Validates manifest CSV files for integrity, schema compliance,
 * and file existence checks.
 *
 * @module manifest-validator
 * @version 1.0.0
 * @story 2.13 - Manifest System
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Parse CSV content into rows
 * Handles quoted values that may contain newlines
 * @param {string} content - CSV content
 * @returns {object} Parsed CSV with header and rows
 */
function parseCSV(content) {
  const records = parseCSVContent(content);
  if (records.length === 0) {
    return { header: [], rows: [] };
  }

  const header = records[0];
  const rows = records.slice(1).map((values, index) => {
    const row = {};
    header.forEach((col, i) => {
      row[col] = values[i] || '';
    });
    row._lineNumber = index + 2; // 1-based, accounting for header
    return row;
  });

  return { header, rows };
}

/**
 * Parse entire CSV content handling multi-line quoted values
 * @param {string} content - CSV content
 * @returns {string[][]} Array of records (each record is array of values)
 */
function parseCSVContent(content) {
  const records = [];
  let currentRecord = [];
  let currentValue = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentValue += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      currentRecord.push(currentValue);
      currentValue = '';
    } else if (char === '\n' && !inQuotes) {
      // End of record
      currentRecord.push(currentValue);
      if (currentRecord.some(v => v !== '')) {
        records.push(currentRecord);
      }
      currentRecord = [];
      currentValue = '';
    } else if (char === '\r') {
      // Skip carriage return
      continue;
    } else {
      currentValue += char;
    }
  }

  // Don't forget the last field and record
  if (currentValue !== '' || currentRecord.length > 0) {
    currentRecord.push(currentValue);
    if (currentRecord.some(v => v !== '')) {
      records.push(currentRecord);
    }
  }

  return records;
}

/**
 * Parse a single CSV line handling quoted values
 * @param {string} line - CSV line
 * @returns {string[]} Array of values
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

/**
 * Manifest Validator class
 */
class ManifestValidator {
  constructor(options = {}) {
    this.basePath = options.basePath || process.cwd();
    this.aioxCoreDir = path.join(this.basePath, '.aiox-core');
    this.manifestDir = path.join(this.aioxCoreDir, 'manifests');
    this.verbose = options.verbose || false;
  }

  /**
   * Validate all manifests
   * @returns {Promise<object>} Validation results
   */
  async validateAll() {
    const results = {
      agents: null,
      workers: null,
      tasks: null,
      summary: {
        totalManifests: 3,
        valid: 0,
        invalid: 0,
        missing: [],
        orphan: [],
      },
    };

    try {
      // Validate all manifests in parallel
      const [agents, workers, tasks] = await Promise.all([
        this.validateManifest('agents.csv', this.getAgentsSchema()),
        this.validateManifest('workers.csv', this.getWorkersSchema()),
        this.validateManifest('tasks.csv', this.getTasksSchema()),
      ]);

      results.agents = agents;
      results.workers = workers;
      results.tasks = tasks;

      // Build summary
      [agents, workers, tasks].forEach(r => {
        if (r.valid) results.summary.valid++;
        else results.summary.invalid++;
        results.summary.missing.push(...r.missingFiles);
        results.summary.orphan.push(...r.orphanFiles);
      });

    } catch (error) {
      results.error = error.message;
    }

    return results;
  }

  /**
   * Validate a single manifest file
   * @param {string} filename - Manifest filename
   * @param {object} schema - Schema definition
   * @returns {Promise<object>} Validation result
   */
  async validateManifest(filename, schema) {
    const filePath = path.join(this.manifestDir, filename);
    const result = {
      filename,
      path: filePath,
      valid: true,
      errors: [],
      warnings: [],
      rowCount: 0,
      missingFiles: [],
      orphanFiles: [],
    };

    try {
      // Check file exists
      try {
        await fs.access(filePath);
      } catch {
        result.valid = false;
        result.errors.push(`Manifest file not found: ${filename}`);
        return result;
      }

      // Read and parse CSV
      const content = await fs.readFile(filePath, 'utf8');
      const { header, rows } = parseCSV(content);

      result.rowCount = rows.length;

      // Validate header
      const headerErrors = this.validateHeader(header, schema);
      if (headerErrors.length > 0) {
        result.valid = false;
        result.errors.push(...headerErrors);
        return result;
      }

      // Validate rows
      const idsSeen = new Set();
      for (const row of rows) {
        // Check for duplicate IDs
        if (row.id) {
          if (idsSeen.has(row.id)) {
            result.errors.push(`Duplicate ID '${row.id}' at line ${row._lineNumber}`);
            result.valid = false;
          }
          idsSeen.add(row.id);
        }

        // Validate required fields
        for (const col of schema.required) {
          if (!row[col] || row[col].trim() === '') {
            result.errors.push(`Missing required field '${col}' at line ${row._lineNumber}`);
            result.valid = false;
          }
        }

        // Validate status
        if (row.status && !['active', 'deprecated', 'experimental'].includes(row.status)) {
          result.warnings.push(`Invalid status '${row.status}' at line ${row._lineNumber}`);
        }

        // Check file existence
        if (row.file_path) {
          const fullPath = path.join(this.basePath, row.file_path);
          try {
            await fs.access(fullPath);
          } catch {
            result.missingFiles.push({
              id: row.id,
              path: row.file_path,
              line: row._lineNumber,
            });
            result.valid = false; // Missing files invalidate the manifest
          }
        }
      }

      // Check for orphan files (files on disk not in manifest)
      await this.checkOrphanFiles(result, schema);

    } catch (error) {
      result.valid = false;
      result.errors.push(`Error validating ${filename}: ${error.message}`);
    }

    return result;
  }

  /**
   * Validate CSV header against schema
   * @param {string[]} header - CSV header columns
   * @param {object} schema - Schema definition
   * @returns {string[]} Array of error messages
   */
  validateHeader(header, schema) {
    const errors = [];

    // Check all required columns exist
    for (const col of schema.required) {
      if (!header.includes(col)) {
        errors.push(`Missing required column: ${col}`);
      }
    }

    return errors;
  }

  /**
   * Check for orphan files not in manifest
   * @param {object} result - Validation result to update
   * @param {object} schema - Schema with sourceDir
   */
  async checkOrphanFiles(result, schema) {
    if (!schema.sourceDir) return;

    const sourceDir = path.join(this.basePath, schema.sourceDir);

    try {
      const files = await fs.readdir(sourceDir);
      const csvContent = await fs.readFile(result.path, 'utf8');

      for (const file of files) {
        if (!file.endsWith('.md')) continue;

        const relPath = `${schema.sourceDir}/${file}`;
        if (!csvContent.includes(relPath)) {
          result.orphanFiles.push({
            path: relPath,
            file,
          });
        }
      }
    } catch (_error) {
      // Directory doesn't exist or other error - skip orphan check
    }
  }

  /**
   * Get agents.csv schema
   * @returns {object} Schema definition
   */
  getAgentsSchema() {
    return {
      required: ['id', 'name', 'version', 'status', 'file_path'],
      optional: ['archetype', 'icon', 'when_to_use'],
      sourceDir: '.aiox-core/development/agents',
    };
  }

  /**
   * Get workers.csv schema
   * @returns {object} Schema definition
   */
  getWorkersSchema() {
    return {
      required: ['id', 'name', 'category', 'file_path', 'status'],
      optional: ['subcategory', 'executor_types', 'tags'],
      sourceDir: null, // Workers come from registry
    };
  }

  /**
   * Get tasks.csv schema
   * @returns {object} Schema definition
   */
  getTasksSchema() {
    return {
      required: ['id', 'name', 'category', 'file_path', 'status'],
      optional: ['format', 'has_elicitation'],
      sourceDir: '.aiox-core/development/tasks',
    };
  }

  /**
   * Format validation results for CLI output
   * @param {object} results - Validation results
   * @returns {string} Formatted output
   */
  formatResults(results) {
    const lines = [];

    for (const [type, result] of Object.entries(results)) {
      if (type === 'summary' || type === 'error') continue;

      const status = result.valid ? '✓' : '✗';
      const errorInfo = result.errors.length > 0 ? `, ${result.errors.length} errors` : '';
      lines.push(`${status} ${result.filename}: ${result.rowCount} entries${errorInfo}`);

      if (this.verbose) {
        for (const error of result.errors) {
          lines.push(`  ✗ ${error}`);
        }
        for (const warning of result.warnings) {
          lines.push(`  ⚠ ${warning}`);
        }
        for (const missing of result.missingFiles) {
          lines.push(`  ✗ Missing file: ${missing.path} (ID: ${missing.id})`);
        }
        for (const orphan of result.orphanFiles) {
          lines.push(`  ⚠ Orphan file: ${orphan.path}`);
        }
      }
    }

    const _totalValid = results.summary.valid;
    const totalInvalid = results.summary.invalid;
    const allValid = totalInvalid === 0;

    lines.push('');
    if (allValid) {
      lines.push('✅ All manifests valid!');
    } else {
      lines.push(`❌ Validation failed: ${totalInvalid} manifest(s) with errors`);
    }

    if (results.summary.missing.length > 0) {
      lines.push(`⚠  ${results.summary.missing.length} missing file(s) detected`);
    }

    if (results.summary.orphan.length > 0) {
      lines.push(`⚠  ${results.summary.orphan.length} orphan file(s) detected`);
    }

    return lines.join('\n');
  }
}

// Factory function
function createManifestValidator(options = {}) {
  return new ManifestValidator(options);
}

module.exports = {
  ManifestValidator,
  createManifestValidator,
  parseCSV,
  parseCSVLine,
  parseCSVContent,
};
