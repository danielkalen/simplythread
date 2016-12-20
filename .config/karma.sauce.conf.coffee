sauceLabsBrowsers = 
	'SL_chrome':
		base: 'SauceLabs'
		browserName: 'chrome'
		platform: 'OS X 10.11'
	
	'SL_firefox':
		base: 'SauceLabs'
		browserName: 'firefox'
		platform: 'OS X 10.11'
	
	'SL_safari_9':
		base: 'SauceLabs'
		browserName: 'safari'
		platform: 'OS X 10.11'
	
	'SL_safari_8':
		base: 'SauceLabs'
		browserName: 'safari'
		platform: 'OS X 10.10'
	
	'SL_safari_7':
		base: 'SauceLabs'
		browserName: 'safari'
		platform: 'OS X 10.9'
	
	# 'SL_edge':
	# 	base: 'SauceLabs'
	# 	browserName: 'microsoftedge'
	# 	platform: 'Windows 10'
	
	'SL_ie_11':
		base: 'SauceLabs'
		browserName: 'internet explorer'
		platform: 'Windows 7'
		version: '11'
	
	'SL_ie_10':
		base: 'SauceLabs'
		browserName: 'internet explorer'
		platform: 'Windows 7'
		version: '10'
	
	'SL_ie_9':
		base: 'SauceLabs'
		browserName: 'internet explorer'
		platform: 'Windows 7'
		version: '9'
	
	# 'SL_ios_9':
	# 	base: 'SauceLabs'
	# 	browserName: 'iphone'
	# 	platform: 'OS X 10.11'
	# 	version: '9.3'
	
	# 'SL_ios_8':
	# 	base: 'SauceLabs'
	# 	browserName: 'iphone'
	# 	platform: 'OS X 10.10'
	# 	version: '8.1'
	
	# 'SL_ios_7':
	# 	base: 'SauceLabs'
	# 	browserName: 'iphone'
	# 	platform: 'OS X 10.9'
	# 	version: '7.1'






module.exports = (config)-> config.set
	basePath: '../'
	frameworks: ['mocha', 'chai']
	files: [
		# 'node_modules/@danielkalen/utils/utils.js'
		# 'node_modules/@danielkalen/polyfills/polyfills.js'
		'dist/simplythread.pretty.js'
		'test/envVar-sauce.js'
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
	
	reporters: ['mocha', 'coverage', 'saucelabs']

	coverageReporter:
		type: 'lcov'
		dir: './coverage/'

	port: 9876
	colors: true
	logLevel: config.LOG_INFO
	singleRun: true
	# singleRun: false
	# autoWatch: true
	# autoWatchBatchDelay: 1000
	# restartOnFileChange: true
	concurrency: 1
	customLaunchers: sauceLabsBrowsers
	browsers: Object.keys sauceLabsBrowsers
	captureTimeout: 100000
	browserNoActivityTimeout: 100000
	browserDisconnectTimeout: 15000
	browserDisconnectTolerance: 1
	sauceLabs:
		testName: 'SimplyThread Test Suite'
		recordVideo: true
		build: require('../package.json').version
