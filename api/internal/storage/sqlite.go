package storage

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

func OpenSQLite() (*sql.DB, error) {
	dataDir := "data"

	if err := os.MkdirAll(dataDir, 0o755); err != nil {
		return nil, fmt.Errorf("create data directory: %w", err)
	}

	dbPath := filepath.Join(dataDir, "chapterly.sqlite")

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("open sqlite database: %w", err)
	}

	db.SetMaxOpenConns(1)

	if err := db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("ping sqlite database: %w", err)
	}

	if err := migrate(db); err != nil {
		db.Close()
		return nil, fmt.Errorf("migrate sqlite database: %w", err)
	}
	return db, nil
}

func migrate(db *sql.DB) error {
	_, err := db.Exec(`
	CREATE TABLE IF NOT EXISTS titles (
	id TEXT PRIMARY KEY,
	title TEXT NOT NULL,
	author TEXT NOT NULL DEFAULT '',
	cover_url TEXT NOT NULL DEFAULT '',
	source_url TEXT NOT NULL DEFAULT '',
	status TEXT NOT NULL CHECK ( status IN ( 'want_to_read', 'reading', 'paused', 'finished', 'dropped'
	)),
	current_chapter INTEGER NOT NULL DEFAULT 0,
	total_chapters INTEGER,
	genres TEXT NOT NULL DEFAULT '[]',
	note TEXT NOT NULL DEFAULT '',
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_titles_status ON titles (status);
CREATE INDEX IF NOT EXISTS idx_titles_title ON titles (title);
	`)

	if err != nil {
		return fmt.Errorf("exec migrations %w", err)
	}
	return nil
}

