var Websocket = require("Websocket");

cc.Class({
    extends: cc.Component,

    properties: {
        count: 0,
        wsUrl: "ws://localhost:8888/plaza/ws",

        //plazaTxt: cc.Label,

        CMD_PING: 0x1 << 24,
        CMD_LOGIN_REQ: 1, //登录请求
        CMD_LOGIN_RSP: 2, //登录相应
        CMD_BROADCAST_NOTIFY: 3, //广播通知
    },

    // use this for initialization
    onLoad: function () {
        var self = this;

        if (!cc.plazaWs) {
            if (!cc.plazaHandlers) {
                cc.plazaHandlers = {};    
            }

            cc.plazaWs = new Websocket();
            cc.plazaWs.init(self);
            
            cc.plazaWs.handle(self, self.CMD_LOGIN_RSP, self.onLoginRsp);
            cc.plazaWs.handle(self, self.CMD_BROADCAST_NOTIFY, self.onBroadcastNotify);

            // cc.log = console.log;
        }
    },

    onWsOpen: function(self) {
        if (cc.plazaWs) {
            cc.log('Plaza onWsOpen');
            
            if (!self.keepalive) {
                self.keepalive = true
                
                self.schedule(function() {
                    if (cc.plazaWs) {
                        cc.plazaWs.sendMsg(self.CMD_PING);
                    }
                }, 30);
            }

            cc.plazaWs.sendMsg(self.CMD_LOGIN_REQ, {});
        }
    },

    onWsClose: function(self) {
        cc.log('Plaza onWsClose', new Date());
        self.scheduleOnce(function() {
            cc.plazaWs.init(self);
        }, 1)
    },

    onWsError: function(self) {
        cc.log('Plaza onWsError');
        // self.scheduleOnce(function() {
        //     cc.plazaWs = new Websocket();
        //     cc.plazaWs.init(this);
        // }, 1)
    },

    onLoginRsp: function(self, cmd, data) {
        self.count++
        cc.log("Plaza onLoginRsp cmd:", cmd, "data:", data, self.count);
        if (!self.textNode) {
            self.textNode = new cc.Node('Label');
            var label = self.textNode.addComponent(cc.Label);
            label.string = data.msg;
            self.textNode.color = new cc.Color(0, 0, 255);
            self.textNode.parent = self.node;
            self.textNode.setPosition(0, 200);
        }
    },

    onBroadcastNotify: function(self, cmd, data) {
        self.count++
        var label = self.textNode.getComponent(cc.Label);
        label.string = data.msg;
        cc.log("Plaza onBroadcastNotify cmd:", cmd, "data:", data, self.count);
    },

    // called every frame
    update: function (dt) {

    },
});
