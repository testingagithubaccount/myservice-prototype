import path from 'path'
import fs from 'fs'
import promiseMakeDir from './promiseMakeDir'

export default function promiseCopyFile(pSource, pDestination) {
	const absoluteSourcePath = path.resolve(pSource)
	const absoluteDestinationPath = path.resolve(pDestination)

	return promiseMakeDir(path.dirname(absoluteDestinationPath))
		.then(() => {
			const readStream = fs.createReadStream(absoluteSourcePath)

			const promiseReadStream = new Promise((pResolve, pReject) => {
				readStream.on('close', () => pResolve(absoluteSourcePath))
				readStream.on('error', pError => pReject(pError))
			})

			const writeStream = fs.createWriteStream(absoluteDestinationPath)

			const promiseWriteStream = new Promise((pResolve, pReject) => {
				writeStream.on('close', () => pResolve(absoluteDestinationPath))
				writeStream.on('error', pError => pReject(pError))
			})

			readStream.pipe(writeStream)

			return Promise.all([
				promiseReadStream,
				promiseWriteStream,
			])
		})
}
