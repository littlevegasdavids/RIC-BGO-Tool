const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')

const logFormat = winston.format.combine(
    winston.format.colorize(), 
    winston.format.timestamp(), 
    winston.format.align(), 
    winston.format.printf(
        info => `${info.level} - ${info.timestamp.split('T')[1].split('.')[0]}: ${info.message}`
    )
)

const transport = new DailyRotateFile({
    filename: './logs/%DATE%.log',

    datePattern: 'YYYY-MM-DD', 

    zippedArchive: true, 

    maxSize: '20m', 

    maxFiles: '14d',

    prepend: true
})

const logger = winston.createLogger({
    format: logFormat,
    transports:[
        transport, 
        new winston.transports.Console({
            level: 'info'
        })
    ] 
})

module.exports = logger;