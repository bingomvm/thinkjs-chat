// 因为redis也算一个数据库
// 因此最好和redis的交流有一个比较规范的接口
// 不要随意使用redis原生方法
// 便于以后调整优化切换等
// 另外由于我很懒
// 所以我包了一些promise
const redis = require('redis');
const redisConfig = think.config('redis');
class Redis {
  constructor() {
    this.link = redis.createClient(redisConfig);
    this.link.on('error', this.error);
    const utils = redis.RedisClient.prototype;
    for (const name in utils) {
      this[name] = this.promisify(utils[name]);
    }
  }
  error(err) {
    console.error(err);
  }
  promisify(fn) {
    return (...args) => {
      return new Promise((resolve, reject) => {
        fn.call(this.link, ...args, (err, obj) => {
          return err ? reject(err) : resolve(obj);
        });
      });
    };
  }
}

global.rediser = new Redis();
