var pako = require('pako');

class Websocket{
    // use this for initialization
    init(wsImpl) {
        var self = this;
        
        self.wsImpl = wsImpl;

        self.CmdPing = 0x1 << 24;

        self.SOCK_STATE_CLOSED = 0;
        self.SOCK_STATE_CONNECTING = 1;
        self.SOCK_STATE_CONNECTED = 2;
        self.CmdFlagMaskGzip = 1 << 31;

        self.state = self.SOCK_STATE_CONNECTING;

        try {
            if ('WebSocket' in window) {
                self.ws = new WebSocket(wsImpl.wsUrl);
            } else if ('MozWebSocket' in window) {
                self.ws = new MozWebSocket(wsImpl.wsUrl);
            } else {
                self.ws = new SockJS(wsImpl.wsUrl);
            }

            // 消息类型,不设置则默认为'text'
            self.ws.binaryType = 'arraybuffer';

            self.state = self.SOCK_STATE_CONNECTING;


            self.ws.onopen = function (event) {
                self.state = self.SOCK_STATE_CONNECTED;


                if (wsImpl.onWsOpen) {
                    wsImpl.onWsOpen(wsImpl);
                }
            };
            self.ws.onclose = function (event) {
                if (wsImpl.onWsClose) {
                    wsImpl.onWsClose(wsImpl);
                }

                self.ws.close();

                // shutdown
                if (self.state == self.SOCK_STATE_CLOSED) {
                    return;
                }

                self.state = self.SOCK_STATE_CONNECTING;
                
                // self.init(wsImpl);
            };
            self.ws.onerror = function (event) {
                if (wsImpl.onWsError) {
                    wsImpl.onWsError(wsImpl);
                }
            };

            self.ws.onmessage = function(event) {
                if (self.ws.binaryType == 'arraybuffer') {
                    self.onBinaryMessage(self, event);    
                } else {
                    self.onTextMessage(self, event);
                }
            }
        } catch (e) {
            cc.log("Websocket constructor failed:", e);
        }
    }

    handle(instance, cmd, cb) {
        var self = this;
        if (!self.handlers) {
            self.handlers = {};
        }
        self.handlers[cmd] = {instance: instance, cb: cb};
    }

    onTextMessage(self, event) {
        var self = this;
        try {
            var arr = new TextEncoder("utf-8").encode(event.data.slice(0,16));
            var length = arr[0] | arr[1]<<8 | arr[2]<<16 | arr[3]<<24;
            var cmd = arr[4] | arr[5]<<8 | arr[6]<<16 | arr[7]<<24;
            if (cmd == self.CmdPing) { return };
            var data;
            if (event.data.length > 16) {
                data = JSON.parse(event.data.slice(16, event.data.length));
            }
            // cc.log("onmessage data: ", data);
            self.onMessage(cmd, data)
        } catch(e) {
            cc.log("Websocket onmessage panic:", e);
        }
    }

    onBinaryMessage(self, event) {
        try {
            var headArr = new Uint8Array(event.data.slice(0, 16));
            var bodyArr = new TextDecoder("utf-8").decode(event.data.slice(16, event.data.length));
            var length = headArr[0] | headArr[1]<<8 | headArr[2]<<16 | headArr[3]<<24;
            var cmd = headArr[4] | headArr[5]<<8 | headArr[6]<<16 | headArr[7]<<24;
            // console.log("--- 111 cmd: ", cmd, self.CmdFlagMaskGzip, cmd & self.CmdFlagMaskGzip, cmd & self.CmdFlagMaskGzip == self.CmdFlagMaskGzip)
            if ((cmd & self.CmdFlagMaskGzip) == self.CmdFlagMaskGzip) {
                cmd = (cmd << 1) >> 1;
                // console.log("--- 222 cmd: ", cmd)
                bodyArr = pako.inflate(bodyArr);
            }
            if (cmd == self.CmdPing) { return };
            var data;
            if (length > 0 && bodyArr.length > 16) {
                data = JSON.parse(bodyArr);
            }
            self.onMessage(cmd, data)
        } catch(e) {
            cc.log("Websocket onmessage panic:", e);
        }
    }

    onMessage(cmd, data) {
        var self = this;
        if (self.handlers) {
            var handler = self.handlers[cmd];
            if (handler) {
                handler.cb(handler.instance, cmd, data)
            } else {
                cc.log("no handler for cmd:", cmd);
            }
        }
    }

    sendMsg(cmd, data) {
        var self = this;
        
        if (self.state != self.SOCK_STATE_CONNECTED) {
            cc.log("sendMsg failed: websocket disconnected")
            return
        }

        if (self.ws) {
            var length = 0;
            var dataArr;
            if (data) {
                dataArr = new TextEncoder("utf-8").encode(JSON.stringify(data));    
                length = dataArr.length;
            }
            var buffer = new Uint8Array(16+length);
            buffer[0] = length % 256;
            buffer[1] = (length >> 8) % 256;
            buffer[2] = (length >> 16) % 256;
            buffer[3] = (length >> 24) % 256;
            buffer[4] = cmd % 256;
            buffer[5] = (cmd >> 8) % 256;
            buffer[6] = (cmd >> 16) % 256;
            buffer[7] = (cmd >> 24) % 256;
            if (dataArr) {
                for (var i=0; i<length; i++) {
                    buffer[16+i] = dataArr[i];
                }
            }
            self.ws.send(buffer);
            // cc.log("sendMsg:", buffer)
            // cc.log("sendMsg:", dataArr)
        }
    }

    shutdown() {
        self.ws.close();
        self.state = self.SOCK_STATE_CLOSED;
    }
}

module.exports = Websocket;
