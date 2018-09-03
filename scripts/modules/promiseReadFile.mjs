import path from 'path'
import fs from 'fs'

export default function promiseReadFile(pPath) {
	const absolutePath = path.resolve(pPath)

	return new Promise((pResolve, pReject) => {
		fs.readFile(absolutePath, 'utf8', (pError, pContent) => {
			if (pError) {
				pReject(pError)
			} else {
				pResolve(pContent)
			}
		})
	})
}
