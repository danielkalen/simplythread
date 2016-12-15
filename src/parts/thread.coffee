## ==========================================================================
## Thread (private)
## ========================================================================== 
Thread = (@fn, @fnString)->
	@worker = @init()
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



Thread::sendCommand = (command, payload)-> new Promise (resolve, reject)=>
	if @worker
		handleMessage = (e)=>
			switch e.data.status
				when 'resolve' then resolve(e.data.payload)
				when 'reject'
					err = e.data.payload
					if err and typeof err is 'object' and window[err.name] and window[err.name].constructor is Function
						proxyErr = if err.name and window[err.name] then new window[err.name](err.message) else new Error(err.message)
						proxyErr.stack = err.stack
						reject(proxyErr)
					else
						reject(err)
			
			@worker.removeEventListener 'message', handleMessage
		
		@worker.addEventListener('message', handleMessage) if command is 'run'
		@worker.postMessage {command, payload}


	else # Fallback
		switch command
			when 'run'
				@fn.apply(@context, payload) if @fn
			
			when 'setFn'
				@fn = payload if typeof payload is 'function'

			when 'setContext'
				@context = payload