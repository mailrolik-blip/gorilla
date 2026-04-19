# Backup script for PostgreSQL database
# Creates a timestamped dump file in the backups/ directory

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "backups"
$backupFile = "$backupDir\backup_$timestamp.sql"

# Create backups directory if it doesn't exist
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# Run pg_dump via Docker
Write-Host "Creating backup: $backupFile"
docker exec postgres-db pg_dump -U postgres -d hockey_platform > $backupFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup completed successfully: $backupFile"
} else {
    Write-Host "Backup failed!"
    exit 1
}