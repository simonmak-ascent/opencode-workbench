# RUN_MASTER_BACKUP

## Purpose
Execute the master backup script and handle the complete backup workflow.

## Usage
Copy this prompt into OpenCode or run `bash scripts/backup/run-master-backup.sh`.

## Prompt
```
Execute a master backup of this workstation now.

1. Run bash scripts/backup/run-master-backup.sh
2. Review the generated reports in docs/
3. If security scan finds issues, report them and abort
4. If all clean, stage the changes and propose a commit message
5. Wait for my approval before committing

Do not push without my explicit approval.
```
