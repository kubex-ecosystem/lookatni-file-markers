# 💾 Backup and Restore Workflows

Learn how to implement comprehensive backup and restore strategies using LookAtni File Markers for project preservation and disaster recovery.

## 🎯 Overview

LookAtni File Markers provides an excellent foundation for backup and restore workflows by creating portable, self-contained representations of your projects. This guide covers various backup strategies and recovery scenarios.

## 🔄 Basic Backup Workflow

### Simple Project Backup

```typescript
// backup-script.ts
import { MarkerGenerator } from '../src/utils/markerGenerator';
import { ConfigManager } from '../src/utils/configManager';
import * as fs from 'fs';
import * as path from 'path';

interface BackupConfig {
    projectPath: string;
    backupDir: string;
    compressionLevel: number;
    includeMetadata: boolean;
    timestampFormat: string;
}

class ProjectBackup {
    private config: BackupConfig;
    private generator: MarkerGenerator;

    constructor(config: BackupConfig) {
        this.config = config;
        this.generator = new MarkerGenerator();
    }

    async createBackup(): Promise<string> {
        const timestamp = this.formatTimestamp(new Date());
        const projectName = path.basename(this.config.projectPath);
        const backupFileName = `${projectName}_backup_${timestamp}.lookatni`;
        const backupPath = path.join(this.config.backupDir, backupFileName);

        console.log(`Creating backup: ${backupPath}`);

        const markerContent = await this.generator.generate(
            this.config.projectPath,
            {
                includeMetadata: this.config.includeMetadata,
                compressionLevel: this.config.compressionLevel,
                excludePatterns: [
                    'node_modules/**',
                    '.git/**',
                    'dist/**',
                    '*.log'
                ]
            }
        );

        await fs.promises.writeFile(backupPath, markerContent, 'utf8');
        
        console.log(`Backup created successfully: ${backupPath}`);
        return backupPath;
    }

    private formatTimestamp(date: Date): string {
        return date.toISOString()
            .replace(/:/g, '-')
            .replace(/\./g, '-')
            .slice(0, 19);
    }
}

// Usage
async function main() {
    const backup = new ProjectBackup({
        projectPath: '/path/to/your/project',
        backupDir: '/path/to/backups',
        compressionLevel: 2,
        includeMetadata: true,
        timestampFormat: 'ISO'
    });

    try {
        await backup.createBackup();
    } catch (error) {
        console.error('Backup failed:', error);
    }
}

main();
```

### Automated Daily Backups

```typescript
// automated-backup.ts
import { CronJob } from 'cron';
import { ProjectBackup } from './backup-script';
import { EmailNotifier } from './email-notifier';

class AutomatedBackupService {
    private backupJobs: Map<string, CronJob> = new Map();
    private notifier: EmailNotifier;

    constructor() {
        this.notifier = new EmailNotifier();
    }

    scheduleBackup(
        projectId: string,
        config: BackupConfig,
        schedule: string = '0 2 * * *' // Daily at 2 AM
    ): void {
        const job = new CronJob(schedule, async () => {
            try {
                const backup = new ProjectBackup(config);
                const backupPath = await backup.createBackup();
                
                await this.notifier.sendSuccess(projectId, backupPath);
                await this.cleanupOldBackups(config.backupDir, 30); // Keep 30 days
            } catch (error) {
                await this.notifier.sendFailure(projectId, error);
            }
        });

        this.backupJobs.set(projectId, job);
        job.start();
        
        console.log(`Scheduled backup for ${projectId}: ${schedule}`);
    }

    async cleanupOldBackups(backupDir: string, keepDays: number): Promise<void> {
        const files = await fs.promises.readdir(backupDir);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - keepDays);

        for (const file of files) {
            if (!file.endsWith('.lookatni')) continue;

            const filePath = path.join(backupDir, file);
            const stats = await fs.promises.stat(filePath);

            if (stats.mtime < cutoffDate) {
                await fs.promises.unlink(filePath);
                console.log(`Deleted old backup: ${file}`);
            }
        }
    }
}

// Configuration for multiple projects
const backupService = new AutomatedBackupService();

// Schedule backups for different projects
backupService.scheduleBackup('frontend-app', {
    projectPath: '/projects/frontend-app',
    backupDir: '/backups/frontend-app',
    compressionLevel: 2,
    includeMetadata: true,
    timestampFormat: 'ISO'
}, '0 2 * * *'); // Daily at 2 AM

backupService.scheduleBackup('backend-api', {
    projectPath: '/projects/backend-api',
    backupDir: '/backups/backend-api',
    compressionLevel: 3,
    includeMetadata: true,
    timestampFormat: 'ISO'
}, '0 3 * * *'); // Daily at 3 AM
```

