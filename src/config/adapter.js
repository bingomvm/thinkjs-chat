const fileCache = require('think-cache-file');
const nunjucks = require('think-view-nunjucks');
const redisSession = require('think-session-redis');
const mysql = require('think-model-mysql');
const { Console, File, DateFile } = require('think-logger3');
const path = require('path');
const isDev = think.env === 'development';
const config = require('./config.js');
const socketio = require('think-websocket-socket.io');

/**
 * cache adapter config
 * @type {Object}
 */
exports.cache = {
  type: 'file',
  common: {
    timeout: 24 * 60 * 60 * 1000, // millisecond
  },
  file: {
    handle: fileCache,
    cachePath: path.join(think.ROOT_PATH, 'runtime/cache'), // absoulte path is necessarily required
    pathDepth: 1,
    gcInterval: 24 * 60 * 60 * 1000, // gc interval
  },
};

/**
 * model adapter config
 * @type {Object}
 */
exports.model = {
  type: 'mysql',
  common: {
    logConnect: isDev,
    logSql: isDev,
    logger: msg => think.logger.info(msg),
  },
  mysql: {
    handle: mysql,
    database: '',
    prefix: 'think_',
    encoding: 'utf8',
    host: '127.0.0.1',
    port: '',
    user: 'root',
    password: 'root',
    dateStrings: true,
  },
};

/**
 * session adapter config
 * @type {Object}
 */
exports.session = {
  type: 'redis',
  common: {
    cookie: {
      name: 'thinkjs'
    }
  },
  redis: {
    handle: redisSession,
    maxAge: '1d',
    ...config.redis
  }
};

/**
 * view adapter config
 * @type {Object}
 */
exports.view = {
  type: 'nunjucks',
  common: {
    viewPath: path.join(think.ROOT_PATH, 'view'),
    sep: '_',
    extname: '.html',
  },
  nunjucks: {
    handle: nunjucks,
    options: {
      tags: {
        // 修改定界符相关的参数
        variableStart: '{=',
        variableEnd: '=}',
      },
    },
  },
};

/**
 * logger adapter config
 * @type {Object}
 */
exports.logger = {
  type: isDev ? 'console' : 'dateFile',
  console: {
    handle: Console,
  },
  file: {
    handle: File,
    backups: 10, // max chunk number
    absolute: true,
    maxLogSize: 50 * 1024, // 50M
    filename: path.join(think.ROOT_PATH, 'logs/app.log'),
  },
  dateFile: {
    handle: DateFile,
    level: 'ALL',
    absolute: true,
    pattern: '-yyyy-MM-dd',
    alwaysIncludePattern: true,
    filename: path.join(think.ROOT_PATH, 'logs/app.log'),
  },
};
/**
 * websocket adapter config
 * @type {Object}
 */
exports.websocket = {
  type: 'socketio',
  common: {},
  socketio: {
    handle: socketio,
    messages: {
      open: '/websocket/open', // 建立连接时处理对应到 websocket Controller 下的 open Action
      close: '/websocket/close', // 关闭连接时处理的 Action
      message: '/websocket/message', // 数据中转 Action
      room: '/websocket/room', // 数据中转 Action
    }
  }
};
