package title

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
)

var ErrNotFound = errors.New("title not found")

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{
		db: db,
	}
}

func scanTitle(row interface {
	Scan(dest ...any) error
}) (Title, error) {
	var t Title
	var genresJSON string
	var createdAt string
	var updatedAt string

	err := row.Scan(
		&t.ID,
		&t.Title,
		&t.Author,
		&t.CoverURL,
		&t.SourceURL,
		&t.Status,
		&t.CurrentChapter,
		&t.TotalChapters,
		&genresJSON,
		&t.Note,
		&createdAt,
		&updatedAt,
	)

	if err != nil {
		return Title{}, err
	}

	if genresJSON == "" {
		t.Genres = []string{}
	} else if err := json.Unmarshal([]byte(genresJSON), &t.Genres); err != nil {
		return Title{}, fmt.Errorf("unmarshal genres: %w", err)
	}
	if t.Genres == nil {
		t.Genres = []string{}
	}
	parsedCreatedAt, err := time.Parse(time.RFC3339, createdAt)
	if err != nil {
		return Title{}, fmt.Errorf("parse created_at: %w", err)
	}

	parsedUpdatedAt, err := time.Parse(time.RFC3339, updatedAt)
	if err != nil {
		return Title{}, fmt.Errorf("parse updated_at: %w", err)
	}

	t.CreatedAt = parsedCreatedAt
	t.UpdatedAt = parsedUpdatedAt
	return t, nil
}

func (r *Repository) Create(ctx context.Context, input CreateInput) (Title, error) {
	now := time.Now().UTC()
	t := Title{
		ID:             uuid.NewString(),
		Title:          input.Title,
		Author:         input.Author,
		CoverURL:       input.CoverURL,
		SourceURL:      input.SourceURL,
		Status:         input.Status,
		CurrentChapter: input.CurrentChapter,
		TotalChapters:  input.TotalChapters,
		Genres:         input.Genres,
		Note:           input.Note,
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	if t.Status == "" {
		t.Status = StatusWantToRead
	}

	genresJSON, err := json.Marshal(t.Genres)
	if err != nil {
		return Title{}, fmt.Errorf("marshal genres: %w", err)
	}
	_, err = r.db.ExecContext(ctx, `
		INSERT INTO titles (id, title, author, cover_url, source_url, status, current_chapter, total_chapters, note, created_at, updated_at, genres)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, t.ID, t.Title, t.Author, t.CoverURL, t.SourceURL, t.Status, t.CurrentChapter, t.TotalChapters, t.Note, t.CreatedAt.Format(time.RFC3339), t.UpdatedAt.Format(time.RFC3339), string(genresJSON))
	if err != nil {
		return Title{}, fmt.Errorf("insert title: %w", err)
	}

	log.Println(t.ID)

	return t, nil
}

func (r *Repository) List(ctx context.Context) ([]Title, error) {
	rows, err := r.db.QueryContext(ctx, `
	SELECT id, title, author, cover_url, source_url, status, current_chapter, total_chapters, genres, note, created_at, updated_at
	FROM titles ORDER BY updated_at DESC`)

	if err != nil {
		return nil, fmt.Errorf("list titles: %w", err)
	}

	defer rows.Close()
	titles := make([]Title, 0)

	for rows.Next() {
		t, err := scanTitle(rows)

		if err != nil {
			return nil, fmt.Errorf("scan title: %w", err)
		}
		titles = append(titles, t)
	}
	return titles, nil
}

func (r *Repository) GetByID(ctx context.Context, id string) (Title, error) {
	row := r.db.QueryRowContext(ctx, `
	SELECT id, title, author, cover_url, source_url, status, current_chapter, total_chapters, genres,
	 note, created_at, updated_at FROM titles WHERE id = ?`, id)

	t, err := scanTitle(row)

	if errors.Is(err, sql.ErrNoRows) {
		return Title{}, ErrNotFound
	}

	if err != nil {
		return Title{}, fmt.Errorf("scan title: %w", err)
	}
	return t, nil
}

func (r *Repository) Update(ctx context.Context, id string, input UpdateInput) (Title, error) {
	current, err := r.GetByID(ctx, id)

	if err != nil {
		return Title{}, err
	}

	if input.Title != nil {
		current.Title = *input.Title
	}
	if input.Author != nil {
		current.Author = *input.Author
	}
	if input.CoverURL != nil {
		current.CoverURL = *input.CoverURL
	}
	if input.SourceURL != nil {
		current.SourceURL = *input.SourceURL
	}
	if input.Status != nil {
		current.Status = *input.Status
	}

	if input.CurrentChapter != nil {
		current.CurrentChapter = *input.CurrentChapter
	}

	if input.TotalChapters != nil {
		current.TotalChapters = input.TotalChapters
	}

	if input.Genres != nil {
		current.Genres = input.Genres
	}
	if input.Note != nil {
		current.Note = *input.Note
	}
	current.UpdatedAt = time.Now().UTC()

	genresJSON, err := json.Marshal(current.Genres)
	if err != nil {
		return Title{}, fmt.Errorf("marshal genres: %w", err)
	}
	result, err := r.db.ExecContext(ctx, `
	UPDATE titles
	SET title = ?, author = ?, cover_url = ?, source_url = ?,
	status = ?, current_chapter = ?, total_chapters = ?, genres = ?, note = ?,
	updated_at = ? WHERE id = ?`,
		current.Title, current.Author, current.CoverURL, current.SourceURL,
		current.Status, current.CurrentChapter, current.TotalChapters, string(genresJSON), current.Note,
		current.UpdatedAt.Format(time.RFC3339),
		id,
	)
	if err != nil {
		return Title{}, fmt.Errorf("update title: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return Title{}, fmt.Errorf("check updated rows: %w", err)
	}
	if rowsAffected == 0 {
		return Title{}, ErrNotFound
	}

	return current, nil
}
