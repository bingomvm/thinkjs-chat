const request = require('request-promise');
let host = '';
/**
   *
   * this.socket 为发送消息的客户端对应的 socket 实例， this.io 为Socket.io 的一个实例
   */
module.exports = class extends think.Controller {
  constructor(...arg) {
    super(...arg);
    this.io = this.ctx.req.io;
    this.socket = this.ctx.req.websocket;
    global.$socketChat.io = this.io;
    // demo只是实现了本地服务两个端口的通信，正常情况请使用 network-interfaces 等库来获取ip
    if (this.header('host')) {
      host = this.header('host');
    }
  }

  emit(action, data) {
    if (action === 'message') {
      this.io.emit(action, data)
    } else {
      this.socket.broadcast.emit(action, data);
    }
    this.crossSync(action, data)
  }

  async openAction() {
    host = this.header('host');
    await global.rediser.hset(`-socket-chat`, host, 1);
    this.socket.emit('open', 'connect success')
  }
  
  async messageAction() {
    const data = {
      nickname: this.wsData.nickname,
      type: 'message',
      message: this.wsData.message,
      id: this.socket.id
    };
    this.emit('message', data)
  }

  async roomAction() {
    const data = {
      nickname: this.wsData.nickname,
      type: 'in',
      id: this.socket.id
    };
    global.$socketChat[this.socket.id] = {
      nickname: this.wsData.nickname,
      socket: this.socket
    }
    this.emit('room', data)
  }
  
  async closeAction() {
    const connectSocketCount = Object.keys(this.io.sockets.connected).length;
    const closeSocket = global.$socketChat[this.socket.id];
    const nickname = closeSocket && closeSocket.nickname;
    const data = {
      nickname,
      type: 'out',
      id: this.socket.id
    };
    this.socket.disconnect(true);
    this.socket.removeAllListeners();
    this.emit('room', data);
    delete global.$socketChat[this.socket.id];
    if (!connectSocketCount) {
      await global.rediser.hdel('-socket-chat', host);
    }
  }
  async crossSync(action, params) {
    const ips = (await global.rediser.hkeys('-socket-chat')).filter(ip => ip !== host);
    ips.forEach(ip => {
      request({
        method: 'POST',
        uri: `http://${ip}/api/websocket/sync`,
        form: {
          action,
          data: JSON.stringify(params)
        },
        json: true
      });
    })
  }
};
