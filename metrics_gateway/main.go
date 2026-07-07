package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
)

type Metrics struct {
	Round    int     `json:"round"`
	Accuracy float64 `json:"accuracy"`
	Loss     float64 `json:"loss"`
}

var (
	metricsStore []Metrics
	mu           sync.Mutex
)

func metricsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		var m Metrics
		if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		mu.Lock()
		metricsStore = append(metricsStore, m)
		mu.Unlock()
		
		fmt.Printf("🐹 [Go Gateway] Received Round %d metrics: Accuracy %.2f\n", m.Round, m.Accuracy)
		w.WriteHeader(http.StatusCreated)
	} else if r.Method == "GET" {
		mu.Lock()
		defer mu.Unlock()
		json.NewEncoder(w).Encode(metricsStore)
	}
}

func main() {
	http.HandleFunc("/metrics", metricsHandler)
	fmt.Println("🐹 Go Metrics Gateway listening on :8081 for high-throughput FL metrics...")
	log.Fatal(http.ListenAndServe(":8081", nil))
}
