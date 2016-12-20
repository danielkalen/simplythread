helpers = {}

currentID = 0
helpers.genTransactionID = ()-> ++currentID

helpers.extend = (baseObj, objToInherit, keyToOmit)->
	keys = Object.keys(objToInherit)
	for key in keys
		baseObj[key] = objToInherit[key] unless key is keyToOmit

	return baseObj


helpers.createWorkerURI = ()->
	workerScriptContents = workerScript.toString().match(functionBodyRegEx)[1]
	### istanbul ignore next ###
	dependencies = SimplyThread.threadDeps or ''
	dependencies += "var helpers="+helpers.javascriptStringify(helpers.extend({}, helpers, 'javascriptStringify'))+'; helpers.exposeStringifyFn();'
	dependencies += "var PRIMITIVE_TYPES = #{JSON.stringify(PRIMITIVE_TYPES)};"
	dependencies += "var STRINGIFY_OPTS = #{JSON.stringify(STRINGIFY_OPTS)};"

	### istanbul ignore next ###
	if not SUPPORTS.promises
		dependencies += promisePolyfill
	
	blob = new Blob([dependencies+workerScriptContents], {type:'application/javascript'});
	
	### istanbul ignore next ###
	return (window.URL or window.webkitURL).createObjectURL(blob)




helpers.patchWorkerMethods = (worker)->
	origPostMessage = worker.postMessage.bind(worker)
	worker.postMessage = (message, shouldStringify=true)->
		message.payload = helpers.stringifyPayload(message.payload) if shouldStringify
		origPostMessage(message)

	origAddEventListener = worker.addEventListener.bind(worker)
	worker.addEventListener = (event, callback)->
		origAddEventListener event, (e)->
			if e.data.payload
				parseMethod = if e.data.status is 'reject' then 'parseRejection' else 'parsePayload'
				e.data.payload = helpers[parseMethod](e.data.payload)
			callback(e.data)
	
	return worker



### istanbul ignore next ###
helpers.stringifyAsGlobals = (globals)->
	globalsString = 'var '
	keys = Object.keys(globals)

	for key,index in keys
		globalsString += "#{key}=#{@javascriptStringify(globals[key])}#{if index is keys.length-1 then ';' else ','} "
	
	return globalsString


helpers.stringifyPayload = (payload)->
	output = {type: typeof payload}
	### istanbul ignore next ###
	output.data = if PRIMITIVE_TYPES[output.type] then payload else @javascriptStringify(payload, null, null, STRINGIFY_OPTS)
	return output


helpers.parsePayload = (payload)->
	if PRIMITIVE_TYPES[payload.type]
		return payload.data
	else
		return eval "(#{payload.data})"


helpers.parseRejection = (rejection)->
	err = @parsePayload(rejection)
	if err and typeof err is 'object' and window[err.name] and window[err.name].constructor is Function
		proxyErr = new window[err.name](err.message)
		proxyErr.stack = err.stack
		return proxyErr
	else
		return err


### istanbul ignore next ###
helpers.exposeStringifyFn = ()->
	import '../../node_modules/javascript-stringify-plus/javascript-stringify.js'
	return
helpers.exposeStringifyFn()



functionBodyRegEx = /^\s*function\s*\(\)\s*\{\s*([\w\W]+)\s*\}\s*$/

SUPPORTS = SimplyThread.SUPPORTS = {}
SUPPORTS.promises = !!window.Promise
### istanbul ignore next ###
SUPPORTS.workers = !!window.Worker and !!window.Blob and (!!window.URL or !!window.webkitURL) and do ()->
	try (new Worker(helpers.createWorkerURI())).terminate(); return true
# SUPPORTS.workers = false

PRIMITIVE_TYPES = 
	string: true
	number: true
	boolean: true
	symbol: true

STRINGIFY_OPTS = 
	references: true



