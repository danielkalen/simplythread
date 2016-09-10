do ()->
	supports = 
		'workers': !!window.Worker and !!window.Blob and !!window.URL
		'promises': !!window.Promise

	SimplyThread = new ()->
		threads = []

		@create = (fn)->
			newThread = new ThreadInterface(fn)
			threads.push newThread
			
			return newThread

		
		@remove = (threadInstance)->
			threadIndex = threads.indexOf threadInstance
			
			unless threadIndex is -1
				threads.splice threadIndex, 1


		@list = ()-> threads.slice()

		@killAll = ()->
			threads.forEach (thread)-> thread.kill()
			return @list()

		return @





	import '_parts/thread_interface.coffee'
	import '_parts/thread.coffee'
	import '_parts/worker.coffee'
	import '_parts/polyfill.coffee'

	window.SimplyThread = SimplyThread
