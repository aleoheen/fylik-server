require('../core/funcs').then(({
	$db, consola, fs, rand
}) => {

	let collection = $db.collection('files');
	
	setInterval(() => {

		/* === === === === === */
		/* Find old files
		/* === === === === === */
		
		collection
			.find({expires: {$lt: Date.now()}})
			.toArray()
			.then((oldFiles) => oldFiles.forEach((file) => {
					
				/* === === === === === */
				/* Delete file from db
				/* === === === === === */

				collection
					.deleteMany({uid: file.uid})
					.then(() => fs.unlink(file.path))
					.then(() => {
						consola.success(`File ${file.name} was removed`);
					}).
				catch(consola.error);

			}))
		.catch(consola.error);

	}, 1000);

})