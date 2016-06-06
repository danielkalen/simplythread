## ==========================================================================
## Worker script
## ========================================================================== 
workerScript = ()->
	fnToExecute = ()->
	fnContext = null
	
	onmessage = (e)->
		command = e.data.command
		payload = e.data.payload
		
		switch command
			when 'setContext' then setContext(payload)
			when 'setFn' then setFn(payload)
			when 'run' then run(payload)

	

	setContext = (context)-> fnContext = context

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
