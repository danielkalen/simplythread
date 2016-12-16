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
	if not supports.workers
		return false
	else
		return new Worker(@createURI())



Thread::createURI = ()->
	workerScriptContents = workerScript.toString().match(workerScriptRegEx)[1]

	if not supports.promises
		workerScriptContents += promisePolyfill
	
	blob = new Blob([workerScriptContents], {type:'application/javascript'});
	
	return URL.createObjectURL(blob)


Thread::openSocket = ()-> if @worker
	socketCallbacks = []
	
	@worker.addEventListener 'message', (e)=>
		if e.data.ID and socketCallbacks[e.data.ID]
			socketCallbacks[e.data.ID](e.data)

	return {
		on: (ID, callback)-> socketCallbacks[ID] = callback
		callbacks: socketCallbacks
	}



Thread::sendCommand = (command, payload)-> new Promise (resolve, reject)=>
	if @worker
		if command is 'run'
			@socket.on ID=genTransactionID(), (data)-> switch data.status
				when 'resolve' then resolve(data.payload)
				when 'reject' then reject(normalizeRejection data.payload)
					
		@worker.postMessage {command, payload, ID}


	else # Fallback
		switch command
			when 'run'
				@fn.apply(@context, payload) if @fn
			
			when 'setFn'
				@fn = payload if typeof payload is 'function'

			when 'setContext'
				@context = payload



currentID = 0
genTransactionID = ()-> ''+(++currentID)


normalizeRejection = (err)->
	if err and typeof err is 'object' and window[err.name] and window[err.name].constructor is Function
		proxyErr = if err.name and window[err.name] then new window[err.name](err.message) else new Error(err.message)
		proxyErr.stack = err.stack
		return proxyErr
	else
		return err








