### istanbul ignore next ###
FakeWorker = ()->
	@isAlive = true
	@messageCallback = null
	_fnToExecute = null
	_fnContext = null
	_globalsString = ''
	_scriptsLoaded = Promise.resolve()

	threadEmit = (event, payload)=>
		postMessage {ID:event, payload}
	

	postMessage = (message)=>
		@messageCallback(message)


	fetchExternal = (url)-> new Promise (resolve, reject)->
		request = new XMLHttpRequest()
		request.open 'GET', url, true

		request.onerror = reject
		request.onreadystatechange = ()-> if @readyState is 4
			if 200 >= @status < 400
				resolve(@responseText)
			else
				reject new Error("External fetch failed (status:#{@status}): #{@responseText}")

		request.send()


	fetchModule = (module)->
		moduleName = module.split('#')[0]
		moduleLabel = module.split('#')[1] or moduleName
		moduleName = moduleName.replace /\//g, '%2F'

		fetchExternal("https://wzrd.in/bundle/#{moduleName}").then (result)-> if result
			result = result.slice(0,-1) # Remove trailing semicolon (since we are going to wrap it in parentheses)
			_globalsString += "var #{moduleLabel} = (#{result})('#{moduleName}');"
			setFn()


	setFn = (fnString)->
		fnString ?= _fnToExecute.toString()
		_fnToExecute = eval "#{_globalsString} (#{fnString})"


	setGlobals = (obj)->
		_globalsString += helpers.stringifyAsGlobals(obj)
		setFn()
		return
	
	setScripts = (scripts)-> _scriptsLoaded = new Promise (finalResolve, finalReject)=>
		completedScripts = 0
		
		for script in scripts
			scriptPromise = switch typeof script
				when 'function'
					Promise.resolve script.call(self)

				when 'string'
					if script.slice(0,7) is 'MODULE:'
						fetchModule(script.slice(7))
					else
						fetchExternal(script).then (result)->
							eval("(#{result})") if result

				else Promise.resolve()

			scriptPromise
				.then ()-> finalResolve() if ++completedScripts is scripts.length
				.catch(finalReject)

		return


	run = (ID, args=[])->
		_scriptsLoaded
			.then ()=>
				try
					result = _fnToExecute.apply(_fnContext, args)
				catch err
					postMessage {ID, status:'reject', payload:err}
					hasError = true

				unless hasError
					Promise.resolve(result)
						.then (payload)-> postMessage {ID, status:'resolve', payload}
						.catch (payload)-> postMessage {ID, status:'reject', payload}
			
			.catch (err)=>
				postMessage {ID, status:'reject', payload:err}


	@onmessage = (data)->
		command = data.command
		payload = data.payload
		ID = data.ID

		switch command
			when 'setGlobals' then setGlobals(payload)
			when 'setScripts' then setScripts(payload)
			when 'setContext' then _fnContext = payload
			when 'setFn' then setFn(payload)
			when 'run' then run(ID, payload)


	return @



### istanbul ignore next ###
FakeWorker:: =
	addEventListener: (event, callback)->
		@messageCallback = callback if @isAlive


	postMessage: (message)->
		@onmessage(message) if @isAlive

	terminate: ()->
		@isAlive = false








