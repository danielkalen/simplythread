mocha.setup('tdd')
mocha.slow(400)
mocha.bail()
expect = chai.expect
should = chai.should()
location.origin ?= "#{location.protocol}//#{location.hostname}#{if location.port then ':'+location.port else ''}"
basePath = location.origin + location.pathname.replace /\/[^\/]+$/, ''
basePath = basePath.replace /\/test$/, ''
basePath += '/base' if window.isKarma or window.isSauce
isIE9 = /MSIE 9/.test navigator.userAgent
isLocalEnv = window.location.protocol is 'file:'
Promise.config warnings:false

if __coverage__?
	coverageVar = Object.keys(window).filter((varKey)-> varKey.slice(0,6) is '__cov_')[0]
	coverageObj = __coverage__[Object.keys(__coverage__)[0]]
	SimplyThread.threadDeps = "var #{coverageVar} = #{JSON.stringify(coverageObj)};"

FN =
	subtracter: (a, b)-> a-b
	adder: (a, b)-> a+b
	adderPromise: (a, b)-> new Promise (resolve)-> resolve(a+b)
	adderPromiseFail: (a, b)-> new Promise (resolve, reject)-> reject(a+b)
	delayedPromise: (a, b)-> new Promise (resolve)-> setTimeout (()->resolve(a+b)), 150*Math.random()
	context: (num)-> @prop+num
	contextReturn: ()-> @
	globals: (propName)-> eval(propName)
	globalsInvoker: (propName, arg)-> eval(propName)(arg)
	invoker: (a, b)-> a(b)
	emitter: ()->
		threadEmit('someEvent', 'first')
		setTimeout ()->
			threadEmit('diffEvent', 'second')
		, 20
		setTimeout ()->
			threadEmit('someEvent', 'third')
		, 35
		setTimeout ()->
			threadEmit('diffEvent', 'fourth')
		, 45


