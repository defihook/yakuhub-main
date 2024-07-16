import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer, ForbiddenError } from 'apollo-server-core';

import helmet from 'helmet';
import axios from 'axios';
import express from 'express';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { createServer } from 'http';

import typeDefs from './graphql/schemas/schemas';
import resolvers from './graphql/resolvers/resolvers';
// Data Sources
import MagicEdenAPI from './graphql/datasources/magiceden';
import DropsAPI from './graphql/datasources/drops';
import HyperspaceAPI from './graphql/datasources/hyperspace';
import CoinGeckoAPI from './graphql/datasources/coingecko';
import SolScanAPI from './graphql/datasources/solscan';
import GemsAPI from './graphql/datasources/gems';

import loggerConfig from './config/loggerConfig';

import mongoose from 'mongoose';
import { makeExecutableSchema } from '@graphql-tools/schema';
import isAuthenticated from './graphql/directives/isAuthenticated';
import { CronJob } from 'cron';
import runCronJob from './helpers/event-notifications';
import IndexRPCAPI from './graphql/datasources/indexRpc';
import CoralAPI from './graphql/datasources/coral';
import NFTAPI from './graphql/datasources/nft';
import ManagementAPI from './graphql/datasources/management';

require('dotenv').config();

const { SESSION_NAME, SESSION_SECRET, SESSION_MAX_AGE, MONGO_DB_URI, PORT, REACT_APP_ENV } = process.env;
const FILE_SIZE_LIMIT = '4.5mb';

const port = PORT || 8080;

const app = express();
app.use(express.json());

const httpServer = createServer(app);
export const config = {
    api: {
        bodyParser: false
    }
};

const schema = isAuthenticated(makeExecutableSchema({ typeDefs, resolvers }), 'isAuthenticated');
// logging with morgan
if (REACT_APP_ENV === 'development') {
    loggerConfig(app);
}

async function startServer() {
    // Secure Headers with Helmet
    app.use(helmet());
    app.use(helmet.permittedCrossDomainPolicies());
    app.use(express.json({ limit: FILE_SIZE_LIMIT }));
    app.use(express.urlencoded({ limit: FILE_SIZE_LIMIT }));
    app.use(
        session({
            store: connectMongo.create({ mongoUrl: MONGO_DB_URI }),
            name: SESSION_NAME,
            secret: SESSION_SECRET,
            resave: true,
            rolling: true,
            saveUninitialized: false,
            cookie: {
                maxAge: parseInt(SESSION_MAX_AGE, 10),
                sameSite: true,
                httpOnly: true,
                secure: REACT_APP_ENV.trim() !== 'development'
            }
        })
    );

    // proxy route
    app.get('/floor/:symbol', (req, res, next) => {
        const { symbol } = req.params;
        if (symbol) {
            axios
                .get(`https://api-mainnet.magiceden.dev/v2/collections/${symbol}/stats`)
                .then((resp) => {
                    const data = resp.data;
                    res.status(200).send(data);
                })
                .catch((err) => {
                    res.json({ err });
                });
        } else {
            res.send('no symbol included');
        }
    });

    const apolloServer = new ApolloServer({
        schema,
        dataSources: () => ({
            magicEdenAPI: new MagicEdenAPI(),
            dropsAPI: new DropsAPI(),
            hyperspaceAPI: new HyperspaceAPI(),
            coinGeckoAPI: new CoinGeckoAPI(),
            solscanAPI: new SolScanAPI(),
            indexRpcAPI: new IndexRPCAPI(),
            coralAPI: new CoralAPI(),
            gemsAPI: new GemsAPI(),
            nftAPI: new NFTAPI(),
            managementAPI: new ManagementAPI()
        }),
        csrfPrevention: true,
        cache: 'bounded',
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
        context: async ({ req, res }) => {
            const token = req.headers['x-token'];
            const yaku = process.env.YAKU;
            const context = { req, res };

            if (token) {
                try {
                    const user = await jwt.verify(token, yaku);
                    return { ...context, user };
                } catch (e) {
                    throw new ForbiddenError('Access Denied!');
                }
            }
            return context;
        }
    });

    // Start passport service
    app.use(passport.initialize());
    app.use(passport.session());
    await apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        cors: {
            credentials: true,
            allowMethods: ['GET', 'POST', 'OPTIONS'],
            origin: [
                '76.76.21.21',
                'http://localhost:3000',
                'https://yaku.ai/',
                'https://www.yaku.ai/',
                'https://hub.yaku.ai/',
                'https://app.yaku.ai/',
                'https://preview.yaku.ai/'
            ]
        },
        path: '/api/graphql',
        bodyParserConfig: {
            limit: FILE_SIZE_LIMIT
        }
    });

    // Run cron job for event notifications
    const job = new CronJob(
        '0 0 */1 * * *', // every hour
        () => runCronJob(),
        null,
        true,
        'America/Los_Angeles'
    );

    mongoose.connect(MONGO_DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    mongoose.connection.once('open', () => {
        app.listen(
            {
                port
            },
            () => {
                console.log(`Server running on port ${port}`);
            }
        );
    });
}

startServer();

export default httpServer;
