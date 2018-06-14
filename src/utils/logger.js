const Winston = require('winston'),
    ExpressWinston = require('express-winston'),
    WinstonGraylog2 = require('winston-graylog2'),
    Logentries = require('le_node')


const GRAYLOG_HOST = process.env.GRAYLOG_HOST || 'graylog.cb.lk',
    GRAYLOG_PORT = process.env.GRAYLOG_PORT || 12201,
    NODE_ENV = process.env.NODE_ENV || 'development'


const config = require('../../config')

const GrayLogger = new WinstonGraylog2({
    name: 'oneauth',
    level: 'debug',
    silent: false,
    handleExceptions: true,

    prelog: (msg) => {
        return msg.trim()
    },

    graylog: {
        servers: [{host: GRAYLOG_HOST, port: GRAYLOG_PORT}],
        facility: 'oneauth',
        bufferSize: 1400
    },

    staticMeta: {
        env: NODE_ENV
    }
})


let transports = [GrayLogger]
if (config.DEPLOY_CONFIG === 'heroku') {
    transports = [new Winston.transports.Logentries({
        json: true,
        token: process.env.LOGENTRIES_TOKEN
    })]
}

const expressLogger = ExpressWinston.logger({
    transports,
    meta: true,
    msg: "HTTP {{req.method}} {{req.url}}",
    expressFormat: true,
    colorize: false
})

module.exports.expressLogger = expressLogger
