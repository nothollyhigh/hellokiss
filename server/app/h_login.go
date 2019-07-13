package app

import (
	"fmt"
	"github.com/nothollyhigh/kiss/log"
	"github.com/nothollyhigh/kiss/net"
	"sync/atomic"
)

var (
	count int64 = 0
)

func onLoginReq(client *net.WSClient, msg net.IMessage) {
	var (
		err error
		req = &LoginReq{}
		rsp = &LoginRsp{}
	)

	if err = json.Unmarshal(msg.Body(), req); err != nil {
		rsp.Code = -1
		rsp.Msg = "错误的json数据格式"
		client.SendMsgWithCallback(NewMessage(CMD_LOGIN_RSP, rsp), userMgr.KickClient)
		return
	}

	rsp.Msg = "登录成功"
	rsp.Name = fmt.Sprintf("guest_%v", atomic.AddInt64(&count, 1))

	userMgr.Add(rsp.Name, client)
	client.OnClose("disconnected", func(*net.WSClient) {
		userMgr.Delete(rsp.Name)
	})

	client.SendMsg(NewMessage(CMD_LOGIN_RSP, rsp))

	userMgr.Broadcast(fmt.Sprintf("欢迎 %v 进入游戏！", rsp.Name))

	log.Info("onLoginReq success: %v", rsp.Name)
}
