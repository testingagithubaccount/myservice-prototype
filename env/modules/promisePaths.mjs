import glob from 'glob'

export default function promisePaths(pPaths) {
	const paths = pPaths === 'string' ? [pPaths] : pPaths

	if (!(paths instanceof Array)) {
		return Promise.reject(new Error('Paths argument must be a string or instance of Array'))
	}

	return Promise.all(paths.map(pPath => {
		if (glob.hasMagic(pPath)) {
			return new Promise((pResolve, pReject) => {
				glob(pPath, (pError, pPaths) => {
					pError ? pReject(pError) : pResolve(pPaths)
				})
			})
		} else {
			return Promise.resolve(pPath)
		}
	})).then(pArrays => {
		const paths = pArrays.reduce((pAccumulator, pArray) => {
			return pAccumulator.concat(pArray)
		}, [])

		return Promise.resolve(paths)
	})
}