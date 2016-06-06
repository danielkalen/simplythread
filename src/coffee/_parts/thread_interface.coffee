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
		@thread.sendCommand('run', args).then resolve, reject
	else
		reject new Error('No function was set for this thread.')


ThreadInterface::setFn = (fn, context)->
	if typeof fn is 'function'
		@fn = fn
		@fnString = fn.toString()
		
		@thread.sendCommand('setFn', @fnString)
		@setContext(context)
	
	return @


ThreadInterface::setContext = (context)->
	@thread.sendCommand('setContext', context)
	return @


ThreadInterface::kill = ()->
	@thread?.worker.terminate()
	@status = 'dead'

	SimplyThread.remove(@)

	return @