## 🏢 Enterprise Backup Strategies

### Multi-Tier Backup System

```typescript
// enterprise-backup.ts
interface BackupTier {
    name: string;
    schedule: string;
    retention: number; // days
    location: string;
    compressionLevel: number;
}

class EnterpriseBackupSystem {
    private tiers: BackupTier[] = [
        {
            name: 'hourly',
            schedule: '0 * * * *', // Every hour
            retention: 7,
            location: '/backups/hourly',
            compressionLevel: 1
        },
        {
            name: 'daily',
            schedule: '0 1 * * *', // Daily at 1 AM
            retention: 30,
            location: '/backups/daily',
            compressionLevel: 2
        },
        {
            name: 'weekly',
            schedule: '0 2 * * 0', // Weekly on Sunday at 2 AM
            retention: 365,
            location: '/backups/weekly',
            compressionLevel: 3
        }
    ];

    async initializeBackupSchedule(projects: ProjectConfig[]): Promise<void> {
        for (const project of projects) {
            for (const tier of this.tiers) {
                this.scheduleBackupTier(project, tier);
            }
        }
    }

    private scheduleBackupTier(project: ProjectConfig, tier: BackupTier): void {
        const job = new CronJob(tier.schedule, async () => {
            try {
                const backup = new ProjectBackup({
                    projectPath: project.path,
                    backupDir: path.join(tier.location, project.name),
                    compressionLevel: tier.compressionLevel,
                    includeMetadata: true,
                    timestampFormat: 'ISO'
                });

                const backupPath = await backup.createBackup();
                
                // Archive to cloud storage for weekly backups
                if (tier.name === 'weekly') {
                    await this.archiveToCloud(backupPath, project.name);
                }

                await this.cleanupOldBackups(
                    path.join(tier.location, project.name),
                    tier.retention
                );

                console.log(`${tier.name} backup completed for ${project.name}`);
            } catch (error) {
                console.error(`${tier.name} backup failed for ${project.name}:`, error);
            }
        });

        job.start();
    }

    private async archiveToCloud(backupPath: string, projectName: string): Promise<void> {
        // Implementation for cloud storage (AWS S3, Azure Blob, etc.)
        console.log(`Archiving ${backupPath} to cloud storage...`);
    }
}
```

### Version-Controlled Backup

```typescript
// git-backup-integration.ts
import { simpleGit, SimpleGit } from 'simple-git';

class GitBackupIntegration {
    private git: SimpleGit;
    private backupRepo: string;

    constructor(backupRepoPath: string) {
        this.backupRepo = backupRepoPath;
        this.git = simpleGit(backupRepoPath);
    }

    async initializeBackupRepo(): Promise<void> {
        if (!await this.git.checkIsRepo()) {
            await this.git.init();
            await this.git.addConfig('user.name', 'LookAtni Backup System');
            await this.git.addConfig('user.email', 'backup@lookatni.dev');
        }
    }

    async commitBackup(backupPath: string, projectName: string): Promise<void> {
        const fileName = path.basename(backupPath);
        const targetPath = path.join(this.backupRepo, projectName, fileName);

        // Ensure directory exists
        await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });

        // Copy backup file
        await fs.promises.copyFile(backupPath, targetPath);

        // Commit to git
        await this.git.add(path.join(projectName, fileName));
        await this.git.commit(`Backup: ${projectName} - ${new Date().toISOString()}`);

        console.log(`Backup committed to git: ${targetPath}`);
    }

    async createBranch(branchName: string): Promise<void> {
        try {
            await this.git.checkoutLocalBranch(branchName);
        } catch (error) {
            // Branch might already exist
            await this.git.checkout(branchName);
        }
    }
}
```

## 🔄 Restore Workflows

### Interactive Restore Tool

