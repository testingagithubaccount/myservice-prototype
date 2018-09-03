import mkdirp from 'mkdirp'

export default function promiseMakeDir(pDirectory, pOptions) {
	return new Promise((pReslove, pReject) => {
		mkdirp(pDirectory, pOptions, (pError, pMade) => {
			if (pError) {
				pReject(pError)
			} else {
				pReslove(pMade)
			}
		})
	})
}