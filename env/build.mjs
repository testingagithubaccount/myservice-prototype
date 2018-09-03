/*eslint no-console: 0*/

import path from 'path'
import fs from 'fs'
import minimist from 'minimist'
import del from 'del'
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

const CONFIG = {
	developmentPath: 'dev',
	productionPath: 'prod',
	serverPort: 5000,
	tasks: [{
		name: 'js',
		input: 'src/js/**/*.js',
		ouptput: 'js',
		watch: 'src/js/**/*.js',
	},
	{
		name: 'sass',
		input: ['src/sass/main.scss', 'src/sass/myaccount.scss'],
		ouptput: 'sass',
		watch: 'src/sass/**/*',
	},
	{
		name: 'svg',
		input: 'src/images/**/*.svg',
		ouptput: 'images',
		watch: 'src/images/**/*.svg',
	},
	{
		name: 'images',
		input: 'src/images/**/*.@(jpg|gif|png)',
		ouptput: 'images',
		watch: 'src/images/**/*.@(jpg|gif|png)',
	}]
}

const SRC_ROOT = './'
const JS_PATHS = ['src/js/*.?(m)js']
const JS_OUTPUT = 'docs/js'
const SASS_PATHS = ['src/sass/main.scss', 'src/sass/myaccount.scss']
const SASS_OUTPUT = 'docs/css'
const IMAGE_PATHS = ['src/images/**/*.@(jpg|gif|png)']
const IMAGE_OUTPUT = 'docs/images'
const SVG_PATHS = ['src/images/**/*.svg']
const SVG_OUTPUT = '/docs/images'
const DEV_PATH = 'dev'
const PROD_PATH = 'prod'
const SERVER_PORT = 5000

const argv = minimist(process.argv.slice(2))
const task = argv.task || 'default'

const production = process.env.NODE_ENV ? true : false
const outputRoot = production ? PROD_PATH : DEV_PATH

const tasks = {
	default: function () {
		return tasks.del()
			.then(() => {
				return Promise.all([
					tasks.js(),
					tasks.sass(),
					tasks.svg(),
					tasks.image(),
				])
			})
	},

	del: function () {
		return del([path.join(outputRoot, '**'), `!${outputRoot}`])
			.then(pFiles => {
				console.log('Deleted:', pFiles)

				return Promise.resolve(pFiles)
			})
	},

	js: function () {
		const outputPath = path.join(outputRoot, JS_OUTPUT)

		return promisePaths(JS_PATHS)
			.then(pPaths => {
				return Promise.all(pPaths.map(pPath => promiseProcessJs(pPath, outputPath, production)))
			})
			.then(promiesLogResults)
	},

	sass: function () {
		const outputPath = path.join(outputRoot, SASS_OUTPUT)

		return promisePaths(SASS_PATHS)
			.then(pPaths => {
				return Promise.all(pPaths.map(pPath => promiseProcessSass(pPath, outputPath, production)))
			})
			.then(promiesLogResults)
	},

	image: function () {
		const outputPath = path.join(outputRoot, IMAGE_OUTPUT)

		return promisePaths(IMAGE_PATHS)
			.then(pPaths => {
				return Promise.all(pPaths.map(pPath => promiseProcessImage(pPath, outputPath, production)))
			})
			.then(promiesLogResults)
	},

	svg: function () {
		const outputPath = path.join(outputRoot, SVG_OUTPUT)

		return promisePaths(SVG_PATHS)
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
		const fileTypePatterns = {
			js: /\.m?js$/,
			sass: /\.scss$/,
			view: /\.ejs$/,
			svg: /\.svg$/,
			image: /\.(png|jpg|gif)$/,
		}

		return tasks.default()
			.then(() => {
				console.log('Watching', SRC_ROOT)

				fs.watch(SRC_ROOT, { recursive: true }, (pEvent, pFileName) => {
					console.log(pEvent, pFileName)

					const key = Object.keys(fileTypePatterns).find(pKey => {
						return fileTypePatterns[pKey].test(pFileName)
					})

					if (key) {
						tasks[key]()
					}
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
		server.use(express.static(outputRoot))

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

		server.listen(SERVER_PORT, () => console.log(`HTTP server running on port ${SERVER_PORT}`))

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