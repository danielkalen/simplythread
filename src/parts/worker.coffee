## ==========================================================================
## Worker script
## ========================================================================== 
workerScript = ()->
	fnToExecute = null
	fnContext = null

	_stringifyPayload = (payload)->
		output = type: typeof payload
		output.data = if PRIMITIVE_TYPES[output.type] then payload else javascriptStringify(payload, null, null, STRINGIFY_OPTS)
		return output

	_stringifyError = ({name, message, stack})->
		_stringifyPayload {name, message, stack}

	_parsePayload = (payload)->
		if PRIMITIVE_TYPES[payload.type]
			return payload.data
		else
			return eval "(#{payload.data})"
	
	
	onmessage = (e)->
		command = e.data.command
		payload = e.data.payload
		ID = e.data.ID
		
		switch command
			when 'setContext' then setContext(_parsePayload payload)
			when 'setGlobals' then setGlobals(_parsePayload payload)
			when 'setScripts' then setScripts(_parsePayload payload)
			when 'setFn' then setFn(payload)
			when 'run' then run(ID, _parsePayload payload)
	

	setGlobals = (obj)->
		for key,value of obj
			self[key] = value
		return
	
	setScripts = (scripts)->
		for script in scripts 
			if typeof script is 'function'
				script.call(self)
			else
				importScripts(script)

		return


	setContext = (context)-> fnContext = context

	setFn = (fnString)-> eval("fnToExecute = #{fnString}")

	run = (ID, args=[])->
		try
			result = fnToExecute.apply(fnContext, args)
		catch err
			postMessage {ID, status:'reject', payload:_stringifyError(err)}
			hasError = true

		unless hasError
			Promise.resolve(result)
				.then (result)-> postMessage {ID, status:'resolve', payload:_stringifyPayload(result)}
				.catch (result)-> postMessage {ID, status:'reject', payload:_stringifyPayload(result)}



	threadEmit = (event, payload)->
		postMessage {ID:event, payload:_stringifyPayload(payload)}





	return
