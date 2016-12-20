## ==========================================================================
## Worker script
## ========================================================================== 
`/* istanbul ignore next */`
workerScript = ()->
	fnToExecute = null
	fnContext = null
	scriptsLoaded = Promise.resolve()

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
	
	_fetchExternal = (url)-> new Promise (resolve, reject)->
		request = new XMLHttpRequest()
		request.open 'GET', url, true

		request.onerror = reject
		request.onload = ()->
			if 200 >= @status < 400
				resolve(@response)
			else
				reject new Error("External fetch failed (status:#{request.status}): #{request.response}")

		request.send()


	_fetchModule = (module)->
		moduleName = module.split('#')[0]
		moduleLabel = module.split('#')[1] or moduleName
		moduleName = moduleName.replace /\//g, '%2F'

		_fetchExternal("https://wzrd.in/bundle/#{moduleName}").then (result)-> if result
			loader = eval(result)
			self[moduleLabel] = loader(moduleName)


	onmessage = (e)->
		command = e.data.command
		payload = e.data.payload
		ID = e.data.ID
		
		switch command
			when 'setGlobals' then setGlobals(_parsePayload payload)
			when 'setScripts' then setScripts(_parsePayload payload)
			when 'setContext' then fnContext = _parsePayload payload
			when 'setFn' then fnToExecute = eval "(#{payload})"
			when 'run' then run(ID, _parsePayload payload)
	

	setGlobals = (obj)->
		for key,value of obj
			self[key] = value
		return
	
	setScripts = (scripts)-> scriptsLoaded = new Promise (finalResolve, finalReject)->
		completedScripts = 0
		
		for script in scripts
			scriptPromise = switch typeof script
				when 'function'
					Promise.resolve script.call(self)

				when 'string'
					if script.slice(0,7) is 'MODULE:'
						_fetchModule(script.slice(7))
					else if script.slice(0,5) is 'file:'
						Promise.resolve(importScripts script)
					else
						_fetchExternal(script).then (result)->
							eval("(#{result})") if result

				else Promise.resolve()

			scriptPromise
				.then ()-> finalResolve() if ++completedScripts is scripts.length
				.catch(finalReject)

		return


	run = (ID, args=[])->
		scriptsLoaded
			.then ()->
				try
					result = fnToExecute.apply(fnContext, args)
				catch err
					postMessage {ID, status:'reject', payload:_stringifyError(err)}
					hasError = true

				unless hasError
					Promise.resolve(result)
						.then (result)-> postMessage {ID, status:'resolve', payload:_stringifyPayload(result)}
						.catch (result)-> postMessage {ID, status:'reject', payload:_stringifyPayload(result)}
			
			.catch (err)->
				postMessage {ID, status:'reject', payload:_stringifyError(err)}



	threadEmit = (event, payload)->
		postMessage {ID:event, payload:_stringifyPayload(payload)}





	return






