package health

import (
	"encoding/json"
	"net/http"
)

type Response struct {
	Status  string `json:"status"`
}

func Handler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		if err := json.NewEncoder(w).Encode(Response{
			Status: "ok",
		}); err != nil {
			http.Error(w, `{"error": "faild to encode response"}`, http.StatusInternalServerError)
		}
	}
}