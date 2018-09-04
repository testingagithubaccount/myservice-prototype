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

const CONFIGURATION = {
	sourceDirectory: 'src',
	buildDirectory: 'build',
	serverPort: 5000,
	tasks: {
		js: {
			entryPoints: 'src/js/**/*.?(m)js',
			ouptputDirectory: 'js',
			watch: 'js/**/*.?(m)js',
		},
		sass: {
			entryPoints: ['src/sass/main.scss', 'src/sass/myaccount.scss'],
			ouptputDirectory: 'css',
			watch: 'sass/**/*.?(s)css',
		},
		svgs: {
			entryPoints: 'src/images/**/*.svg',
			ouptputDirectory: 'images',
			watch: 'images/**/*.svg',
		},
		images: {
			entryPoints: 'src/images/**/*.@(jpg|gif|png)',
			ouptputDirectory: 'images',
			watch: 'images/**/*.@(jpg|jpeg|gif|png)',
		},
	},
}

const argv = minimist(process.argv.slice(2))
const task = argv.task || 'default'

const production = process.env.NODE_ENV ? true : false

const tasks = {
	default: function () {
		return tasks.del()
			.then(() => {
				return Promise.all([
					tasks.js(),
					tasks.sass(),
					tasks.svgs(),
					tasks.images(),
				])
			})
	},

	del: function () {
		const directory = CONFIGURATION.buildDirectory
		return del([path.join(directory, '**'), `!${directory}`])
			.then(pFiles => {
				console.log('Deleted:', pFiles)

				return Promise.resolve(pFiles)
			})
	},

	js: function () {
		const {buildDirectory} = CONFIGURATION
		const {ouptputDirectory, entryPoints} = CONFIGURATION.tasks.js
		const outputPath = path.join(buildDirectory, ouptputDirectory)

		return promisePaths(entryPoints)
			.then(pPaths => {
				return Promise.all(pPaths.map(pPath => promiseProcessJs(pPath, outputPath, production)))
			})
			.then(promiesLogResults)
	},

	sass: function () {
		const {buildDirectory} = CONFIGURATION
		const {ouptputDirectory, entryPoints} = CONFIGURATION.tasks.sass
		const outputPath = path.join(buildDirectory, ouptputDirectory)

		return promisePaths(entryPoints)
			.then(pPaths => {
				return Promise.all(pPaths.map(pPath => promiseProcessSass(pPath, outputPath, production)))
			})
			.then(promiesLogResults)
	},

	images: function () {
		const {buildDirectory} = CONFIGURATION
		const {ouptputDirectory, entryPoints} = CONFIGURATION.tasks.images
		const outputPath = path.join(buildDirectory, ouptputDirectory)

		return promisePaths(entryPoints)
			.then(pPaths => {
				return Promise.all(pPaths.map(pPath => promiseProcessImage(pPath, outputPath, production)))
			})
			.then(promiesLogResults)
	},

	svgs: function () {
		const {buildDirectory} = CONFIGURATION
		const {ouptputDirectory, entryPoints} = CONFIGURATION.tasks.svgs
		const outputPath = path.join(buildDirectory, ouptputDirectory)

		return promisePaths(entryPoints)
			.then(pPaths => {
				return Promise.all(pPaths.map(pPath => promiseProcessSvg(pPath, outputPath, production)))
			})
			.then(promiesLogResults)
	},

	dev: function () {
		return tasks.watch()
			.then(tasks.serve)
	},

	watch: function () {
		const absolutePath = path.resolve(CONFIGURATION.sourceDirectory)

		return tasks.default()
			.then(() => {
				console.log('Watching', absolutePath)

				fs.watch(absolutePath, { recursive: true }, (pEvent, pFilePath) => {
					console.log(pEvent, path.join(absolutePath, pFilePath))

					const keys = Object.keys(CONFIGURATION.tasks).reduce((pAccumulator, pKey) => {
						const tasks = pAccumulator.slice(0)
						const task = CONFIGURATION.tasks[pKey]

						if (minimatch(pFilePath, task.watch)) {
							tasks.push(pKey)
						}

						return tasks
					}, [])

					keys.forEach(pKey => {
						tasks[pKey]()
					})
				})
			})
	},

	serve: function () {
		const server = express()

		server.set('views')
		server.set('view engine', 'ejs')

		server.use(logger('dev'))
		server.use(express.json())
		server.use(express.urlencoded({ extended: false }))
		server.use(cookieParser())
		server.use(express.static(path.resolve(CONFIGURATION.buildDirectory)))

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

		const port = CONFIGURATION.serverPort
		server.listen(port, () => console.log(`HTTP server running on port ${port}`))

		return Promise.resolve(server)
	},
}

if (tasks[task]) {
	tasks[task]()
		.catch(pError => {
			console.error(pError)
		})
} else {
	console.error(`Error: no such task '${task}'`)
}