```typescript
// restore-tool.ts
import * as inquirer from 'inquirer';
import { MarkerExtractor } from '../src/utils/markerExtractor';

interface RestoreOptions {
    backupPath: string;
    targetPath: string;
    overwriteExisting: boolean;
    selectiveRestore: boolean;
    createBackupBeforeRestore: boolean;
}

class InteractiveRestoreTool {
    private extractor: MarkerExtractor;

    constructor() {
        this.extractor = new MarkerExtractor();
    }

    async run(): Promise<void> {
        console.log('🔄 LookAtni Project Restore Tool');
        console.log('================================\n');

        const options = await this.gatherRestoreOptions();
        
        if (options.createBackupBeforeRestore) {
            await this.createPreRestoreBackup(options.targetPath);
        }

        if (options.selectiveRestore) {
            await this.selectiveRestore(options);
        } else {
            await this.fullRestore(options);
        }
    }

    private async gatherRestoreOptions(): Promise<RestoreOptions> {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'backupPath',
                message: 'Path to LookAtni backup file:',
                validate: (input) => fs.existsSync(input) || 'File does not exist'
            },
            {
                type: 'input',
                name: 'targetPath',
                message: 'Target directory for restore:',
                default: './restored-project'
            },
            {
                type: 'confirm',
                name: 'overwriteExisting',
                message: 'Overwrite existing files?',
                default: false
            },
            {
                type: 'confirm',
                name: 'selectiveRestore',
                message: 'Select specific files to restore?',
                default: false
            },
            {
                type: 'confirm',
                name: 'createBackupBeforeRestore',
                message: 'Create backup of target directory before restore?',
                default: true
            }
        ]);

        return answers as RestoreOptions;
    }

    private async selectiveRestore(options: RestoreOptions): Promise<void> {
        // Parse backup file to get file list
        const fileList = await this.extractor.getFileList(options.backupPath);
        
        const selectedFiles = await inquirer.prompt([{
            type: 'checkbox',
            name: 'files',
            message: 'Select files to restore:',
            choices: fileList.map(file => ({
                name: `${file.path} (${this.formatFileSize(file.size)})`,
                value: file.path
            }))
        }]);

        console.log(`\nRestoring ${selectedFiles.files.length} selected files...`);

        await this.extractor.extractSelected(
            options.backupPath,
            options.targetPath,
            selectedFiles.files,
            {
                overwriteExisting: options.overwriteExisting,
                preserveTimestamps: true
            }
        );

        console.log('✅ Selective restore completed!');
    }

    private async fullRestore(options: RestoreOptions): Promise<void> {
        console.log('\nStarting full project restore...');

        await this.extractor.extract(options.backupPath, options.targetPath, {
            overwriteExisting: options.overwriteExisting,
            preserveTimestamps: true,
            createDirectories: true
        });

        console.log('✅ Full restore completed!');
    }

    private async createPreRestoreBackup(targetPath: string): Promise<void> {
        if (!fs.existsSync(targetPath)) return;

        const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
        const backupPath = `${targetPath}_backup_${timestamp}`;

        console.log(`Creating pre-restore backup: ${backupPath}`);
        
        await fs.promises.cp(targetPath, backupPath, { recursive: true });
        
        console.log('✅ Pre-restore backup created!');
    }

    private formatFileSize(bytes: number): string {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
}

// Usage
const restoreTool = new InteractiveRestoreTool();
restoreTool.run().catch(console.error);
```

### Disaster Recovery Script

