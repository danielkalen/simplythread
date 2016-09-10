module.exports = (config)->
	config.set
		basePath: ''
		client: captureConsole: true
		browserConsoleLogOptions: level:'log', terminal:true
		frameworks: ['mocha', 'chai']
		files: [
			'dist/simplythread.pretty.js'
			'test/bower_components/jquery/dist/jquery.min.js'
			'test/test.js'
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
			dir: 'test/coverage/'
			subdir: 'browser'

		port: 9876
		colors: true
		logLevel: config.LOG_INFO
		autoWatch: true
		autoWatchBatchDelay: 1000
		restartOnFileChange: true
		browsers: ['Chrome']
		singleRun: false
		concurrency: Infinity
