module.exports = (config)-> config.set
	basePath: '../'
	client: captureConsole: true
	browserConsoleLogOptions: level:'log', terminal:true
	frameworks: ['mocha', 'chai']
	files: [
		# 'node_modules/@danielkalen/utils/utils.js'
		# 'node_modules/@danielkalen/polyfills/polyfills.js'
		'dist/simplythread.pretty.js'
		'test/envVar-karma.js'
		'test/bower_components/bluebird/js/browser/bluebird.js'
		'test/bower_components/jquery/dist/jquery.min.js'
		'test/test.js'
		{
			pattern: 'test/samplescript.js'
			watched: false
			included: false
		}
	]
	exclude: [
		'**/*.git'
	]

	preprocessors: 'dist/simplythread.pretty.js': 'coverage'
	
	reporters: ['mocha', 'coverage']

	mochaReporter: 
		output: 'minimal'

	coverageReporter:
		type: 'lcov'
		dir: './coverage/'
		subdir: '.'

	port: 9876
	colors: true
	logLevel: config.LOG_INFO
	autoWatch: true
	autoWatchBatchDelay: 1000
	restartOnFileChange: true
	singleRun: false
	concurrency: Infinity
	browsers: ['Chrome', 'Firefox', 'Opera', 'Safari']