package db

import (
	"time"
)

type Metric struct {
	Date time.Time `json:"date"`
	Metric string `json:"metric"`
	Source string `json:"source"`
	Tags map[string]interface{} `json:"tags"`
	Value float32 `json:"value"`
}

var dbtype string

func SetupPG(host string, port int, user string, password string, dbname string) {
	dbtype = "pg"
	SetConfigPG(host, port, user, password, dbname)
}

func SetupMongo(host string, port int, dbname string) {
	dbtype = "mongo"
	SetConfigMongo(host, port, dbname)
}

func Query(metric string, begin time.Time, end time.Time) ([]Metric, error) {
	if dbtype == "pg" {
		return PgQuery(metric, begin, end)
	} else if dbtype == "mongo" {
		return MongoQuery(metric, begin, end)
	}
	var list []Metric
	return list, nil
}

func QuerySource(metric string, begin time.Time, end time.Time, source string) ([]Metric, error) {
	if dbtype == "pg" {
		return PgQuerySource(metric, begin, end, source)
	} else if dbtype == "mongo" {
		return MongoQuerySource(metric, begin, end, source)
	}
	var list []Metric
	return list, nil
}
