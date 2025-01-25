package db

import (
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
	"time"
	_ "github.com/lib/pq"
)

type pgConfig struct {
	host string
	port int
	user string
	password string
	dbname string
}

var pgConf pgConfig

type Tags map[string]interface{}

func (a Tags) Value() (driver.Value, error) {
    return json.Marshal(a)
}

func (a *Tags) Scan(value interface{}) error {
    b, ok := value.([]byte)
    if !ok {
        return errors.New("type assertion to []byte failed")
    }

    return json.Unmarshal(b, &a)
}

func SetConfigPG(host string, port int, user string, password string, dbname string) {
	pgConf = pgConfig{}
	pgConf.host = host
	pgConf.port = port
	pgConf.user = user
	pgConf.password = password
	pgConf.dbname = dbname
}

func (c* pgConfig) GetConnectionString() string {
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=disable",
		c.host,
		c.port,
		c.user,
		c.password,
		c.dbname)
	return psqlInfo;
}

func PgQuerySource(metric string, begin time.Time, end time.Time, source string) ([]Metric, error) {
	var list []Metric

	db, err := sql.Open("postgres", pgConf.GetConnectionString())
	if err != nil {
		return list, err
	}

	defer db.Close()

	sqlStatement := `SELECT date, metric, source, tags, value FROM metrics WHERE metric=$1 AND date >= $2 AND date <= $3 AND source=$4 ORDER BY date desc;`
	rows, err := db.Query(sqlStatement, metric, begin, end, source)
	if err != nil {
		return list, err
	}

	defer rows.Close()
	for rows.Next() {
		var metric Metric
		var tags Tags
		err = rows.Scan(&metric.Date, &metric.Metric, &metric.Source, &tags, &metric.Value)
		if err != nil {
			return list, err
		}
		metric.Tags = tags
		list = append(list, metric)
	}

	err = rows.Err()
	if err != nil {
		return list, err
	}

	//fmt.Printf("%v\n", list)

	return list, nil
}

func PgQuery(metric string, begin time.Time, end time.Time)  ([]Metric, error) {
	var list []Metric

	db, err := sql.Open("postgres", pgConf.GetConnectionString())
	if err != nil {
		return list, err
	}

	defer db.Close()

	sqlStatement := `SELECT date, metric, source, tags, value FROM metrics WHERE metric=$1 AND date >= $2 AND date <= $3 ORDER BY date desc;`
	rows, err := db.Query(sqlStatement, metric, begin, end)
	if err != nil {
		return list, err
	}

	defer rows.Close()
	for rows.Next() {
		var metric Metric
		var tags Tags
		err = rows.Scan(&metric.Date, &metric.Metric, &metric.Source, &tags, &metric.Value)
		if err != nil {
			return list, err
		}
		metric.Tags = tags
		list = append(list, metric)
	}

	err = rows.Err()
	if err != nil {
		return list, err
	}

	//fmt.Printf("%v\n", list)

	return list, nil
}
