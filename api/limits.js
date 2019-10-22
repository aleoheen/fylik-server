const express = require('express');

const router = express.Router();

require('../core/funcs').then(({
	$db, consola, fs, rand, err
}) => {

	router.get('/', (req, res) => {

		res.send({
			max_files_amount: +process.env.MAX_FILES_AMOUNT,
			max_file_size: +process.env.MAX_FILE_SIZE
		});

	});

})

module.exports = router;