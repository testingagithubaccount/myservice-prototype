import rollup from 'rollup'
import babel from '@babel/core'
import path from 'path'
import resolve from 'rollup-plugin-node-resolve'

const SOURCE_MAPS = true

function babelRollupPlugin(pSourceMaps = true) {
	const babelOptions = {
		presets: [
			[
				'@babel/env',
				{
					modules: false,
				},
			],
		],
	}

	if (pSourceMaps) {
		babelOptions.sourceMaps = 'both'
	}

	function transform(pSource) {
		const transformed = babel.transformSync(pSource, babelOptions)

		const rollupData = {
			code: transformed.code
		}

		if (pSourceMaps) {
			rollupData.map = transformed.map
		}

		return rollupData
	}

	return {
		name: babel,
		transform,
	}
}

export default function promiseProcessJs(pPath, pDestination, pProduction = false) {
	const basename = path.basename(pPath, path.extname(pPath))

	const outputOptions = {
		dir: pDestination,
		file: `${basename}.js`,
		format: 'iife',
		name: basename.replace(/[^\w\d]/g, ''),
		sourcemap: true,
	}

	if (pProduction) {
		outputOptions.strict = false
	}

	return rollup.rollup({
		input: pPath,
		treeshake: false,
		plugins: [
			babelRollupPlugin(SOURCE_MAPS),
			resolve(),
		],
	})
		.then(pBundle => pBundle.write(outputOptions))
		.then(pResult => {
			const outputFiles = [path.resolve(pDestination, pResult.fileName)]

			if (SOURCE_MAPS) {
				outputFiles.push(`${outputFiles[0]}.map`)
			}

			return Promise.resolve({
				entryPoint: path.resolve(pPath),
				sourceFiles: Object.keys(pResult.modules),
				outputFiles,
			})
		})
}
