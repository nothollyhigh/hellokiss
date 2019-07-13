package app

import (
	"flag"
	"io"
	"io/ioutil"
	"os"
	"time"

	jsoniter "github.com/json-iterator/go"
	"github.com/nothollyhigh/kiss/log"
	"github.com/nothollyhigh/kiss/util"
)

var (
	appVersion = ""
	config     = &Config{}
	json       = jsoniter.ConfigCompatibleWithStandardLibrary
	confpath   = flag.String("config", "./conf/config.json", "config file path, default is conf/config.json")

	logout = io.Writer(nil)
)

type Config struct {
	Debug      bool   `json:"Debug"`
	LogDir     string `json:"LogDir"`
	SvrAddr    string `json:"SvrAddr"`
	StaticAddr string `json:"StaticAddr"`
}

func initConfig() {
	flag.Parse()

	filename := *confpath
	data, err := ioutil.ReadFile(filename)
	if err != nil {
		log.Panic("initConfig ReadFile Failed: %v", err)
	}

	data = util.TrimComment(data)
	err = json.Unmarshal(data, &config)
	if err != nil {
		log.Panic("initConfig json.Unmarshal Failed: %v", err)
	}
}

func initLog() {
	var (
		fileWriter = &log.FileWriter{
			RootDir:     config.LogDir + time.Now().Format("20060102150405/"),
			DirFormat:   "",
			FileFormat:  "20060102.log",
			MaxFileSize: 1024 * 1024 * 32,
			EnableBufio: false,
		}
	)
	if config.Debug {
		logout = io.MultiWriter(os.Stdout, fileWriter)
	} else {
		logout = fileWriter
	}

	log.SetOutput(logout)

	configData, _ := json.MarshalIndent(config, "", "    ")
	log.Info("config: %v\n%v", *confpath, string(configData))
}

func Run(version string) {
	appVersion = version

	initConfig()

	initLog()

	log.Info("app version: '%v'", version)

	util.Go(userMgr.BroadcastLoop)

	startWsServer()
}

func Stop() {
	ch := make(chan int, 1)

	go func() {
		wsServer.Shutdown(time.Second*5, func(error) {})
		ch <- 1
	}()

	select {
	case <-ch:
	case <-time.After(time.Second * 5):
		log.Error("  Stop timeout")
	}
}
