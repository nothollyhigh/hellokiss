package app

import (
	"github.com/gorilla/websocket"
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
	var cipher = net.NewCipherGzip(10240)

	wsServer, err = net.NewWebsocketServer("KISS", config.SvrAddr)
	if err != nil {
		log.Panic("NewWebsocketServer failed: %v", err)
	}

	wsServer.MessageType = websocket.BinaryMessage

	wsServer.HandleNewCipher(func() net.ICipher { return cipher })

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
