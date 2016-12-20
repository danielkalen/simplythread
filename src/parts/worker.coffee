## ==========================================================================
## Worker script
## ========================================================================== 
### istanbul ignore next ###
workerScript = ()->
	globalEval = eval

	threadEmit = (event, payload)->
		postMessage {ID:event, payload:helpers.stringifyPayload(payload)}

	do ()->
		_fnToExecute = null
		_fnContext = null
		_scriptsLoaded = Promise.resolve()

		stringifyError = ({name, message, stack})->
			if name
				helpers.stringifyPayload {name, message, stack}
			else
				helpers.stringifyPayload arguments[0]

		
		fetchExternal = (url)-> new Promise (resolve, reject)->
			request = new XMLHttpRequest()
			request.open 'GET', url, true

			request.onerror = reject
			request.onload = ()->
				if 200 >= @status < 400
					resolve(@response)
				else
					reject new Error("External fetch failed (status:#{request.status}): #{request.response}")

			request.send()


		fetchModule = (module)->
			moduleName = module.split('#')[0]
			moduleLabel = module.split('#')[1] or moduleName
			moduleName = moduleName.replace /\//g, '%2F'

			fetchExternal("https://wzrd.in/bundle/#{moduleName}").then (result)-> if result
				loader = globalEval(result)
				self[moduleLabel] = loader(moduleName)
		

		setGlobals = (obj)->
			for key,value of obj
				self[key] = value
			return
		
		setScripts = (scripts)-> _scriptsLoaded = new Promise (finalResolve, finalReject)->
			completedScripts = 0

			for script in scripts then do (script)->
				scriptPromise = switch typeof script
					when 'function'
						Promise.resolve script.call(self)

					when 'string'
						if script.slice(0,7) is 'MODULE:'
							fetchModule(script.slice(7))
						else
							fetchExternal(script).then (result)->
								globalEval("(#{result})") if result

					else Promise.resolve()

				scriptPromise
					.then ()-> finalResolve() if ++completedScripts is scripts.length
					.catch(finalReject)

			return


		run = (ID, args=[])->
			_scriptsLoaded
				.then ()->
					try
						result = _fnToExecute.apply(_fnContext, args)
					catch err
						postMessage {ID, status:'reject', payload:stringifyError(err)}
						hasError = true

					unless hasError
						Promise.resolve(result)
							.then (result)-> postMessage {ID, status:'resolve', payload:helpers.stringifyPayload(result)}
							.catch (result)-> postMessage {ID, status:'reject', payload:helpers.stringifyPayload(result)}
				
				.catch (err)->
					postMessage {ID, status:'reject', payload:stringifyError(err)}


		@onmessage = (e)->
			command = e.data.command
			payload = e.data.payload
			ID = e.data.ID

			switch command
				when 'setGlobals' then setGlobals(helpers.parsePayload payload)
				when 'setScripts' then setScripts(helpers.parsePayload payload)
				when 'setContext' then _fnContext = helpers.parsePayload payload
				when 'setFn' then _fnToExecute = globalEval "(#{payload})"
				when 'run' then run(ID, helpers.parsePayload payload)





	return






