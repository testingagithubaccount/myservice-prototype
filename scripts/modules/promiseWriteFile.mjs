import path from 'path'
import fs from 'fs'
import promiseMakeDir from './promiseMakeDir'

export default function promiseWriteFile(pPath, pContent) {
	const absolutePath = path.resolve(pPath)

	return promiseMakeDir(path.dirname(absolutePath))
		.then(() => {
			return new Promise((pReslove, pReject) => {
				fs.writeFile(absolutePath, pContent, pError => {
					if (pError) {
						pReject(pError)
					} else {
						pReslove(absolutePath)
					}
				})
			})
		})
}
