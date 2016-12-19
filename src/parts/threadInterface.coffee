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
ThreadInterface::run = (args...)->
	if typeof @fn is 'function'
		@thread.sendCommand('run', @_stringifyPayload(args))
			.then (payload)=> @_parsePayload(payload)
			.catch (rejection)=> Promise.reject @_parseRejection(rejection)
	else
		Promise.reject new Error('No function was set for this thread.')


ThreadInterface::on = (event, callback)-> if typeof event is 'string' and typeof callback is 'function'
	@thread.socket.on event, (message)=>
		callback @_parsePayload(message.payload)


ThreadInterface::setFn = (fn, context)->
	if typeof fn is 'function'
		@fn = fn
		@fnString = fn.toString()
		
		@thread.sendCommand('setFn', @fnString)
		@setContext(context) if context
	
	return @


ThreadInterface::setGlobals = (obj)->		
	@thread.sendCommand('setGlobals', @_stringifyPayload(obj))
	return @


ThreadInterface::setScripts = (scripts)->
	@thread.sendCommand('setScripts', @_stringifyPayload(scripts))
	return @


ThreadInterface::setContext = (context)->
	@thread.sendCommand('setContext', @_stringifyPayload(context))
	return @


ThreadInterface::kill = ()->
	@thread?.worker.terminate()
	@status = 'dead'

	SimplyThread.remove(@)
	return @


ThreadInterface::_stringifyPayload = (payload)->
	output = type: typeof payload
	output.data = if PRIMITIVE_TYPES[output.type] then payload else @javascriptStringify(payload, null, null, STRINGIFY_OPTS)
	return output


ThreadInterface::_parsePayload = (payload)->
	if PRIMITIVE_TYPES[payload.type]
		return payload.data
	else
		return eval "(#{payload.data})"


ThreadInterface::_parseRejection = (rejection)->
	err = @_parsePayload(rejection)
	if err and typeof err is 'object' and window[err.name] and window[err.name].constructor is Function
		proxyErr = if err.name and window[err.name] then new window[err.name](err.message) else new Error(err.message)
		proxyErr.stack = err.stack
		return proxyErr
	else
		return err

exposeStringifyFn.call ThreadInterface::











