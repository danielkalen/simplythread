request = require 'request'

request
	.post
		url: "https://saucelabs.com/rest/v1/simplythread/js-tests",
		json:
			name: "SimplyThread Test Suite"
			build: require('../package.json').version
			framework: "mocha"
			url: "http://simplythread.dev:9201/test/testrunner.html?purgeCache=#{Math.random()*100000000}"
			platforms: [
				["OS X 10.11", "chrome", "53"]
				["OS X 10.11", "chrome", "40"]
				["OS X 10.11", "firefox", "48"]
				["OS X 10.11", "firefox", "38"]
				["OS X 10.11", "safari", "9"]
				["OS X 10.10", "safari", "8"]
				["OS X 10.9", "safari", "7"]
				["Windows 10", "microsoftedge", "13"]
				["Windows 7", "internet explorer", "11"]
				["Windows 7", "internet explorer", "10"]
				["Windows 7", "internet explorer", "9"]
				["iOS", "iphone", "9.3"]
				["iOS", "iphone", "9.0"]
				["iOS", "iphone", "8.1"]
			]
	
	.auth "simplythread", "3fb731b0-65f9-4687-a8bd-081c19638028"
