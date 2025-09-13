// 🗂️ Marker Extractor - Extract files from marker content

import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../core/logger';
import {
  ExtractionOptions,
  ExtractionProgress,
  ExtractionResult,
  ExtractorConfig,
  FileConflict,
  FileInfo,
  MarkerMetadata,
  ParsedMarker,
  ParseResults
} from './types';

export class MarkerExtractor {
  private logger: Logger;
  private config: ExtractorConfig;

  // ASCII 28 (File Separator) character for invisible markers
  private readonly FS_CHAR = String.fromCharCode(28);

  constructor(config?: ExtractorConfig) {
    this.config = {
      defaultConflictResolution: 'skip',
      defaultCreateDirectories: true,
      defaultValidateChecksums: false,
      ...config
    };

    this.logger = new Logger('extractor');
  }

  /**
   * Extract files from marker content to target directory
   */
  async extract(
    markerContent: string,
    targetPath: string,
    options?: ExtractionOptions
  ): Promise<ExtractionResult> {
    this.logger.info(`Extracting markers to: ${targetPath}`);

    const opts: Required<ExtractionOptions> = {
      overwriteExisting: options?.overwriteExisting ?? false,
      preserveTimestamps: options?.preserveTimestamps ?? true,
      createDirectories: options?.createDirectories ?? this.config.defaultCreateDirectories ?? true,
      validateChecksums: options?.validateChecksums ?? this.config.defaultValidateChecksums ?? false,
      conflictResolution: options?.conflictResolution ?? this.config.defaultConflictResolution ?? 'skip',
      progressCallback: options?.progressCallback ?? (() => { }),
      conflictCallback: options?.conflictCallback ?? (() => 'skip'),
      dryRun: options?.dryRun ?? false
    };

    // Parse markers
    const parseResults = this.parseMarkers(markerContent);

    if (parseResults.errors.length > 0) {
      this.logger.warn(`Found ${parseResults.errors.length} parsing errors`);
    }

    const result: ExtractionResult = {
      filesExtracted: 0,
      filesSkipped: 0,
      extractedFiles: [],
      errors: [],
      success: true
    };

    // Process each marker
    for (let i = 0; i < parseResults.markers.length; i++) {
      const marker = parseResults.markers[i];

      // Report progress
      const progress: ExtractionProgress = {
        currentFile: marker.filename,
        filesExtracted: result.filesExtracted,
        totalFiles: parseResults.markers.length,
        percentage: Math.round((i / parseResults.markers.length) * 100)
      };
      opts.progressCallback(progress);

      try {
        const extracted = await this.extractSingleFile(marker, targetPath, opts);
        if (extracted) {
          result.filesExtracted++;
          result.extractedFiles.push(path.join(targetPath, marker.filename));
        } else {
          result.filesSkipped++;
        }
      } catch (error) {
        this.logger.error(`Error extracting ${marker.filename}`, error);
        result.errors.push(`Error extracting ${marker.filename}: ${error}`);
        result.success = false;
      }
    }

    // Final progress
    opts.progressCallback({
      currentFile: 'Complete',
      filesExtracted: result.filesExtracted,
      totalFiles: parseResults.markers.length,
      percentage: 100
    });

    this.logger.info(`Extraction complete: ${result.filesExtracted} files extracted, ${result.filesSkipped} skipped`);
    return result;
  }

  /**
   * Extract files from marker file
   */
  async extractFromFile(
    markerPath: string,
    targetPath: string,
    options?: ExtractionOptions
  ): Promise<ExtractionResult> {
    this.logger.info(`Reading marker file: ${markerPath}`);

    if (!fs.existsSync(markerPath)) {
      throw new Error(`Marker file does not exist: ${markerPath}`);
    }

    const markerContent = fs.readFileSync(markerPath, 'utf-8');
    return this.extract(markerContent, targetPath, options);
  }

  /**
   * Get list of files in marker content without extracting
   */
  async getFileList(markerContent: string): Promise<FileInfo[]> {
    const parseResults = this.parseMarkers(markerContent);

    return parseResults.markers.map(marker => ({
      path: marker.filename,
      size: Buffer.byteLength(marker.content, 'utf-8'),
      mtime: new Date(), // We don't have original mtime in basic markers
      type: path.extname(marker.filename),
      isBinary: false // Assume text since it's in marker
    }));
  }

  /**
   * Get metadata from marker content
   */
  async getMetadata(markerContent: string): Promise<MarkerMetadata | undefined> {
    const lines = markerContent.split('\n');

    // Look for PROJECT_INFO section
    const projectInfoStart = lines.findIndex(line =>
      line.includes(`//${this.FS_CHAR}/ PROJECT_INFO /${this.FS_CHAR}//`)
    );

    if (projectInfoStart === -1) {
      return undefined;
    }

    const metadata: Partial<MarkerMetadata> = {
      generatedAt: '',
      version: '',
      sourceFolder: '',
      totalFiles: 0
    };

    // Parse metadata lines
    for (let i = projectInfoStart + 1; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.includes(`//${this.FS_CHAR}/`)) {
        break; // Next marker section
      }

      if (line.startsWith('Project:')) {
        metadata.projectName = line.replace('Project:', '').trim();
      } else if (line.startsWith('Generated:')) {
        metadata.generatedAt = line.replace('Generated:', '').trim();
      } else if (line.startsWith('Total Files:')) {
        metadata.totalFiles = parseInt(line.replace('Total Files:', '').trim()) || 0;
      } else if (line.startsWith('Source:')) {
        metadata.sourceFolder = line.replace('Source:', '').trim();
      } else if (line.startsWith('Generator:')) {
        metadata.version = line.replace('Generator:', '').trim();
      }
    }

