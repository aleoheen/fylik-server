const consola = require('consola');
const fs = require('fs').promises;
const mongodb = require('mongodb');

module.exports = (async () => {

	/* === === === === === */
	/* Connect to DB
	/* === === === === === */
	
	let client = await mongodb.connect(`mongodb://${process.env.DB_HOST}`, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});

	let $db = client.db(process.env.DB_NAME);

	/* === === === === === */
	/* Define functions
	/* === === === === === */

	return {

		consola, fs, $db,

		/* === === === === === */
		/* Random number generator
		/* === === === === === */

		rand(min = 0, max = 1) {
			return Math.floor(Math.random() * (+max-+min) + +min);
		},

		/* === === === === === */
		/* Error hadler
		/* === === === === === */

		err(res, error, code = 500) {

			let isError = typeof error === 'object';
			
			if(isError) {
				consola.error(error);
			}

			return res.status(code).send({
				code,
				details: isError ? error.message : error
			});

		}
	}

})()