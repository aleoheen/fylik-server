const express = require('express');
const {IncomingForm} = require('formidable');

const router = express.Router();

require('../core/funcs').then(({
	$db, consola, fs, rand, err
}) => {

	let collection = $db.collection('files');

	router.post('/', (req, res) => {

		/* === === === === === */
		/* Read post data
		/* === === === === === */
		
		let form = new IncomingForm();

		form.maxFileSize = process.env.MAX_FILE_SIZE * 1024 * 1024;
		form.keepExtensions = true;
		form.uploadDir = process.env.UPLOAD_DIR;

		form.parse(req, (error, fields, files) => {

			let {file} = files;

			/* === === === === === */
			/* Check if an error
			/* === === === === === */

			if(error) return err(res, error);

			/* === === === === === */
			/* If many files or bad request
			/* === === === === === */

			let fileList = Object.keys(files);

			if(fileList.length > 1 || !file) {

				/* === === === === === */
				/* Delete bad files
				/* === === === === === */

				return fileList.forEach((_file) => {

					fs
						.unlink(files[_file].path)
						.then(() => err(res, 'You must upload only one file as "file" parameter', 400))
					.catch(error => err(res, error));

				});

			}

			/* === === === === === */
			/* Prevent file storage filling over
			/* === === === === === */

			collection
				.find()
				.toArray()
				.then((files) => {

					/* === === === === === */
					/* Calculate total files size and amount
					/* === === === === === */
					
					let sum = 0;
					let amount = 0;

					files.forEach((file) => {
						sum += file.size;
						amount++;
					});

					sum = sum / 1024 / 1024;

					/* === === === === === */
					/* If storage is filled up, supply an error
					/* === === === === === */

					if(process.env.FILE_STORAGE_SIZE <= sum || amount >= 65535 - 4096) {
						return fs.unlink(file.path)
						.then(() => {
							err(res, 'Sorry, but server file storage is exceeded. Your file is not saved :(', 507);
						})
					}

					/* === === === === === */
					/* Save file info to DB
					/* === === === === === */

					let saveFileToDB = () => {

						let uid = rand(4096, 65535).toString(16);
						let term = rand(process.env.MIN_FILE_TERM, process.env.MAX_FILE_TERM);

						/* === === === === === */
						/* Find files with same uid
						/* === === === === === */

						collection
							.findOne({uid})
							.then((sameUID) => {

								if(sameUID) return saveFileToDB();

								/* === === === === === */
								/* Save file to db
								/* === === === === === */

								return collection
								.insertOne({
									name: file.name,
									size: file.size,
									path: file.path,
									type: file.type,
									uid,
									link: `${process.env.FILE_BASE_URL}/dl/${uid}`,
									expires: Date.now() + term * 1000,
									timestamp: Date.now()
								})

							}).then(({ops}) => {
								
								res.status(201).send({
									code: 201,
									file: Object.assign({}, ops[0], {
										_id: undefined,
										path: undefined
									}),
									now: Date.now()
								});

								// Log it
								consola.success(`File ${ops[0].name} was uploaded to ${ops[0].path}`);

							})
						.catch(error => err(res, error));

					}

					saveFileToDB();

				})
			.catch(error => err(res, error));

		});

	});

})

module.exports = router;