suite "SimplyThread", ()->
	
	suite ".create()", ()->
		test "will create a new thread with a given function", ()->
			adderThread = SimplyThread.create FN.adder

			expect(adderThread).to.have.any.keys 'fn', 'status', 'fnString', 'worker', 'socket'
			expect(adderThread.fn).to.equal FN.adder
			expect(adderThread.status).to.equal 'active'
			adderThread.kill()


		
		test "will create a new thread without a function", ()->
			emptyThread = SimplyThread.create()
			
			expect(emptyThread).to.have.any.keys 'fn', 'fnString', 'status'
			expect(emptyThread.fn).to.not.exist
			emptyThread.kill()




	suite ".list()", ()->
		test "will return an array containing all running threads", ()->
			sampleThreads = [SimplyThread.create(), SimplyThread.create(), SimplyThread.create()]

			expect(SimplyThread.list()).to.be.an 'array'
			expect(SimplyThread.list()).to.have.members sampleThreads
			sampleThreads.forEach (thread)-> thread.kill()




	suite ".killAll()", ()->
		test "will kill all running threads", ()->
			expect(SimplyThread.list().length).to.equal 0
			sampleThreads = [SimplyThread.create(), SimplyThread.create(), SimplyThread.create()]

			expect(SimplyThread.list().length).to.equal 3
			expect(SimplyThread.killAll()).to.be.true
			expect(SimplyThread.list()).to.not.have.members sampleThreads
			expect(SimplyThread.list().length).to.equal 0






	suite "Thread", ()->
		emptyThread = adderThread = adderPromiseThread = adderPromiseFailThread = delayedPromiseThread = subtracterThread = contextThread = contextReturnThread = globalsThread = globalsInvokerThread = invokerThread  = emitterThread = null
		suiteSetup ()->
			emptyThread = SimplyThread.create()
			adderThread = SimplyThread.create FN.adder
			adderPromiseThread = SimplyThread.create FN.adderPromise
			adderPromiseFailThread = SimplyThread.create FN.adderPromiseFail
			delayedPromiseThread = SimplyThread.create FN.delayedPromise
			subtracterThread = SimplyThread.create FN.subtracter
			contextThread = SimplyThread.create FN.context
			contextReturnThread = SimplyThread.create FN.contextReturn
			globalsThread = SimplyThread.create FN.globals
			globalsInvokerThread = SimplyThread.create FN.globalsInvoker
			invokerThread = SimplyThread.create FN.invoker
			emitterThread = SimplyThread.create FN.emitter
		
		# ==== Run =================================================================================
		suite ".run()", ()->
			test "will execute the given function with given arguments and return a thenable object (promise)", ()->
				promise = adderThread.run(10, 20)
				expect(promise.then).to.be.a('function')
				expect(promise.catch).to.be.a('function')

				promise.then (result)->
					expect(result).to.equal 30


			test "will execute the same way with functions that return a promise", ()->
				promise = adderPromiseThread.run(10, 20)
				expect(promise.then).to.be.a('function')
				expect(promise.catch).to.be.a('function')

				promise.then (result)->
					expect(result).to.equal 30


			test "will avoid conflicts with other runs of the same thread", ()->
				Promise
					.all([delayedPromiseThread.run(5,10), delayedPromiseThread.run(25,75), delayedPromiseThread.run(100,12)])
					.then (results)->
						expect(results[0]).to.equal 15
						expect(results[1]).to.equal 100
						expect(results[2]).to.equal 112


			test "will return an error if no function was given during thread creation or manually set", ()->
				emptyThread.run().catch (err)->
					expect(err).to.be.an 'error'



			test "if an error occured in the thread the run promise should be rejected", ()->
				errThread = SimplyThread.create ()-> throw new Error('sample error')
				errThread.run().catch (err)->
					expect(err).to.be.an 'error'
					errThread.kill()


			test "if an error occured in the thread then an error of the same type will be thrown on the main thread (via promise reject)", ()->
				window.errThread = SimplyThread.create ()-> throw new Error('sample error')
				errThread.run().catch (err)->
					expect(err).to.be.an 'error'
					expect(err.constructor).to.equal Error

					errThread
						.setFn ()-> someUndefinedVariable
						.run().catch (err)->
							expect(err).to.be.an 'error'
							expect(err.constructor).to.equal ReferenceError

							errThread
								.setFn ()-> throw 'Non error object'
								.run().catch (err)->
									expect(err).to.not.be.an 'error'
									expect(err.constructor).to.equal String
							
									errThread.kill()

			
			test "will return a rejected promise if the given function returned a rejected promise", ()->
				adderPromiseFailThread.run(10, 20).catch (failure)->
					expect(failure).to.equal 30


			test "can pass functions as arguments", ()->
				sampleFn = (string)-> string.toUpperCase()
				promise = invokerThread.run(sampleFn, 'simplythread')
				expect(promise.then).to.be.a('function')
				expect(promise.catch).to.be.a('function')

				promise.then (result)->
					expect(result).to.equal 'SIMPLYTHREAD'


			test "can return functions as results", ()->
				curryFn = (string)-> (string)-> string.toUpperCase()
				promise = invokerThread.run(curryFn, 'simplythread')
				expect(promise.then).to.be.a('function')
				expect(promise.catch).to.be.a('function')

				promise.then (result)->
					expect(result).to.be.a('function')
					expect(result('simplythread')).to.equal 'SIMPLYTHREAD'


			test "invoking postMessage() from inside the thread should not cause any errors in the library", ()->
				menaceThread = SimplyThread.create ()-> postMessage("I'm a menace"); "I'm a menace"
				expect(()->
					menaceThread.run().then (result)->
						expect(result).to.be.a.string
						menaceThread.kill()
				).not.to.throw()






		suite ".on()", ()->
			test "Will register an event and its callback to be invoked every time threadEmit(event) is invoked from the thread's main function", ()-> new Promise (resolve)=>
				@slow(700)
				emitCount = someEvent:0, diffEvent:0
				emitterThread.on 'someEvent', (payload)-> if emitCount.someEvent++ then expect(payload).to.equal('third') else expect(payload).to.equal('first')
				emitterThread.on 'diffEvent', (payload)-> if emitCount.diffEvent++ then expect(payload).to.equal('fourth') else expect(payload).to.equal('second')

				emitterThread.run().then ()->
					setTimeout ()->
						expect(emitCount.someEvent).to.equal 2
						expect(emitCount.diffEvent).to.equal 2
						resolve()
					, 75
			

			test "Will throw an error if the second argument isn't a function", ()->
				expect ()-> emitterThread.on 'someEvent'
					.to.throw()
				
				expect ()-> emitterThread.on 'someEvent', {}
					.to.throw()




		# ==== Set Function =================================================================================
		suite ".setFn()", ()->
			test "will execute empty threads normally if a function was later set with .setFn", ()->
				myEmptyThread = SimplyThread.create()
				
				myEmptyThread
					.setFn FN.adder
					.run(20, 40).then (result)->
						expect(result).to.equal 60
						myEmptyThread.kill()
			

			test "will replace the existing function with the one specified", ()->
				notEmptyThread = SimplyThread.create FN.adder
				
				notEmptyThread
					.setFn FN.subtracter
					.run(100, 75).then (result)->
						expect(result).to.equal 25
						notEmptyThread.kill()


			test "will use the second argument, if passed, as the context of the function", ()->
				myContextReturnThread = SimplyThread.create()

				myContextReturnThread
					.setFn (()-> @), {'prop': 5}
					.run().then (result)->
						expect(result).to.be.an 'object'
						expect(result).to.have.keys 'prop'
						expect(result.prop).to.equal 5
			

			test "Will throw an error if the provided argument isn't a function", ()->
				expect ()-> adderThread.setFn 'someEvent'
					.to.throw()
				
				expect ()-> adderThread.setFn {}
					.to.throw()
				
				expect ()-> adderThread.setFn()
					.to.throw()

	




		# ==== Set Globals =================================================================================
		suite ".setGlobals()", ()->
			test "receives an object as an argument and sets all of its values to the thread's global scope", ()->				
				globalsThread
					.setGlobals {'prop': 1000}
					.run('prop').then (result)->
						expect(result).to.equal 1000
			


			test "can set functions to be set as global variables", ()->				
				globalsInvokerThread
					.setGlobals {'someFn': (string)-> string.toUpperCase()}
					.run('someFn', 'simplythread').then (result)->
						expect(result).to.equal 'SIMPLYTHREAD'


			test "will only accept an argument of type object (and not null)", ()->
				expect ()-> globalsThread.setGlobals()
					.to.throw()
				
				expect ()-> globalsThread.setGlobals(null)
					.to.throw()
				
				expect ()-> globalsThread.setGlobals(()->)
					.to.throw()
				
				expect ()-> globalsThread.setGlobals({})
					.not.to.throw()
	




		# ==== Set External Scripts =================================================================================
		suite ".setScripts()", ()->
			test "will take an array of strings that act as network paths for external scripts and loads them inside the thread's global scope", ()-> if isLocalEnv then @skip() else
				globalsThread
					.setScripts ["#{basePath}/test/samplescript.js"]
					.run('sampleScriptName').then (result)->
						expect(result).to.equal 'just a sample script'
			

			test "will load an external script when provided in a non-array format value", ()-> if isLocalEnv then @skip() else
				globalsThread
					.setScripts "#{basePath}/test/samplescript.js"
					.run('sampleScriptName')
						.then (result)->
							expect(result).to.equal 'just a sample script'
						.catch (err)->
							console.log err
			

			test "will reject .run() calls' promises if failed to load any of the provided scripts", ()-> if isLocalEnv then @skip() else
				globalsThread
					.setScripts ["#{basePath}/test/samplescript.js", "#{basePath}/test/nonexistent.js"]
					.run('sampleScriptName')
						.then (result)-> # Should never executre
							expect(true).to.be.false
						.catch (err)->
							expect(err).to.be.an.error
			

			test "can load an NPM module when given a module's name with a 'MODULE:' prefix", ()-> if isLocalEnv or isIE9 then @skip() else
				SimplyThread
					.create (arr)-> lodash.join(arr, '~')
					.setScripts "MODULE:lodash"
					.run(['a', 'b', 'c']).then (result)->
						expect(result).to.equal 'a~b~c'
			

			test "can load an NPM module and expose it under a different name using 'MODULE:xyz#custonName'", ()-> if isLocalEnv or isIE9 then @skip() else
				SimplyThread
					.create (timeFrame)-> TimeUNITS[timeFrame]*3
					.setScripts "MODULE:timeunits#TimeUNITS"
					.run('hour').then (result)->
						expect(result).to.equal 10800000
			


			test "can accept functions that will be invoked immediatly on the thread's global scope", ()->				
				globalsThread
					.setScripts [()-> @scriptFromFn = 'just a sample script from a function']
					.run('scriptFromFn').then (result)->
						expect(result).to.equal 'just a sample script from a function'
			


			test "if passed functions that return a promise, that promise will be followed", ()->				
				globalsThread
					.setScripts [()-> new Promise (resolve)=> setTimeout ()=>
						resolve @scriptFromFn = 'sample script via promise']
					.run('scriptFromFn').then (result)->
						expect(result).to.equal 'sample script via promise'
			


	




		# ==== Set Context =================================================================================
		suite ".setContext()", ()->
			test "will set the thread's function's 'this' keyword to the provided argument", ()->				
				contextThread
					.setContext {'prop': 5}
					.run(8).then (result)->
						expect(result).to.equal 13


			test "will use contexts that have functions", ()->
				contextReturnThread
					.setContext {'name':'someObject', 'fn':()-> 'blabla'}
					.run().then (result)->
						expect(result).to.be.an 'object'
						should.exist result.name
						should.exist result.fn
						expect(result.name).to.equal 'someObject'
						expect(result.fn()).to.equal 'blabla'


			test "will use contexts that have circular references and will omit DOM objects", ()->
				obj = subA:{'prop1','prop2','prop3'}, subB:{'prop1','prop2','prop3'}, subC:{'prop1','prop2','prop3'} 
				for sub of obj
					obj[sub].parent = obj
					obj[sub].self = obj[sub]
					obj[sub].DOM = jQuery('body')[0]
					obj[sub].DOM$ = jQuery('body')
				obj.self = obj
				

				contextReturnThread
					.setContext obj
					.run().then (result)->
						expect(result).to.be.an 'object'
						should.exist result.self
						expect(result.subA).to.be.an 'object'
						expect(result.subB).to.be.an 'object'
						expect(result.subC).to.be.an 'object'
						should.exist result.subA.prop1
						should.exist result.subB.prop2
						should.exist result.subC.prop3
						should.exist result.subA.self
						should.exist result.subB.self
						should.exist result.subC.self
						should.exist result.subA.parent
						should.exist result.subB.parent
						should.exist result.subC.parent
						should.exist result.subA.DOM$
						should.exist result.subB.DOM$
						should.exist result.subC.DOM$
						should.not.exist result.subA.DOM if SimplyThread.SUPPORTS.workers
						should.not.exist result.subB.DOM if SimplyThread.SUPPORTS.workers
						should.not.exist result.subC.DOM if SimplyThread.SUPPORTS.workers

						expect(result.self).to.equal(result)
						expect(result.subA.parent).to.equal(result)
						expect(result.subA.self).to.equal(result.subA)
						expect(result.subB.self).to.equal(result.subB)
						expect(result.subC.self).to.equal(result.subC)



	




		# ==== Kill =================================================================================
		suite ".kill()", ()->
			test "will terminate the thread and set its status to 'dead'", ()->
				sampleThread = SimplyThread.create()
				expect(sampleThread.status).to.equal 'active'

				sampleThread.kill()
				expect(sampleThread.status).to.equal 'dead'


			test "will cause any function runs on a killed thread to do nothing", (done)->
				status = {'resolved':false, 'rejected':false}
				sampleThread = SimplyThread.create(FN.adder)
				sampleThread.kill()
				
				promise = sampleThread.run(1,2)
				promise.then ()-> status.resolved = true
				promise.catch ()-> status.rejected = true


				setTimeout ()->
					expect(status.resolved).to.be.false
					expect(status.rejected).to.be.false
					done()
				, 100




		suiteTeardown ()-> SimplyThread.killAll()














