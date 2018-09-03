/*eslint no-console: 0*/

export default function promiseLogResalts(pResults) {
	pResults.forEach(pResult => {
		console.log('Processed:', pResult.sourceFiles)
		console.log('output:', pResult.outputFiles)
	})

	return Promise.resolve(pResults)
}