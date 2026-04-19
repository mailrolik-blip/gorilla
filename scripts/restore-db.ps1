# Restore script for PostgreSQL database
# Restores from a specified backup file

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile
)

# Check if backup file exists
if (!(Test-Path $BackupFile)) {
    Write-Host "Error: Backup file '$BackupFile' not found!"
    exit 1
}

# Confirmation prompt
$confirmation = Read-Host "This will overwrite the current database. Are you sure? (yes/no)"
if ($confirmation -ne "yes") {
    Write-Host "Restore cancelled."
    exit 0
}

# Run restore via Docker
Write-Host "Restoring from: $BackupFile"
docker exec -i postgres-db psql -U postgres -d hockey_platform < $BackupFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "Restore completed successfully."
} else {
    Write-Host "Restore failed!"
    exit 1
}