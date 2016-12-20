do ()->
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
			threads.slice().forEach (thread)-> thread.kill()
			return true

		return @





	import parts/helpers
	import parts/promise-polyfill
	import parts/threadInterface
	import parts/thread
	import parts/worker
	SimplyThread.version = import ../.config/.version

	`/* istanbul ignore next */`
	if exports?.module?
		module.exports = SimplyThread
	else if typeof define is 'function' and define.amd
		define ['simplythread'], ()-> SimplyThread
	else
		@SimplyThread = SimplyThread
