## ==========================================================================
## Thread (private)
## ========================================================================== 
Thread = (@fn, @fnString)->
	@worker = @init()
	@socket = @openSocket()
	@sendCommand('setFn', @fnString) if @fn

	return @


# ==== Prototype =================================================================================
Thread::init = ()->
	if not SUPPORTS.workers
		return false
	else
		return new Worker(@createURI())



Thread::createURI = ()->
	workerScriptContents = workerScript.toString().match(functionBodyRegEx)[1]
	dependencies = SimplyThread.threadDeps or ''
	dependencies += exposeStringifyFn.toString().match(functionBodyRegEx)[1]
	dependencies += "var PRIMITIVE_TYPES = #{JSON.stringify(PRIMITIVE_TYPES)};"
	dependencies += "var STRINGIFY_OPTS = #{JSON.stringify(STRINGIFY_OPTS)};"

	if not SUPPORTS.promises
		dependencies += promisePolyfill
	
	blob = new Blob([dependencies+workerScriptContents], {type:'application/javascript'});
	
	return URL.createObjectURL(blob)


Thread::openSocket = ()->
	if @worker
		@worker.addEventListener 'message', (e)=>
			if e.data.ID and @socket.callbacks[e.data.ID] # e.data.ID will be a string if it's an event ID, otherwise it'll be a number
				@socket.callbacks[e.data.ID](e.data)

	return {
		on: (ID, callback)-> @callbacks[ID] = callback
		callbacks: {}
	}



Thread::sendCommand = (command, payload)-> new Promise (resolve, reject)=>
	if @worker
		if command is 'run'
			@socket.on ID=genTransactionID(), (data)-> switch data.status
				when 'resolve' then resolve(data.payload)
				when 'reject' then reject(data.payload)
					
		@worker.postMessage {command, payload, ID}


	else # Fallback
		switch command
			when 'run'
				@fn.apply(@context, payload) if @fn
			
			when 'setFn' # We stringify the function 'eval' it in order for it to gain access to the local scope, or more importantly to the fallback threadEmit function
				@fn = eval("(#{payload.toString()})") if typeof payload is 'function'

			when 'setContext'
				@context = payload



threadEmit = (event, payload)-> # Fallback threadEmit function for env not supporting threads/workers
	@socket.callbacks[event]?(payload)







