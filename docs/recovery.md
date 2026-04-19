# Database Backup and Recovery

This document describes the backup and restore procedures for the Gorilla Hockey platform's PostgreSQL database.

## Overview

The project uses PostgreSQL in Docker with database name `hockey_platform`. Backup and restore scripts are provided for development safety.

## Before Risky Actions

Always create a backup before:
- Running database migrations
- Modifying schema manually
- Testing destructive operations
- Upgrading Prisma or database version

## Creating a Backup

Run the backup script to create a timestamped SQL dump:

```bash
npm run db:backup
```

Or directly:
```powershell
.\scripts\backup-db.ps1
```

**What happens:**
- Creates `backups/` directory if needed
- Generates file: `backups/backup_YYYYMMDD_HHMMSS.sql`
- Previous backups are never overwritten

## Restoring from Backup

To restore the database from a backup file:

```powershell
.\scripts\restore-db.ps1 -BackupFile backups\backup_20231201_120000.sql
```

**What happens:**
- Prompts for confirmation (type "yes" to proceed)
- **DANGER:** This will overwrite the current database
- Restores data from the specified SQL file

## Checking Current Database

To verify which database the project is connected to:

1. Check `docker-compose.yml` for database name (`hockey_platform`)
2. Run `docker ps` to see running containers
3. Connect via Prisma Studio: `npx prisma studio`

## Dev-Safe Workflow

1. **Before development:** `npm run db:backup`
2. **During development:** Use `npm run db:seed` for test data
3. **After risky changes:** Test thoroughly, then backup again
4. **If something breaks:** `npm run db:restore` from recent backup
5. **Never restore in production** without additional safeguards

## Limitations

- Scripts work only with local Docker PostgreSQL
- No automatic scheduling or cloud storage
- Restore is destructive (overwrites current data)
- Requires Docker and PowerShell
- For production, implement proper backup strategies

## Troubleshooting

- **Permission denied:** Ensure Docker is running and scripts have execution rights
- **Container not found:** Run `docker-compose up -d` first
- **Backup empty:** Check database connection and data existence
- **Restore fails:** Verify backup file integrity and database accessibility