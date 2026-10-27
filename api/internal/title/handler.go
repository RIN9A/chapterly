package title

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"
	// "github.com/RIN9A/chapterly-api/internal/health"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if err := json.NewEncoder(w).Encode(value); err != nil {
		http.Error(w, `{"error": "Failed to encode response"}`,
			http.StatusInternalServerError,
		)
	}
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var input CreateInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid JSON")
		return
	}

	if strings.TrimSpace(input.Title) == "" {
		writeError(w, http.StatusBadRequest, "Name is required")
		return
	}

	if len(input.Title) > 300 {
		writeError(w, http.StatusBadRequest, "Name is too long")
		return
	}
	switch input.Status {
	case "":
		input.Status = StatusWantToRead
	case StatusWantToRead, StatusReading, StatusPaused, StatusFinished, StatusDropped:
	default:
		writeError(w, http.StatusBadRequest, "Unknown reading status")
		return
	}

	if input.CurrentChapter < 0 {
		writeError(w, http.StatusBadRequest, "Current chapter cannot be negative")
		return
	}
	if input.TotalChapters != nil && *input.TotalChapters < 0 {
		writeError(w, http.StatusBadRequest, "Total chapters cannot be negative")
		return
	}
	if input.Genres == nil {
		input.Genres = []string{}
	}

	created, err := h.repo.Create(r.Context(), input)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to save the title")
		return
	}

	writeJSON(w, http.StatusCreated, created)
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	titles, err := h.repo.List(r.Context())
	if err != nil {

		log.Printf("list titles error: %v", err)

		writeError(w, http.StatusInternalServerError, "Failed to get list of titles")
		return
	}
	writeJSON(w, http.StatusOK, map[string][]Title{"titles": titles})
}

func (h *Handler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	found, err := h.repo.GetByID(r.Context(), id)
	if errors.Is(err, ErrNotFound) {
		writeError(w, http.StatusNotFound, "Title not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Failed to get title")
		return
	}
	writeJSON(w, http.StatusOK, found)
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var input UpdateInput

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "Invalid JSON")
		return
	}

	if input.Title != nil && strings.TrimSpace(*input.Title) == "" {
		writeError(w, http.StatusBadRequest, "Title cannot be empty")
		return
	}

	if input.Status != nil {
		switch *input.Status {
		case StatusWantToRead, StatusReading, StatusPaused, StatusFinished, StatusDropped:
		default:
			writeError(w, http.StatusBadRequest, "Unknown reading status")
			return
		}
	}

	if input.CurrentChapter != nil && *input.CurrentChapter < 0 {
		writeError(w, http.StatusBadRequest, "Current chapter cannot be negative")
		return
	}

	if input.TotalChapters != nil && *input.TotalChapters < 0 {
		writeError(w, http.StatusBadRequest, "Total chapters cannot be negative")
		return
	}

	updated, err := h.repo.Update(r.Context(), id, input)

	if errors.Is(err, ErrNotFound) {
		writeError(w, http.StatusNotFound, "Title not found")
		return
	}

	if err != nil {
		log.Printf("update title error: %v", err)
		writeError(w, http.StatusInternalServerError, "Failed to update title")
		return
	}

	writeJSON(w, http.StatusOK, updated)
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	err := h.repo.Delete(r.Context(), id)

	if errors.Is(err, ErrNotFound) {
		writeError(w, http.StatusNotFound, "Title not found")
		return
	}
	if err != nil {
		log.Printf("delete title error: %v", err)
		writeError(w, http.StatusInternalServerError, "Failed to delete title")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