```typescript
// disaster-recovery.ts
class DisasterRecoverySystem {
    private backupLocations: string[];
    private recoveryPlan: RecoveryPlan;

    constructor(backupLocations: string[], recoveryPlan: RecoveryPlan) {
        this.backupLocations = backupLocations;
        this.recoveryPlan = recoveryPlan;
    }

    async executeDisasterRecovery(projectName: string): Promise<void> {
        console.log(`🚨 Starting disaster recovery for: ${projectName}`);

        // Step 1: Find the most recent backup
        const latestBackup = await this.findLatestBackup(projectName);
        if (!latestBackup) {
            throw new Error(`No backup found for project: ${projectName}`);
        }

        console.log(`📦 Found backup: ${latestBackup.path} (${latestBackup.date})`);

        // Step 2: Prepare recovery environment
        const recoveryPath = await this.prepareRecoveryEnvironment(projectName);

        // Step 3: Restore from backup
        await this.restoreFromBackup(latestBackup.path, recoveryPath);

        // Step 4: Validate restoration
        const isValid = await this.validateRestoration(recoveryPath);
        if (!isValid) {
            throw new Error('Restoration validation failed');
        }

        // Step 5: Execute post-recovery tasks
        await this.executePostRecoveryTasks(projectName, recoveryPath);

        console.log('✅ Disaster recovery completed successfully!');
    }

    private async findLatestBackup(projectName: string): Promise<BackupInfo | null> {
        let latestBackup: BackupInfo | null = null;

        for (const location of this.backupLocations) {
            const projectBackupDir = path.join(location, projectName);
            
            if (!fs.existsSync(projectBackupDir)) continue;

            const files = await fs.promises.readdir(projectBackupDir);
            const backupFiles = files.filter(f => f.endsWith('.lookatni'));

            for (const file of backupFiles) {
                const filePath = path.join(projectBackupDir, file);
                const stats = await fs.promises.stat(filePath);

                if (!latestBackup || stats.mtime > latestBackup.date) {
                    latestBackup = {
                        path: filePath,
                        date: stats.mtime,
                        size: stats.size
                    };
                }
            }
        }

        return latestBackup;
    }

    private async validateRestoration(recoveryPath: string): Promise<boolean> {
        try {
            // Check critical files exist
            for (const criticalFile of this.recoveryPlan.criticalFiles) {
                const filePath = path.join(recoveryPath, criticalFile);
                if (!fs.existsSync(filePath)) {
                    console.error(`Critical file missing: ${criticalFile}`);
                    return false;
                }
            }

            // Run validation scripts
            for (const validator of this.recoveryPlan.validators) {
                const result = await validator.validate(recoveryPath);
                if (!result.isValid) {
                    console.error(`Validation failed: ${result.message}`);
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('Validation error:', error);
            return false;
        }
    }
}

interface RecoveryPlan {
    criticalFiles: string[];
    validators: ValidationRule[];
    postRecoveryTasks: RecoveryTask[];
}

interface ValidationRule {
    name: string;
    validate: (path: string) => Promise<{ isValid: boolean; message?: string }>;
}

interface RecoveryTask {
    name: string;
    execute: (projectPath: string) => Promise<void>;
}
```

## 🔒 Secure Backup Workflows

### Encrypted Backup System

```typescript
// encrypted-backup.ts
import * as crypto from 'crypto';

class EncryptedBackupSystem {
    private algorithm = 'aes-256-gcm';
    
    async createEncryptedBackup(
        projectPath: string,
        backupPath: string,
        password: string
    ): Promise<void> {
        // Generate marker file
        const generator = new MarkerGenerator();
        const markerContent = await generator.generate(projectPath);

        // Encrypt the content
        const encryptedData = await this.encrypt(markerContent, password);

        // Save encrypted backup
        await fs.promises.writeFile(backupPath + '.encrypted', encryptedData);
        
        console.log('✅ Encrypted backup created successfully!');
    }

    async restoreFromEncryptedBackup(
        encryptedBackupPath: string,
        targetPath: string,
        password: string
    ): Promise<void> {
        // Read and decrypt
        const encryptedData = await fs.promises.readFile(encryptedBackupPath);
        const decryptedContent = await this.decrypt(encryptedData, password);

        // Extract to target
        const extractor = new MarkerExtractor();
        await extractor.extractFromContent(decryptedContent, targetPath);
        
        console.log('✅ Encrypted backup restored successfully!');
    }

    private async encrypt(data: string, password: string): Promise<Buffer> {
        const key = crypto.scryptSync(password, 'salt', 32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher(this.algorithm, key);
        cipher.setAAD(Buffer.from('lookatni-backup'));

        let encrypted = cipher.update(data, 'utf8');
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        const tag = cipher.getAuthTag();

        return Buffer.concat([iv, tag, encrypted]);
    }

    private async decrypt(encryptedData: Buffer, password: string): Promise<string> {
        const key = crypto.scryptSync(password, 'salt', 32);
        const iv = encryptedData.subarray(0, 16);
        const tag = encryptedData.subarray(16, 32);
        const encrypted = encryptedData.subarray(32);

        const decipher = crypto.createDecipher(this.algorithm, key);
        decipher.setAAD(Buffer.from('lookatni-backup'));
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(encrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString('utf8');
    }
}
```

## 📊 Backup Monitoring and Reporting

### Backup Health Monitor

