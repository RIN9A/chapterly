package title
import "time"

type Status string

const (
	StatusWantToRead Status = "want_to_read"
	StatusReading    Status = "reading"
	StatusPaused     Status = "paused"
	StatusFinished   Status = "finished"
	StatusDropped    Status = "dropped"
)

type Title struct {
	ID string `json:"id"`
	Title string `json:"title"`
	Author string `json:"author"`
	CoverURL string `json:"coverUrl"`
	SourceURL string `json:"sourceUrl"`
	Status Status `json:"status"`
	CurrentChapter int `json:"currentChapter"`
	TotalChapters *int `json:"totalChapters"`
	Genres []string `json:"genres"`
	Note string `json:"note"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type CreateInput struct {
	Title string `json:"title"`
	Author string `json:"author"`
	CoverURL string `json:"coverUrl"`
	SourceURL string `json:"sourceUrl"`
	Status Status `json:"status"`
	CurrentChapter int `json:"currentChapter"`
	TotalChapters *int `json:"totalChapters"`
	Genres []string `json:"genres"`
	Note string `json:"note"`
}

type UpdateInput struct {
	Title *string `json:"title"`
	Author *string `json:"author"`
	CoverURL *string `json:"coverUrl"`
	SourceURL *string `json:"sourceUrl"`
	Status *Status `json:"status"`
	CurrentChapter *int `json:"currentChapter"`
	TotalChapters *int `json:"totalChapters"`
	Genres []string `json:"genres"`
	Note *string `json:"note"`
}