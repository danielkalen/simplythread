expect = chai.expect
should = chai.should()






FN =
	err: ()-> throw new Error('sample error')
	subtracter: (a, b)-> a-b
	adder: (a, b)-> a+b
	adderPromise: (a, b)-> new Promise (resolve)-> resolve(a+b)
	adderPromiseFail: (a, b)-> new Promise (resolve, reject)-> reject(a+b)
	context: (num)-> @prop+num
	contextReturn: ()-> @


suite "SimplyThread", ()->
	
	suite ".create()", ()->
		test "will create a new thread with a given function", ()->
			adderThread = SimplyThread.create FN.adder

			adderThread.should.have.keys 'fn', 'fnString', 'status'
			adderThread.fn.should.equal FN.adder
			adderThread.status.should.equal 'active'
			adderThread.kill()


		
		test "will create a new thread without a function", ()->
			emptyThread = SimplyThread.create()
			
			emptyThread.should.have.keys 'fn', 'fnString', 'status'
			should.not.exist(emptyThread.fn)
			emptyThread.kill()




	suite ".list()", ()->
		test "will return an array containing all running threads", ()->
			sampleThreads = [SimplyThread.create(), SimplyThread.create(), SimplyThread.create()]

			SimplyThread.list().should.be.an 'array'
			SimplyThread.list().should.have.members sampleThreads
			sampleThreads.forEach (thread)-> thread.kill()




	suite ".killAll()", ()->
		test "will kill all running threads", ()->
			sampleThreads = [SimplyThread.create(), SimplyThread.create(), SimplyThread.create()]

			SimplyThread.killAll().should.be.an 'array'
			SimplyThread.killAll().should.not.have.members sampleThreads
			sampleThreads.forEach (thread)-> thread.kill()






	suite "Thread", ()->
		emptyThread = errThread = adderThread = adderPromiseThread = adderPromiseFailThread = subtracterThread = contextThread = contextReturnThread = null
		suiteSetup ()->
			emptyThread = SimplyThread.create()
			errThread = SimplyThread.create FN.err
			adderThread = SimplyThread.create FN.adder
			adderPromiseThread = SimplyThread.create FN.adderPromise
			adderPromiseFailThread = SimplyThread.create FN.adderPromiseFail
			subtracterThread = SimplyThread.create FN.subtracter
			contextThread = SimplyThread.create FN.context
			contextReturnThread = SimplyThread.create FN.contextReturn
		
		# ==== Run =================================================================================
		suite ".run()", ()->
			test "will execute the given function with given arguments and return a thenable object (promise)", (done)->
				promise = adderThread.run(10, 20)
				promise.then.should.be.a('function')
				promise.catch.should.be.a('function')

				promise.then (result)->
					result.should.equal 30
					done()


			test "will execute the same way with functions that return a promise", (done)->
				promise = adderPromiseThread.run(10, 20)
				promise.then.should.be.a('function')
				promise.catch.should.be.a('function')

				promise.then (result)->
					result.should.equal 30
					done()



			test "will return an error if no function was given during thread creation or manually set", (done)->
				emptyThread.run().catch (err)->
					err.should.be.an 'error'
					done()



			test "if an error occured in the thread, promise should return it in its .catch() method (in a string version)", (done)->
				errThread.run().catch (err)->
					err.should.be.a 'string'
					err.split(':')[0].should.match(/Error/)
					done()

			
			test "will return a rejected promise if the given function returned a rejected promise", (done)->
				adderPromiseFailThread.run(10, 20).catch (failure)->
					failure.should.equal 30
					done()






		# ==== Set Function =================================================================================
		suite ".setFn()", ()->
			test "will execute empty threads normally if a function was later set with .setFn", (done)->
				myEmptyThread = SimplyThread.create()
				
				myEmptyThread
					.setFn FN.adder
					.run(20, 40).then (result)->
						result.should.equal 60
						myEmptyThread.kill()
						done()
			

			test "will replace the existing function with the one specified", (done)->
				notEmptyThread = SimplyThread.create FN.adder
				
				notEmptyThread
					.setFn FN.subtracter
					.run(100, 75).then (result)->
						result.should.equal 25
						notEmptyThread.kill()
						done()


			test "will use the second argument, if passed, as the context of the function", (done)->
				myContextReturnThread = SimplyThread.create()

				myContextReturnThread
					.setFn (()-> @), {'prop': 5}
					.run().then (result)->
						result.should.be.an 'object'
						result.should.have.keys 'prop'
						result.prop.should.equal 5
						done()

	




		# ==== Set Context =================================================================================
		suite ".setContext()", ()->
			test "will set the function's 'this' keyword to the given argument", (done)->				
				contextThread
					.setContext {'prop': 5}
					.run(8).then (result)->
						result.should.equal 13
						done()


			test "will use contexts that have function, but will omit them", (done)->
				contextReturnThread
					.setContext {'name':'someObject', 'fn':()-> 'blabla'}
					.run().then (result)->
						result.should.be.an 'object'
						should.exist result.name
						should.not.exist result.fn
						done()


			test "will use contexts that have circular references (1 level max) and will omit DOM objects", (done)->
				obj = {'subA':{'prop1','prop2','prop3'}, 'subB':{'prop1','prop2','prop3'}, 'subC':{'prop1','prop2','prop3'} }
				for sub of obj
					obj[sub].parent = obj
					obj[sub].self = obj[sub]
					obj[sub].DOM = jQuery('body')[0]
					obj[sub].DOM$ = jQuery('body')
				obj.self = obj
				

				contextReturnThread
					.setContext obj
					.run().then (result)->
						result.should.be.an 'object'
						should.exist result.self
						result.subA.should.be.an 'object'
						result.subB.should.be.an 'object'
						result.subC.should.be.an 'object'
						should.exist result.subA.prop1
						should.exist result.subB.prop2
						should.exist result.subC.prop3
						should.not.exist result.subA.self
						should.not.exist result.subB.self
						should.not.exist result.subC.self
						should.exist result.subA.parent
						should.exist result.subB.parent
						should.exist result.subC.parent
						should.exist result.subA.DOM$
						should.exist result.subB.DOM$
						should.exist result.subC.DOM$
						should.exist result.subA.DOM
						should.exist result.subB.DOM
						should.exist result.subC.DOM
						result.subA.DOM.should.be.empty
						result.subB.DOM.should.be.empty
						result.subC.DOM.should.be.empty

						result.self.should.deep.equal(result)
						result.subA.parent.should.deep.equal(result)
						done()



	




		# ==== Kill =================================================================================
		suite ".kill()", ()->
			test "will terminate the thread and set its status to 'dead'", ()->
				sampleThread = SimplyThread.create()
				sampleThread.status.should.equal 'active'

				sampleThread.kill()
				sampleThread.status.should.equal 'dead'


			test "will cause any function runs on a killed thread to do nothing", (done)->
				status = {'resolved':false, 'rejected':false}
				sampleThread = SimplyThread.create(FN.adder)
				sampleThread.kill()
				
				promise = sampleThread.run(1,2)
				promise.then ()-> status.resolved = true
				promise.catch ()-> status.rejected = true


				setTimeout ()->
					status.resolved.should.be.false
					status.rejected.should.be.false
					done()
				, 100




		suiteTeardown ()-> SimplyThread.killAll()














