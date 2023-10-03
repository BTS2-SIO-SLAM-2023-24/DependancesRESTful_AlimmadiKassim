import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/Logging';


// Création d'une instance d'Express
const router = express();

/** Connexion à la base de données MongoDB */
mongoose
    .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
        Logging.info('Mongo connected successfully.');
        StartServer();
    })
    .catch((error) => Logging.error(error));

/** Démarrage du serveur Express uniquement si la connexion à MongoDB réussi */
const StartServer = () => {
    /** Middleware pour journaliser les requêtes entrantes et les réponses sortantes */
    router.use((req, res, next) => {
        /** Journalisation de la requête entrante */
        Logging.info(`Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

        res.on('finish', () => {
         /** Journalisation de la réponse sortante après l'envoi au client */
            Logging.info(`Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`);
        });

        next();
        http.createServer(router).listen(config.server.port, () => Logging.info(`Server is running on port ${config.server.port}`));
}) }
