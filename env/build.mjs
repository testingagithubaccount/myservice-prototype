/*eslint no-console: 0*/

import path from 'path'
import fs from 'fs'
import minimist from 'minimist'
import del from 'del'
import minimatch from 'minimatch'
import express from 'express'
import createError from 'http-errors'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import router from './modules/router'
import promisePaths from './modules/promisePaths'
import promiseProcessJs from './modules/promiseProcessJs'
import promiseProcessSass from './modules/promiseProcessSass'
import promiseProcessSvg from './modules/promiseProcessSvg'
import promiseProcessImage from './modules/promiseProcessImage'
import promiesLogResults from './modules/promiseLogResults'

const SOURCE_DIRECTORY = 'src'
const BUILD_DIRECTORY = 'build'
const SERVER_PORT = 5000

const JS_ENTRY_POINTS = 'js/**/*.?(m)js'
const JS_OUTPUT_DIRECTORY = 'js'

const SASS_ENTRY_POINTS = ['sass/main.scss', 'sass/myaccount.scss']
const SASS_OUTPUT_DIRECTORY ='css'

const COMPONENT_ENTRY_POINTS = 'components/components.scss'
const COMPONENT_OUTPUT_DIRECTORY ='css'

const SVG_ENTRY_POINTS = 'images/**/*.svg'
const SVG_OUTPUT_DIRECTORY = 'images'

const IMAGES_ENTRY_POINTS = 'images/**/*.@(jpg|gif|png)'
const IMAGES_OUTPUT_DIRECTORY = 'images'

const tasks = {}

const argv = minimist(process.argv.slice(2))
const task = argv.task || 'default'

const production = process.env.NODE_ENV ? true : false

tasks.default = function () {
	return tasks.del()
		.then(() => {
			return Promise.all([
				tasks.js(),
				tasks.sass(),
				tasks.components(),
				tasks.svgs(),
				tasks.images(),
			])
		})
}

tasks.del = function () {
	const directory = BUILD_DIRECTORY

	return del([path.join(directory, '**'), `!${directory}`])
		.then(pFiles => {
			console.log('Deleted:', pFiles)

			return Promise.resolve(pFiles)
		})
}

tasks.js = function () {
	const outputPath = path.join(BUILD_DIRECTORY, JS_OUTPUT_DIRECTORY)

	return promisePaths(path.join(SOURCE_DIRECTORY, JS_ENTRY_POINTS))
		.then(pPaths => {
			return Promise.all(pPaths.map(pPath => promiseProcessJs(pPath, outputPath, production)))
		})
		.then(promiesLogResults)
}

tasks.sass = function () {
	const entryPoints = SASS_ENTRY_POINTS.map(pEntryPoint => path.join(SOURCE_DIRECTORY, pEntryPoint))

	return promisePaths(entryPoints)
		.then(pPaths => {
			const outputPath = path.join(BUILD_DIRECTORY, SASS_OUTPUT_DIRECTORY)
			const options = {
				minify: production,
			}

			return Promise.all(pPaths.map(pPath => promiseProcessSass(pPath, outputPath, options)))
		})
		.then(promiesLogResults)
}

tasks.components = function () {
	const entryPoints = path.join(SOURCE_DIRECTORY, COMPONENT_ENTRY_POINTS)

	return promisePaths(entryPoints)
		.then(pPaths => {
			const outputPath = path.join(BUILD_DIRECTORY, COMPONENT_OUTPUT_DIRECTORY)
			const options = {
				modules: true,
			}

			return Promise.all(pPaths.map(pPath => promiseProcessSass(pPath, outputPath, options)))
		})
		.then(promiesLogResults)
}

tasks.images = function () {
	const outputPath = path.join(BUILD_DIRECTORY, IMAGES_OUTPUT_DIRECTORY)

	return promisePaths(path.join(SOURCE_DIRECTORY, IMAGES_ENTRY_POINTS))
		.then(pPaths => {
			return Promise.all(pPaths.map(pPath => promiseProcessImage(pPath, outputPath, production)))
		})
		.then(promiesLogResults)
}

tasks.svgs = function () {
	const outputPath = path.join(BUILD_DIRECTORY, SVG_OUTPUT_DIRECTORY)

	return promisePaths(path.join(SOURCE_DIRECTORY, SVG_ENTRY_POINTS))
		.then(pPaths => {
			return Promise.all(pPaths.map(pPath => promiseProcessSvg(pPath, outputPath, production)))
		})
		.then(promiesLogResults)
}

tasks.dev = function () {
	return tasks.watch()
		.then(tasks.serve)
}

tasks.watch = function () {
	const absolutePath = path.resolve(SOURCE_DIRECTORY)

	return tasks.default()
		.then(() => {
			console.log('Watching', absolutePath)

			fs.watch(absolutePath, { recursive: true }, (pEvent, pFilePath) => {
				console.log(pEvent, path.join(absolutePath, pFilePath))

				WATCH.forEach(pItem => {
					if (minimatch(pFilePath, pItem.glob)) {
						pItem.fn()
					}
				})
			})
		})
}

tasks.serve = function () {
	const server = express()

	server.set('views')
	server.set('view engine', 'ejs')

	server.use(logger('dev'))
	server.use(express.json())
	server.use(express.urlencoded({ extended: false }))
	server.use(cookieParser())
	server.use(express.static(path.resolve(BUILD_DIRECTORY)))

	server.use('/', router)

	// catch 404 and forward to error handler
	server.use((pRequest, pResponse, pNext) => {
		pNext(createError(404))
	})

	// error handler
	server.use(function (pError, pRequest, pResponse) {
		// set locals, only providing error in development
		pResponse.locals.message = pError.message
		pResponse.locals.error = production ? {} : pError

		// render the error page
		pResponse.status(pError.status || 500)
		pResponse.render('error')
	})

	const port = SERVER_PORT
	server.listen(port, () => console.log(`HTTP server running on port ${port}`))

	return Promise.resolve(server)
}

const WATCH = [
	{
		glob: '**/*.?(m)js',
		fn: tasks.js,
	},
	{
		glob: '**/*.?(s)css',
		fn: () => {
			tasks.sass()
			tasks.components()
		},
	},
	{
		glob: '**/*.svg',
		fn: tasks.svg,
	},
	{
		glob: '**/*.@(jpg|jpeg|gif|png)',
		fn: tasks.images,
	},
]

if (tasks[task]) {
	tasks[task]()
		.catch(pError => {
			console.error(pError)
		})
} else {
	console.error(`Error: no such task '${task}'`)
}