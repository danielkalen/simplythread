## ==========================================================================
## Worker script
## ========================================================================== 
workerScriptRegEx = /^\s*function\s*\(\)\s*\{\s*([\w\W]+)\s*\}\s*$/

workerScript = ()->
	fnToExecute = ()->
	fnContext = null
	circularReference = '**_circular_**'
	functionReference = '**_function_**'
	
	onmessage = (e)->
		command = e.data.command
		payload = e.data.payload
		ID = e.data.ID
		
		switch command
			when 'setContext' then setContext(payload)
			when 'setGlobals' then setGlobals(payload)
			when 'setScripts' then setScripts(payload)
			when 'setFn' then setFn(payload)
			when 'run' then run(payload, ID)

	
	setGlobals = (obj)->
		obj = parseFnsInObjects(obj)
		for key,value of obj
			self[key] = value
	
	setScripts = (scripts)->
		for script in scripts 
			
			switch script.indexOf(functionReference) isnt -1
				when true
					self.scriptImport = parseFnsInObjects(script)
					self.scriptImport()
					delete self.scriptImport
				
				when false
					importScripts(script)
					# try
					# catch err
					# 	console.log err

		return


	setContext = (context)->
		if typeof context is 'object'
			fnContext = context
		else
			context = JSON.parse context
			fnContext = replaceCircular(context, context)



	setFn = (fnString)-> eval("fnToExecute = #{fnString}")

	run = (args=[], ID)->
		try
			result = fnToExecute.apply(fnContext, parseFnsInArgs(args))
		catch err
			postMessage {ID, status:'reject', payload:normalizeError(err)}
			hasError = true

		unless hasError
			Promise.resolve(result)
				.then (result)-> postMessage {ID, status:'resolve', payload:stringifyFnsInObjects(result)}
				.catch (result)-> postMessage {ID, status:'reject', payload:stringifyFnsInObjects(result)}



	threadEmit = (event, payload)->
		postMessage {ID:event, payload:stringifyFnsInObjects(payload)}



	# ==== Helpers =================================================================================
	normalizeError = ({name, message, stack})->
		{name, message, stack}


	replaceCircular = (object, context)->
		for key,value of object
			if value is circularReference
				object[key] = context

			else if typeof value is 'object' and not Array.isArray(value)
				object[key] = replaceCircular(value, object)

			else if typeof value is 'string' and value.indexOf(functionReference) is 0
				object[key] = eval('___ ='+value.replace functionReference, '')

		return object



	stringifyFnsInArgs = (args)->
		newArgs = []
		
		for arg,index in args
			if typeof arg is 'function'
				newArgs[index] = functionReference+arg.toString()
			else
				newArgs[index] = arg

		return newArgs


	stringifyFnsInObjects = (object, cache=[])->
		if typeof object is 'function'
			return functionReference+object.toString()
		
		else if typeof object is 'object'
			cache.push(object)
			newObj = if Array.isArray(object) then [] else {}

			for key,value of object
				if typeof value is 'object' and cache.indexOf(value) is -1
					cache.push(value)
					newObj[key] = stringifyFnsInObjects(value, cache)
				
				else if typeof value is 'function'
					newObj[key] = functionReference+value.toString()

				else
					newObj[key] = value

			return newObj

		else
			return object

			

	parseFnsInArgs = (args)->
		newArgs = []
		___ = undefined
		
		for arg,index in args
			if typeof arg is 'string' and arg.indexOf(functionReference) is 0
				newArgs[index] = eval('___ ='+arg.replace functionReference, '')
			else
				newArgs[index] = arg

		return newArgs




	parseFnsInObjects = (object, cache=[])->	
		___ = undefined
		if typeof object is 'string' and object.indexOf(functionReference) is 0
			return eval('___ ='+object.replace functionReference, '')

		cache.push(object)
		
		for key,value of object
			if typeof value is 'object' and cache.indexOf(value) is -1
				cache.push(value)
				object[key] = parseFnsInObjects(value, cache)
			
			else if typeof value is 'string' and value.indexOf(functionReference) is 0
				object[key] = eval('___ ='+value.replace functionReference, '')

		return object









	return
