const express = require('express');

const router = express.Router();

require('../core/funcs').then(({
	$db, consola, fs, rand, err
}) => {

	let collection = $db.collection('files');

	router.get('/', (req, res) => {

		let {offset} = req.query;
		if(!offset) offset = 0;
		offset = +offset;

		if(isNaN(offset)) err(res, 'Incorrect offset', 400);

		/* === === === === === */
		/* Fetch file list
		/* === === === === === */

		collection
			.countDocuments()
			.then((totalAmount) => {

				return collection
					.find({})
					.skip(offset)
					.limit(50)
					.toArray()
				.then((files) => {
					
					return res.status(200).send({
						code: 200,
						files: files.map((file) => {
							file._id = undefined,
							file.path = undefined

							return file
						}),
						total: totalAmount,
						now: Date.now()
					});

				})

			})
		.catch(error => err(res, error));

	});

})

module.exports = router;