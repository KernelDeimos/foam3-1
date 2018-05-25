#!/bin/bash
# Run all the migration scripts in migrate.
# Scripts are only applied once, then moved to the migrated folder.

#printf "migrating $0\n"

MIGRATE="tools/journal_migration"
MIGRATED="$JOURNAL_HOME/migrated"

mkdir -p "$MIGRATED"

cd "$MIGRATE"
for file in *
do
    if [ ! -f "$MIGRATED/$file" ]; then
        printf "running migration $file\n"
        ./"$file"
        cp "$file" "$MIGRATED/$file"
    fi
done
