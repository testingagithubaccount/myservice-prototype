import express from 'express'
import path from 'path'

const router = express.Router()

export default router

router.get('*', (pRequest, pResponse) => {
	const directory = path.dirname(pRequest.path).substr(1)
	const file = path.basename(pRequest.path) || 'index'
	const urlPath = path.join(directory, file)

	if (path.extname(file)) {
		pResponse.send(urlPath)
	} else {
		pResponse.render(urlPath)
	}
})