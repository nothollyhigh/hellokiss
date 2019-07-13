package app

import (
	"github.com/nothollyhigh/kiss/net"
)

const (
	CMD_LOGIN_REQ        uint32 = 1 // 登录请求
	CMD_LOGIN_RSP        uint32 = 2 // 登录响应
	CMD_BROADCAST_NOTIFY uint32 = 3 // 广播通知
)

type LoginReq struct {
}

type LoginRsp struct {
	Code int    `json:"code"`
	Msg  string `json:"msg"`
	Name string `json:"name"`
}

type KickNotify struct {
	Msg string `json:"msg"`
}

type BroadcastNotify struct {
	Msg string `json:"msg"`
}

func NewMessage(cmd uint32, v interface{}) *net.Message {
	data, ok := v.([]byte)
	if !ok {
		data, _ = json.Marshal(v)
	}
	return net.NewMessage(cmd, data)
}
