const express = require('express');
const router = express.Router();

const longpoll = require('express-longpoll')(router);

require('../core/funcs').then(({
	$db, consola, fs, rand, err
}) => {

	let collection = $db.collection('files');

	longpoll.create('/');

	let update = () => {
		return collection
			.find({})
			.sort({_id: -1})
			.limit(50)
			.toArray()
			.then((files) => {
				
				return longpoll.publish('/', {
					code: 200,
					files: files.map((file) => {
						file._id = undefined,
						file.path = undefined

						return file
					}),
					now: Date.now()
				});

			})
		.catch(consola.error);
	}

	update();
	setInterval(update, 1000);

})

module.exports = router;