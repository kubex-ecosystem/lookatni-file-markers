// Utility functions for LookAtni Demo

export function formatBytes(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

export function validateFilename(filename) {
    const invalidChars = /[<>:"|?*]/;
    return !invalidChars.test(filename);
}

export function createMarker(filename) {
    return `//m/ ${filename} /m//`;
}
