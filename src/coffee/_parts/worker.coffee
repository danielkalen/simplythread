## ==========================================================================
## Worker script
## ========================================================================== 
workerScriptRegEx = /^\s*function\s*\(\)\s*\{\s*([\w\W]+)\s*\}\s*$/

workerScript = ()->
	fnToExecute = ()->
	fnContext = null
	circularReference = '**_circular_**'
	
	onmessage = (e)->
		command = e.data.command
		payload = e.data.payload
		
		switch command
			when 'setContext' then setContext(payload)
			when 'setFn' then setFn(payload)
			when 'run' then run(payload)

	

	setContext = (context)->
		if typeof context is 'object'
			fnContext = context
		else
			context = JSON.parse context
			fnContext = setContext.replaceCircular(context, context)

	setContext.replaceCircular = (object, context)->
		for key,value of object
			if value is circularReference
				object[key] = context

			else if typeof value is 'object' and not Array.isArray(value)
				object[key] = setContext.replaceCircular(value, object)

		return object



	setFn = (fnString)-> eval("fnToExecute = #{fnString}")

	run = (args=[])->
		try
			result = fnToExecute.apply(fnContext, args)
		catch err
			postMessage({status:'reject', payload:"#{err.name}: #{err.message}"})
			hasError = true

		unless hasError
			if result and result.then
				result.then (result)-> postMessage({'status':'resolve', 'payload':result})
				result.catch (result)-> postMessage({'status':'reject', 'payload':result})

			else
				postMessage({'status':'resolve', 'payload':result})


	return
