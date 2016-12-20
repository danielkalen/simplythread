functionBodyRegEx = /^\s*function\s*\(\)\s*\{\s*([\w\W]+)\s*\}\s*$/

SUPPORTS = 
	'workers': !!window.Worker and !!window.Blob and !!window.URL
	'promises': !!window.Promise

PRIMITIVE_TYPES = 
	string: true
	number: true
	boolean: true
	symbol: true

STRINGIFY_OPTS = 
	references: true


currentID = 0
genTransactionID = ()-> ++currentID

`/* istanbul ignore next */`
exposeStringifyFn = ()->
	import '../../node_modules/javascript-stringify-plus/javascript-stringify.js'
	return