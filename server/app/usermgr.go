package app

import (
	"fmt"
	"github.com/nothollyhigh/kiss/log"
	"github.com/nothollyhigh/kiss/net"
	"sync"
	"time"
)

var (
	userMgr = &UserMgr{
		users: map[string]*net.WSClient{},
	}
)

type UserMgr struct {
	sync.RWMutex
	users map[string]*net.WSClient
}

func (mgr *UserMgr) Add(name string, client *net.WSClient) {
	mgr.Lock()
	defer mgr.Unlock()

	mgr.users[name] = client
}

func (mgr *UserMgr) Delete(name string) {
	mgr.Lock()
	defer mgr.Unlock()

	delete(mgr.users, name)
}

func (mgr *UserMgr) KickClient(client *net.WSClient, err error) {
	client.Stop()
}

func (mgr *UserMgr) Broadcast(msg string) {
	mgr.RLock()
	defer mgr.RUnlock()

	for _, client := range mgr.users {
		client.SendMsg(NewMessage(CMD_BROADCAST_NOTIFY, &BroadcastNotify{Msg: msg}))
	}

	log.Info("Broadcast to %d clients: %v", len(mgr.users), msg)
}

func (mgr *UserMgr) BroadcastLoop() {
	for i := 0; true; i++ {
		time.Sleep(time.Second * 3)
		mgr.Broadcast(fmt.Sprintf("广播消息 %v", i))
	}
}
