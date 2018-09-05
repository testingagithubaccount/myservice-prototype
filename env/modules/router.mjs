import express from 'express'
import path from 'path'
import promiseReadFile from './promiseReadFile'

const router = express.Router()

export default router

router.get('*', (pRequest, pResponse) => {
	const directory = path.dirname(pRequest.path).substr(1)
	const file = path.basename(pRequest.path) || 'index'
	const urlPath = path.join(directory, file)

	if (path.extname(file)) {
		pResponse.send(urlPath)
	} else {
		const myPath = path.resolve('build/css/components.json') // YUCK!!!
		promiseReadFile(myPath)
			.then(pContent => {
				pResponse.render(urlPath, JSON.parse(pContent))
			})
	}
})