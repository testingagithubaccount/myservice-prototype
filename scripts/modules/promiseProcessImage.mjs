import path from 'path'
import promiseCopyFile from './promiseCopyFile'

export default function promiseProcessImage(pPath, pDestination) {
	const fileName = path.basename(pPath)
	const outputPath = path.join(pDestination, fileName)

	return promiseCopyFile(pPath, outputPath)
		.then(pResults => {
			return Promise.resolve({
				entryPoint: pResults[0],
				sourceFiles: pResults[0],
				outputFiles: pResults[1],
			})
		})
}
