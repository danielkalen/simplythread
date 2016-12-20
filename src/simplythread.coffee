do ()->
	SimplyThread = new ()->
		threads = []

		@create = (fn)->
			newThread = new ThreadInterface(fn)
			threads.push newThread
			
			return newThread

		
		@remove = (threadInstance)->
			threadIndex = threads.indexOf threadInstance
			threads.splice threadIndex, 1


		@list = ()-> threads.slice()

		@killAll = ()->
			threads.slice().forEach (thread)-> thread.kill()
			return true

		return @





	import parts/threadInterface
	import parts/worker
	import parts/fakeWorker
	import parts/helpers
	import parts/promise-polyfill
	SimplyThread.version = import ../.config/.version

	### istanbul ignore next ###
	if exports?.module?
		module.exports = SimplyThread
	else if typeof define is 'function' and define.amd
		define ['simplythread'], ()-> SimplyThread
	else
		@SimplyThread = SimplyThread
