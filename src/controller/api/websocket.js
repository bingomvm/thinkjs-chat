const Base = require('../base');

module.exports = class extends Base {
  async syncAction() {
    const {action, data} = this.post();
    const blackApi = ['room', 'message', 'close', 'open'];
    if (!blackApi.includes(action)) return this.fail();
    global.$socketChat.io && global.$socketChat.io.emit(action, JSON.parse(data))
  }
};
