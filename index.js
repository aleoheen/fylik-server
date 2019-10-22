require('dotenv').config();

/* === === === === === */
/* Require modules
/* === === === === === */

const express = require('express');
const rateLimiter = require('express-rate-limit');
const cors = require('cors');
const consola = require('consola');

/* === === === === === */
/* Vars and sets
/* === === === === === */

const app = express();

app.set('trust proxy', true);

/* === === === === === */
/* Enable CORS
/* === === === === === */

app.use(cors());

/* === === === === === */
/* Expose headers
/* === === === === === */

app.use((req, res, next) => {
	res.set({'Access-Control-Expose-Headers': 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset'});

	next();
});

/* === === === === === */
/* Handle API methods
/* === === === === === */

app.use('/upload', rateLimiter({
	windowMs: process.env.MAX_FILE_TERM * 1000,
	max: process.env.MAX_FILES_AMOUNT,
	skipFailedRequests: true,
	message: {
		code: 429,
		details: 'Sorry, but you\'ve uploaded too many files. Please try again later. You file wasn\'t saved'
	},
}), require('./api/upload'));

app.use('/dl', rateLimiter({
	windowMs: 1000 * 60 * 60,
	max: 100,
	message: {
		code: 429,
		details: 'Sorry, but you\'ve reached limit of downloading files. Please wait a few time.'
	},
}), require('./api/download'));

app.use('/list', rateLimiter({
	windowMs: 1000 * 60 * 60,
	max: 100,
	message: {
		code: 429,
		details: 'Sorry, but you\'ve reached limit of requests to the server. Please wait a few time.'
	},
}), require('./api/list'));

app.use('/last', require('./api/last'));
app.use('/limits', require('./api/limits'));

/* === === === === === */
/* Method not found
/* === === === === === */

app.use((req, res) => {
	res.status(404).send({
		code: 404,
		details: `Sorry, but method "${req.url}" is not found`
	})
});

/* === === === === === */
/* Start server
/* === === === === === */

app.listen(process.env.HTTP_PORT, process.env.HTTP_IP, () => {
	consola.success(`Server runned at http://${process.env.HTTP_IP}:${process.env.HTTP_PORT}`);
});

/* === === === === === */
/* Autoremove files
/* === === === === === */

require('./core/deleteOldFiles.js');