circularReference = '**_circular_**'
functionReference = '**_function_**'

## ==========================================================================
## Thread Public Interface
## ========================================================================== 
ThreadInterface = (@fn)->
	@fnString = @fn?.toString()
	@status = 'active'
	thread = new Thread(@fn, @fnString)
	
	Object.defineProperty @, 'thread',
		'enumerable': false
		'configurable': false
		'get': ()-> thread

	return @


# ==== Prototype =================================================================================
ThreadInterface::run = (args...)-> new Promise (resolve, reject)=>
	if typeof @fn is 'function'
		@thread.sendCommand('run', stringifyFnsInArgs(args)).then (result)->
			resolve parseFnsInObjects(result)
		, reject
	else
		reject new Error('No function was set for this thread.')


ThreadInterface::setFn = (fn, context)->
	if typeof fn is 'function'
		@fn = fn
		@fnString = fn.toString()
		
		@thread.sendCommand('setFn', @fnString)
		@setContext(context) if context
	
	return @


ThreadInterface::setGlobals = (obj)->		
	@thread.sendCommand('setGlobals', stringifyFnsInObjects(obj))
	return @


ThreadInterface::setScripts = (scripts)->
	@thread.sendCommand('setScripts', stringifyFnsInObjects(scripts))
	return @


ThreadInterface::setContext = (context)->
	try
		contextString = JSON.stringify context
	catch
		contextString = do ()->
			cache = []
			
			stringified = JSON.stringify context, (key,value)->
				if value isnt null and typeof value is 'object'
					if cache.indexOf(value) isnt -1
						if value is context
							return circularReference
						else if value?.nodeName and value.nodeType
							return value
						else if typeof value is 'function'
							return functionReference+value.toString()
						else
							return
					
					else
						cache.push(value)

				return value
						
			cache = null
			return stringified
		

	@thread.sendCommand('setContext', contextString)
	return @


ThreadInterface::kill = ()->
	@thread?.worker.terminate()
	@status = 'dead'

	SimplyThread.remove(@)

	return @










# ==== Helpers =================================================================================
stringifyFnsInArgs = (args)->
	newArgs = []
	
	for arg,index in args
		if typeof arg is 'function'
			newArgs[index] = functionReference+arg.toString()
		else
			newArgs[index] = arg

	return newArgs


stringifyFnsInObjects = (object, cache=[])->
	if typeof object is 'function'
		return functionReference+object.toString()
	
	else if typeof object is 'object'
		cache.push(object)
		newObj = if Array.isArray(object) then [] else {}

		for key,value of object
			if typeof value is 'object' and cache.indexOf(value) is -1
				cache.push(value)
				newObj[key] = stringifyFnsInObjects(value, cache)
			
			else if typeof value is 'function'
				newObj[key] = functionReference+value.toString()

			else
				newObj[key] = value

		return newObj

	else
		return object






parseFnsInArgs = (args)->
	newArgs = []
	___ = undefined
	
	for arg,index in args
		if typeof arg is 'string' and arg.indexOf(functionReference) is 0
			newArgs[index] = eval('___ ='+arg.replace functionReference, '')
		else
			newArgs[index] = arg

	return newArgs



parseFnsInObjects = (object, cache=[])->	
	___ = undefined
	if typeof object is 'string' and object.indexOf(functionReference) is 0
		return eval('___ ='+object.replace functionReference, '')

	cache.push(object)
	
	for key,value of object
		if typeof value is 'object' and cache.indexOf(value) is -1
			cache.push(value)
			object[key] = parseFnsInObjects(value, cache)
		
		else if typeof value is 'string' and value.indexOf(functionReference) is 0
			object[key] = eval('___ ='+value.replace functionReference, '')

	return object











