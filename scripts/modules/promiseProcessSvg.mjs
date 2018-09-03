import path from 'path'
import Svgo from 'svgo'
import promiseReadFile from './promiseReadFile'
import promiseWriteFile from './promiseWriteFile'

const svgo = new Svgo({
	floatPrecision: 2,
	plugins: [
		{ cleanupAttrs: true },
		{ removeDoctype: true },
		{ removeXMLProcInst: true },
		{ removeComments: true },
		{ removeMetadata: true },
		{ removeTitle: true },
		{ removeDesc: true },
		{ removeUselessDefs: true },
		{ removeEditorsNSData: true },
		{ removeEmptyAttrs: true },
		{ removeHiddenElems: true },
		{ removeEmptyText: true },
		{ removeEmptyContainers: true },
		{ removeViewBox: false },
		{ cleanupEnableBackground: true },
		{ convertStyleToAttrs: false },
		{ convertColors: true },
		{ convertPathData: true },
		{ convertTransform: true },
		{ removeUnknownsAndDefaults: true },
		{ removeNonInheritableGroupAttrs: true },
		{ removeUselessStrokeAndFill: true },
		{ removeUnusedNS: true },
		{ cleanupIDs: true },
		{ cleanupNumericValues: true },
		{ moveElemsAttrsToGroup: true },
		{ moveGroupAttrsToElems: true },
		{ collapseGroups: true },
		{ removeRasterImages: false },
		{ mergePaths: true },
		{ convertShapeToPath: true },
		{ sortAttrs: true },
		{ removeDimensions: true },
		{ removeAttrs: { attrs: '(stroke|fill)' } }
	]
})

/**
 * @param {string} pSource - Source file path
 * @param {string} pDestination - Destination folder path
 */
export default function promiseProcessSvg(pSource, pDestination) {
	const fileName = path.basename(pSource)

	return promiseReadFile(pSource)
		.then(pContent => {
			return svgo.optimize(pContent)
		}).then(pOptimised => {
			const destination = path.join(pDestination, fileName)

			return promiseWriteFile(destination, pOptimised.data)
		}).then(pOutputPath => {
			const absoluteSourcePath = path.resolve(pSource)

			return Promise.resolve({
				entryPoint: absoluteSourcePath,
				sourceFiles: absoluteSourcePath,
				outputFiles: pOutputPath,
			})
		})
}