    return metadata as MarkerMetadata;
  }

  /**
   * Parse marker content into individual markers
   */
  private parseMarkers(content: string): ParseResults {
    const lines = content.split('\n');
    const markers: ParsedMarker[] = [];
    const errors: Array<{ line: number; message: string }> = [];

    // Detect FS char dynamically (fallback to default)
    // Detect config via frontmatter or fallback to FS autodetect
    const cfg = this.parseFrontmatter(lines);
    const detectedFS = this.detectFSChar(lines) || this.FS_CHAR;
    const markerRegex = cfg?.regex || this.buildMarkerRegex(detectedFS);

    let currentMarker: Partial<ParsedMarker> | null = null;
    let contentLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      const match = line.match(markerRegex);

      if (match) {
        // Save previous marker if exists
        if (currentMarker) {
          this.finalizeMarker(currentMarker, contentLines, markers, errors, lineNumber - 1);
        }

        // Start new marker
        const filename = match[1];
        if (!filename) {
          errors.push({ line: lineNumber, message: 'Empty filename in marker' });
          continue;
        }

        currentMarker = {
          filename,
          startLine: lineNumber
        };
        contentLines = [];
      } else if (currentMarker) {
        // Add to current marker content
        contentLines.push(line);
      }
    }

    // Finalize last marker
    if (currentMarker) {
      this.finalizeMarker(currentMarker, contentLines, markers, errors, lines.length);
    }

    const totalBytes = markers.reduce((sum, marker) => sum + Buffer.byteLength(marker.content, 'utf-8'), 0);

    return {
      totalMarkers: markers.length,
      totalFiles: markers.length,
      totalBytes,
      errors,
      markers
    };
  }

  /**
   * Finalize a marker being parsed
   */
  private finalizeMarker(
    marker: Partial<ParsedMarker>,
    contentLines: string[],
    markers: ParsedMarker[],
    errors: Array<{ line: number; message: string }>,
    endLine: number
  ): void {
    if (!marker.filename || !marker.startLine) {
      return;
    }

    // Remove metadata comments if present
    const cleanContent = contentLines
      .filter(line => !line.startsWith('// Size:') && !line.startsWith('// Modified:') && !line.startsWith('// Type:'))
      .join('\n');

    markers.push({
      filename: marker.filename,
      content: cleanContent,
      startLine: marker.startLine,
      endLine
    });
  }

  /**
   * Extract a single file
   */
  private async extractSingleFile(
    marker: ParsedMarker,
    targetPath: string,
    options: Required<ExtractionOptions>
  ): Promise<boolean> {
    const outputPath = path.join(targetPath, marker.filename);

    // Check for conflicts
    if (fs.existsSync(outputPath) && !options.overwriteExisting) {
      const conflict: FileConflict = {
        filePath: outputPath,
        reason: 'File already exists'
      };

      const resolution = options.conflictCallback(conflict);

      if (resolution === 'skip') {
        this.logger.info(`Skipping existing file: ${outputPath}`);
        return false;
      } else if (resolution === 'backup') {
        const backupPath = `${outputPath}.backup`;
        fs.copyFileSync(outputPath, backupPath);
        this.logger.info(`Created backup: ${backupPath}`);
      }
      // 'overwrite' continues with extraction
    }

    if (options.dryRun) {
      this.logger.info(`[DRY RUN] Would extract: ${outputPath}`);
      return true;
    }

    // Create directory if needed
    if (options.createDirectories) {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.logger.debug(`Created directory: ${dir}`);
      }
    }

    // Write file
    fs.writeFileSync(outputPath, marker.content, 'utf-8');
    this.logger.debug(`Extracted: ${outputPath} (${marker.content.length} chars)`);

    return true;
  }

  private detectFSChar(lines: string[]): string | null {
    // Match any control char (0x00-0x1F) as FS and require same char on both sides using a backreference
    const generic = /^\/\/([\x00-\x1F])\/ (.+?) \/\1\/\/$/;
    for (const line of lines) {
      const m = line.match(generic);
      if (m) {
        return m[1];
      }
    }
    return null;
  }

  private buildMarkerRegex(fsChar: string): RegExp {
    const esc = fsChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^\\/\\/${esc}\\/ (.+?) \\/${esc}\\/\\/$`);
  }

  private parseFrontmatter(lines: string[]): { regex: RegExp } | null {
    if (lines.length < 3) return null;
    if (lines[0].trim() !== '---') return null;
    let i = 1;
    const meta: any = {};
    for (; i < lines.length; i++) {
      const ln = lines[i];
      if (ln.trim() === '---') { i++; break; }
      if (ln.trim() === 'lookatni:') continue;
      const m = ln.match(/^\s{2}([a-zA-Z_]+):\s*(.*)$/);
      if (m) { meta[m[1]] = m[2]; }
    }
    if (meta.pattern && String(meta.pattern).includes('{filename}')) {
      const patt = String(meta.pattern).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\{filename\}/g, '(.+?)');
      return { regex: new RegExp(`^${patt}$`) };
    }
    if (meta.start && meta.end) {
      const s = String(meta.start).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const e = String(meta.end).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return { regex: new RegExp(`^${s} (.+?) ${e}$`) };
    }
    return null;
  }
}
