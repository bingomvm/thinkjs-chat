const ni = require('network-interfaces');
const request = require('request-promise');
let host = '';
let hostCount = 1;
/**
   *
   * this.socket为当前连接的socket实例，this.io.sockets.connected：当前所有连接的sockets，格式为：{socket_id: {socket实例}}。
   */
module.exports = class extends think.Controller {
  constructor(...arg) {
    super(...arg);
    this.io = this.ctx.req.io;
    this.socket = this.ctx.req.websocket;
    global.$socketChat.io = this.io;
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
    await global.rediser.hset(`-socket-chat`, host, hostCount++);
    this.socket.emit('open', 'hi friend')
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
    const nickname = global.$socketChat[this.socket.id] && global.$socketChat[this.socket.id].nickname;
    const data = {
      nickname,
      type: 'out',
      id: this.socket.id
    };
    this.socket.disconnect(true);
    this.socket.removeAllListeners();
    this.emit('room', data);
    delete global.$socketChat[this.socket.id];
    if (hostCount > 1) {
      hostCount--;
    } else {
      await global.rediser.hdel('-socket-chat', host);
    }
  }
  async crossSync(action, params) {
    const ips = await global.rediser.hkeys('-socket-chat');
    ips.forEach(ip => {
      if (host === ip) return;
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
