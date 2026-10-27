package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/RIN9A/chapterly-api/internal/health"
	"github.com/RIN9A/chapterly-api/internal/storage"
	"github.com/RIN9A/chapterly-api/internal/title"
)

func main() {
	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	db, err := storage.OpenSQLite()
	if err != nil {
		log.Fatalf("storage error: %v", err)
	}

	defer db.Close()

	titleRepo := title.NewRepository(db)
	titleHandler := title.NewHandler(titleRepo)


	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/v1/health", health.Handler())
	mux.HandleFunc("GET /api/v1/titles", titleHandler.List)
	mux.HandleFunc("POST /api/v1/titles", titleHandler.Create)
	mux.HandleFunc("GET /api/v1/titles/{id}", titleHandler.GetByID)
	mux.HandleFunc("PATCH /api/v1/titles/{id}", titleHandler.Update)	


	server := &http.Server{
		Addr: ":" + port,
		Handler: mux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		log.Printf("Chapterly API launched on http://localhost:%s", port)

		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server error: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("server shutdown failed: %v", err)
	}
	log.Println("Server gracefully stopped")

}