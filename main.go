package main

import (
	"os"
	"strconv"
	"k8s.io/klog"
	"github.com/randysimpson/retrieve/db"
	"github.com/randysimpson/retrieve/api"
)

type Config struct {
	host string
	port int
	user string
	password string
	dbname string
	version string
	podName string
	dbType string
}

var config Config

func loadConfig() {
	config = Config{}
	config.host = os.Getenv("DB_HOST")
	config.port, _ = strconv.Atoi(os.Getenv("DB_PORT"))
	config.user = os.Getenv("DB_USER")
	config.password = os.Getenv("DB_PASS")
	config.dbname = os.Getenv("DB_NAME")
	config.version = "2.0.1"
	config.podName = os.Getenv("POD_NAME")
	config.dbType = os.Getenv("DB_TYPE")
}

func main() {
	loadConfig()
	klog.Infof("Initializing retrieve application version %s", config.version)

	if config.dbType == "pg" {
		db.SetupPG(config.host, config.port, config.user, config.password, config.dbname)
	} else if config.dbType == "mongo" {
		db.SetupMongo(config.host, config.port, config.dbname)
	}

	api.SetConfig(config.version, config.podName)
	api.HandleRequest()
}