```typescript
// backup-monitor.ts
class BackupHealthMonitor {
    private metrics: BackupMetrics = {
        totalBackups: 0,
        successfulBackups: 0,
        failedBackups: 0,
        averageBackupSize: 0,
        lastBackupTime: null
    };

    async generateHealthReport(): Promise<BackupHealthReport> {
        const projects = await this.getMonitoredProjects();
        const report: BackupHealthReport = {
            timestamp: new Date(),
            overallHealth: 'healthy',
            projects: [],
            recommendations: []
        };

        for (const project of projects) {
            const projectHealth = await this.assessProjectHealth(project);
            report.projects.push(projectHealth);

            if (projectHealth.status !== 'healthy') {
                report.overallHealth = 'warning';
            }
        }

        report.recommendations = this.generateRecommendations(report);

        return report;
    }

    private async assessProjectHealth(project: ProjectConfig): Promise<ProjectHealthInfo> {
        const backupDir = path.join('/backups', project.name);
        const recentBackups = await this.getRecentBackups(backupDir, 7); // Last 7 days

        const health: ProjectHealthInfo = {
            projectName: project.name,
            status: 'healthy',
            lastBackupAge: this.calculateLastBackupAge(recentBackups),
            backupSize: this.calculateAverageBackupSize(recentBackups),
            successRate: this.calculateSuccessRate(recentBackups),
            issues: []
        };

        // Check for issues
        if (health.lastBackupAge > 24) { // More than 24 hours
            health.status = 'warning';
            health.issues.push('Backup is overdue');
        }

        if (health.successRate < 0.8) { // Less than 80% success rate
            health.status = 'critical';
            health.issues.push('Low backup success rate');
        }

        return health;
    }

    async sendAlerts(report: BackupHealthReport): Promise<void> {
        const criticalProjects = report.projects.filter(p => p.status === 'critical');
        
        if (criticalProjects.length > 0) {
            await this.sendCriticalAlert(criticalProjects);
        }

        // Send weekly summary
        if (this.isWeeklyReportDay()) {
            await this.sendWeeklySummary(report);
        }
    }
}

interface BackupHealthReport {
    timestamp: Date;
    overallHealth: 'healthy' | 'warning' | 'critical';
    projects: ProjectHealthInfo[];
    recommendations: string[];
}
```

## 🌐 Cloud Integration

### Multi-Cloud Backup Strategy

```typescript
// cloud-backup.ts
interface CloudProvider {
    name: string;
    upload: (localPath: string, remotePath: string) => Promise<void>;
    download: (remotePath: string, localPath: string) => Promise<void>;
    list: (prefix: string) => Promise<string[]>;
}

class MultiCloudBackupStrategy {
    private providers: CloudProvider[];
    
    constructor(providers: CloudProvider[]) {
        this.providers = providers;
    }

    async distributeBackup(backupPath: string, projectName: string): Promise<void> {
        const fileName = path.basename(backupPath);
        const remotePath = `${projectName}/${fileName}`;

        // Upload to all cloud providers in parallel
        const uploadPromises = this.providers.map(provider =>
            this.uploadWithRetry(provider, backupPath, remotePath)
        );

        const results = await Promise.allSettled(uploadPromises);
        
        // Log results
        results.forEach((result, index) => {
            const provider = this.providers[index];
            if (result.status === 'fulfilled') {
                console.log(`✅ Backup uploaded to ${provider.name}`);
            } else {
                console.error(`❌ Failed to upload to ${provider.name}:`, result.reason);
            }
        });
    }

    private async uploadWithRetry(
        provider: CloudProvider,
        localPath: string,
        remotePath: string,
        retries = 3
    ): Promise<void> {
        for (let i = 0; i < retries; i++) {
            try {
                await provider.upload(localPath, remotePath);
                return;
            } catch (error) {
                if (i === retries - 1) throw error;
                await this.delay(Math.pow(2, i) * 1000); // Exponential backoff
            }
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

---

## 🎯 Best Practices Summary

### 📋 Backup Strategy Checklist

- ✅ **Multiple backup tiers** (hourly, daily, weekly)
- ✅ **Geographic distribution** (local + cloud)
- ✅ **Automated scheduling** with monitoring
- ✅ **Encryption** for sensitive projects
- ✅ **Regular validation** of backup integrity
- ✅ **Documented recovery procedures**
- ✅ **Retention policies** for storage management

### 🔄 Recovery Planning

- ✅ **Test recovery procedures** regularly
- ✅ **Document critical file dependencies**
- ✅ **Maintain recovery environment** ready
- ✅ **Train team members** on recovery process
- ✅ **Monitor backup health** continuously

### 🛡️ Security Considerations

- ✅ **Encrypt sensitive backups**
- ✅ **Secure backup storage locations**
- ✅ **Implement access controls**
- ✅ **Regular security audits**
- ✅ **Compliance with data protection** regulations

This comprehensive backup and restore system ensures your projects are protected against data loss while providing flexible recovery options for various scenarios.
