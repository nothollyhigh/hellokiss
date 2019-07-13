package app

import (
	"github.com/nothollyhigh/kiss/log"
	"github.com/nothollyhigh/kiss/net"
	"github.com/nothollyhigh/kiss/util"
	"net/http"
)

var (
	wsServer *net.WSServer

	fileSvr http.Handler
)

func startWsServer() {
	var err error

	wsServer, err = net.NewWebsocketServer("KISS", config.SvrAddr)
	if err != nil {
		log.Panic("NewWebsocketServer failed: %v", err)
	}

	// 前端静态资源
	fileSvr := http.FileServer(http.Dir("static"))
	wsServer.HandleHttp(fileSvr.ServeHTTP)

	// websocket路由
	wsServer.HandleWs("/plaza/ws")

	// websocket协议号
	wsServer.Handle(CMD_LOGIN_REQ, onLoginReq)

	util.Go(func() {
		wsServer.Serve()
	})
}
