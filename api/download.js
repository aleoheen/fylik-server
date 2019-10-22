const express = require('express');

const router = express.Router();

require('../core/funcs').then(({
	$db, consola, fs, rand, err
}) => {

	let collection = $db.collection('files');

	router.get('/:uid', (req, res) => {

		let {uid} = req.params;

		/* === === === === === */
		/* Check uid correction
		/* === === === === === */

		if(!(/^[a-f\d]{4}$/).test(uid)) return err(res, 'Incorrect file uid', 400);

		/* === === === === === */
		/* Get file info from DB
		/* === === === === === */

		collection.
		findOne({uid}).
		then((file) => {
			
			/* === === === === === */
			/* If file doesn't exist
			/* === === === === === */

			if(!file) return err(res, 'File not found', 404);

			/* === === === === === */
			/* Send file to client
			/* === === === === === */

			res.set({
				'Content-Disposition': `inline; filename="${encodeURI(file.name)}"`
			});
			res.sendFile(file.path);

		}).
		catch(error => err(res, error));

	});

})

module.exports = router;