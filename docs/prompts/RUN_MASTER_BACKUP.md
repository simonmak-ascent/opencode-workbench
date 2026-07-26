# RUN_MASTER_BACKUP

## Purpose
Execute the master backup script and handle the complete backup workflow.

## Usage
Copy this prompt into OpenCode or run `bash scripts/backup/run-master-backup.sh`.

## Prompt
```
Execute a master backup of this workstation now.

1. Run bash scripts/backup/run-master-backup.sh
2. If the script does not exist, fall back to the manual workflow in MASTER_WORKBENCH_BACKUP.md
3. Review the generated reports in docs/
4. If security scan finds issues, report them and abort
5. If all clean, stage the changes and propose a commit message
6. Wait for my approval before committing

Do not push without my explicit approval.
```
