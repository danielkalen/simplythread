## ==========================================================================
## Thread Public Interface
## ========================================================================== 
ThreadInterface = (@fn)->
	@status = 'active'
	@worker = do ()=>
		### istanbul ignore if ###
		if not SUPPORTS.workers
			return new FakeWorker()
		else
			return helpers.patchWorkerMethods(new Worker helpers.createWorkerURI())

	@socket = do ()=>
		@worker.addEventListener 'message', (data)=>
			if data.ID and @socket.callbacks[data.ID] # data.ID will be a string if it's an event ID, otherwise it'll be a number
				@socket.callbacks[data.ID](data)

		return {
			on: (ID, callback)-> @callbacks[ID] = callback
			callbacks: {}
		}

	@setFn(@fn) if @fn
	return @


# ==== Prototype =================================================================================
ThreadInterface::run = (args...)->
	if typeof @fn is 'function'
		new Promise (resolve, reject)=>
			@socket.on ID=helpers.genTransactionID(), (data)=> switch data.status
				when 'resolve' then resolve(data.payload)
				when 'reject' then reject(data.payload)
			
			@worker.postMessage command:'run', payload:args, ID:ID
	else
		Promise.reject new Error('No function was set for this thread.')


ThreadInterface::on = (event, callback)->
	if typeof callback isnt 'function'
		throw new Error("Provided callback isn't a function")
	else
		@socket.on event, (data)-> callback(data.payload)


ThreadInterface::setFn = (fn, context)->
	if typeof fn isnt 'function'
		throw new Error("Provided argument isn't a function")
	else
		@fn = fn
		@fnString = fn.toString()
		
		@worker.postMessage {command:'setFn', payload:@fnString}, false
		@setContext(context) if context?
		return @


ThreadInterface::setGlobals = (obj)->
	if not obj or typeof obj isnt 'object'
		throw new Error("Provided argument isn't an object")
	else
		@worker.postMessage command:'setGlobals', payload:obj
	return @


ThreadInterface::setScripts = (scripts)->
	@worker.postMessage command:'setScripts', payload:[].concat(scripts)
	return @


ThreadInterface::setContext = (context)->
	@worker.postMessage command:'setContext', payload:context
	return @


ThreadInterface::kill = ()->
	@worker.terminate()
	@status = 'dead'

	SimplyThread.remove(@)
	return @











