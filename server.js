const https = require('https');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const winston = require('winston');
const io = require('socket.io');
const cookieParser = require('cookie-parser');
const socketCookieParser = require('socket.io-cookie-parser');

const config = require('./config');
const router = require('./routing/routing');
const {Events} = require('./routing/events');
const Db = require('./db/db');

class Server {
    constructor() {
        this.app = express();
        this.app.use(bodyParser.json());
        this.app.use(cookieParser(config.vk_clientSecret));
        this.app.use(bodyParser.urlencoded({extended: false}));
        this.app.use(express.static(__dirname + '/frontend/dist'));

        this.init();
    }

    async init() {
        this.initEnv();
        this.initLog();
        this.initRouting();
        await this.initDb();
        this.createServer();
        this.initSockets();
    }

    initEnv() {
        process.env.NODE_ENV = process.env.NODE_ENV? process.env.NODE_ENV : 'dev';
        console.log('Init env:', process.env.NODE_ENV);
    }

    initLog() {
        try {
            const transports = process.env.NODE_ENV === 'dev'?
                [
                    new winston.transports.Console({})
                ] :
                [
                    new winston.transports.File({ filename: 'error.log', level: 'error'}),
                    new winston.transports.File({ filename: 'combined.log', })
                ];

            this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'debug',
            format: winston.format.combine(winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}), winston.format.simple()),
            transports: transports
        });
        } catch (e) {
            console.log(`Can't init log:`, e);
            process.exit(1)
        }

    }

    initRouting() {
        this.app.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        this.app.use(router)
    }

    async initDb() {
        try {
            this.db = await new Db(config.db);
            this.db.initModels();
            this.logger.info("Db connected");
        } catch (e) {
            this.logger.error(`can't connect to db: ${e}`);
            process.exit(1);
        }
    }

    initSockets() {
        this.io = io(this.server);
        this.io.use(socketCookieParser());
        const events = new Events(this.io, this.db, this.logger, config);
        this.io.on('connection', events.initEvents.bind(events));
    }

    createServer() {
        const port = process.env.PORT || 443;
        const credentials = {
            key: fs.readFileSync('key.pem'),
            cert: fs.readFileSync('cert.pem')
        };

        this.server = https.createServer(credentials, this.app);

        this.server.listen(port, () => {
            this.logger.info(`Start listening on localhost:${port}`)
        });
    }
}

module.exports = new Server();