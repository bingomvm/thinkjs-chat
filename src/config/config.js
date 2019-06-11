// default config
module.exports = {
  port: 8400,
  workers: 1,
  // 开启websocket
  stickyCluster: true,
  redis: {
    host: '127.0.0.1',
    port: '6379'
  },
};
