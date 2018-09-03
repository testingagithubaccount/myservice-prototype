import path from 'path'
import postcss from 'postcss'
import sass from 'node-sass'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import promiseReadFile from './promiseReadFile'
import promiseWriteFile from './promiseWriteFile'

const SOURCE_MAPS = true

export default function promiseProcessScss(pPath, pDestination, pProduction) {
	const fileName = path.basename(pPath, path.extname(pPath)) + '.css'
	const inputDirectory = path.dirname(pPath)
	const outputPath = path.join(pDestination, fileName)

	return promiseReadFile(pPath)
		.then(pContent => {
			const renderOptions = {
				data: pContent,
				outFile: outputPath,
				includePaths: [inputDirectory],
			}

			if (SOURCE_MAPS) {
				renderOptions.sourceMap = true
			}

			const parsed = sass.renderSync(renderOptions)

			const plugins = [autoprefixer()]

			if (pProduction) {
				plugins.push(cssnano())
			}

			const postCssOptions = {
				from: pPath,
				to: outputPath,
			}

			if (SOURCE_MAPS) {
				postCssOptions.map = {
					inline: false,
					prev: parsed.map.toString(),
				}
			}

			return Promise.all([
				Promise.resolve(parsed.stats.includedFiles),
				postcss(plugins).process(parsed.css.toString(), postCssOptions),
			])
		}).then(pResults => {
			const sourceFiles = pResults[0]
			const processedData = pResults[1]
			const promises = [sourceFiles, promiseWriteFile(outputPath, processedData.css)]

			if (processedData.map) {
				promises.push(promiseWriteFile(`${outputPath}.map`, processedData.map))
			}

			return Promise.all(promises)
		}).then(pResults => {
			const sourceFiles = pResults[0]
			const outputFiles = pResults.slice(1)

			return Promise.resolve({
				entryPoint: path.resolve(pPath),
				sourceFiles,
				outputFiles,
			})
		})
}