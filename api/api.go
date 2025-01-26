package api

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/randysimpson/retrieve/db"
	"io/ioutil"
	"k8s.io/klog"
	"net/http"
	"time"
)

type bodyQuery struct {
	Begin  string `json:"beginDate"`
	End    string `json:"endDate,omitempty"`
	Metric string `json:"metric"`
	Source string `json:"source,omitempty"`
}

type config struct {
	version string `json:"version"`
	podName string `json:"podName,omitempty"`
}

var conf config

func SetConfig(version string, podName string) {
	conf.version = version
	conf.podName = podName
}

func homePage(w http.ResponseWriter, r *http.Request) {
	klog.Infof("Endpoint %s", r.URL.Path)
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	if conf.podName != "" {
		w.Write([]byte(fmt.Sprintf(`{ "version":"%s", "podName": "%s", "date":"%sZ" }`, conf.version, conf.podName, time.Now().Format(time.RFC3339))))
	} else {
		w.Write([]byte(fmt.Sprintf(`{ "version":"%s", "date":"%sZ" }`, conf.version, time.Now().Format(time.RFC3339))))
	}
}

func getMetrics(w http.ResponseWriter, r *http.Request) {
	klog.Infof("Endpoint %s", r.URL.Path)

	reqBody, err := ioutil.ReadAll(r.Body)
	if err != nil {
		klog.Errorf("Request body error: %v\n", err)
		badRequest(w, r, err)
		return
	}

	var body bodyQuery
	json.Unmarshal(reqBody, &body)

	begin, err := time.Parse(time.RFC3339, body.Begin)
	if err != nil {
		klog.Errorf("Date error: %v\n", err)
		badRequest(w, r, err)
		return
	}
	end, err := time.Parse(time.RFC3339, body.End)
	if err != nil {
		klog.Errorf("Date error: %v\n", err)
		badRequest(w, r, err)
		return
	}

	var list []db.Metric
	if body.Source != "" {
		list, err = db.QuerySource(body.Metric, begin, end, body.Source)
	} else {
		list, err = db.Query(body.Metric, begin, end)
	}
	if err != nil {
		klog.Errorf("DB Error: %v\n", err)
		badRequest(w, r, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	json.NewEncoder(w).Encode(list)
}

func badRequest(w http.ResponseWriter, r *http.Request, err error) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusBadRequest)
	klog.Infof("%sZ - %s - %s%s - 404 - %s - %+v\n", time.Now().Format(time.RFC3339), r.Method, r.Host, r.URL.Path, r.RemoteAddr, err)
	w.Write([]byte(fmt.Sprintf(`{ "status":"Error on Request Body", "date":"%sZ" }`, time.Now().Format(time.RFC3339))))
}

func notFound(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(http.StatusNotFound)
	klog.Infof("%sZ - %s - %s%s - 404 - %s\n", time.Now().Format(time.RFC3339), r.Method, r.Host, r.URL.Path, r.RemoteAddr)
	w.Write([]byte(fmt.Sprintf(`{ "status":"Not Found", "date":"%sZ" }`, time.Now().Format(time.RFC3339))))
}

func HandleRequest() {
	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/", homePage)

	api := router.PathPrefix("/api/v1").Subrouter()
	api.HandleFunc("/metrics", getMetrics).Methods("POST")

	http.ListenAndServe(":3000", router)
}
