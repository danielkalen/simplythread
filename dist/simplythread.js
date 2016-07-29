var slice=[].slice;!function(){var SimplyThread,Thread,ThreadInterface,circularReference,functionReference,parseFnsInArgs,parseFnsInObjects,promisePolyfill,stringifyFnsInArgs,stringifyFnsInObjects,supports,workerScript,workerScriptRegEx;return supports={workers:!!window.Worker&&!!window.Blob&&!!window.URL,promises:!!window.Promise},SimplyThread=new function(){var e;return e=[],this.create=function(n){var t;return t=new ThreadInterface(n),e.push(t),t},this.remove=function(n){var t;return t=e.indexOf(n),-1!==t?e.splice(t,1):void 0},this.list=function(){return e.slice()},this.killAll=function(){return e.forEach(function(e){return e.kill()}),this.list()},this},circularReference="**_circular_**",functionReference="**_function_**",ThreadInterface=function(e){var n,t;return this.fn=e,this.fnString=null!=(n=this.fn)?n.toString():void 0,this.status="active",t=new Thread(this.fn,this.fnString),Object.defineProperty(this,"thread",{enumerable:!1,configurable:!1,get:function(){return t}}),this},ThreadInterface.prototype.run=function(){var e;return e=1<=arguments.length?slice.call(arguments,0):[],new Promise(function(n){return function(t,r){return"function"==typeof n.fn?n.thread.sendCommand("run",stringifyFnsInArgs(e)).then(function(e){return t(parseFnsInObjects(e))},r):r(new Error("No function was set for this thread."))}}(this))},ThreadInterface.prototype.setFn=function(e,n){return"function"==typeof e&&(this.fn=e,this.fnString=e.toString(),this.thread.sendCommand("setFn",this.fnString),this.setContext(n)),this},ThreadInterface.prototype.setGlobals=function(e){return this.thread.sendCommand("setGlobals",stringifyFnsInObjects(e)),this},ThreadInterface.prototype.setContext=function(e){var n,t;try{n=JSON.stringify(e)}catch(t){n=function(){var n,t;return n=[],t=JSON.stringify(e,function(t,r){if(null!==r&&"object"==typeof r){if(-1!==n.indexOf(r))return r===e?circularReference:(null!=r?r.nodeName:void 0)&&r.nodeType?r:"function"==typeof r?functionReference+r.toString():void 0;n.push(r)}return r}),n=null,t}()}return this.thread.sendCommand("setContext",n),this},ThreadInterface.prototype.kill=function(){var e;return null!=(e=this.thread)&&e.worker.terminate(),this.status="dead",SimplyThread.remove(this),this},stringifyFnsInArgs=function(e){var n,t,r,o,i;for(i=[],r=t=0,o=e.length;o>t;r=++t)n=e[r],"function"==typeof n?i[r]=functionReference+n.toString():i[r]=n;return i},stringifyFnsInObjects=function(e,n){var t,r;if(null==n&&(n=[]),"function"==typeof e)return functionReference+e.toString();for(t in e)r=e[t],"object"==typeof r&&-1===n.indexOf(r)?(n.push(r),e[t]=stringifyFnsInObjects(r,n)):"function"==typeof r&&(e[t]=functionReference+r.toString());return e},parseFnsInArgs=function(args){var ___,arg,i,index,len,newArgs;for(newArgs=[],___=void 0,index=i=0,len=args.length;len>i;index=++i)arg=args[index],"string"==typeof arg&&0===arg.indexOf(functionReference)?newArgs[index]=eval("___ ="+arg.replace(functionReference,"")):newArgs[index]=arg;return newArgs},parseFnsInObjects=function(object,cache){var ___,key,value;if(null==cache&&(cache=[]),___=void 0,"string"==typeof object&&0===object.indexOf(functionReference))return eval("___ ="+object.replace(functionReference,""));cache.push(object);for(key in object)value=object[key],"object"==typeof value&&-1===cache.indexOf(value)?(cache.push(value),object[key]=parseFnsInObjects(value,cache)):"string"==typeof value&&0===value.indexOf(functionReference)&&(object[key]=eval("___ ="+value.replace(functionReference,"")));return object},Thread=function(e,n){return this.fn=e,this.fnString=n,this.worker=this.init(),this.fn&&this.sendCommand("setFn",this.fnString),this},Thread.prototype.init=function(){return supports.workers?new Worker(this.createURI()):!1},Thread.prototype.createURI=function(){var e,n;return n=workerScript.toString().match(workerScriptRegEx)[1],supports.promises||(n+=promisePolyfill),e=new Blob([n],{type:"application/javascript"}),URL.createObjectURL(e)},Thread.prototype.sendCommand=function(e,n){return new Promise(function(t){return function(r,o){var i;if(t.worker)return i=function(e){switch(e.data.status){case"resolve":r(e.data.payload);break;case"reject":o(e.data.payload)}return t.worker.removeEventListener("message",i)},"run"===e&&t.worker.addEventListener("message",i),t.worker.postMessage({command:e,payload:n});switch(e){case"run":if(t.fn)return t.fn.apply(t.context,n);break;case"setFn":if("function"==typeof n)return t.fn=n;break;case"setContext":return t.context=n}}}(this))},workerScriptRegEx=/^\s*function\s*\(\)\s*\{\s*([\w\W]+)\s*\}\s*$/,workerScript=function(){var fnContext,fnToExecute,onmessage,replaceCircular,run,setContext,setFn,setGlobals;fnToExecute=function(){},fnContext=null,circularReference="**_circular_**",functionReference="**_function_**",onmessage=function(e){var n,t;switch(n=e.data.command,t=e.data.payload,n){case"setContext":return setContext(t);case"setGlobals":return setGlobals(t);case"setFn":return setFn(t);case"run":return run(t)}},setGlobals=function(e){var n,t,r;e=parseFnsInObjects(e),t=[];for(n in e)r=e[n],t.push(self[n]=r);return t},setContext=function(e){return"object"==typeof e?fnContext=e:(e=JSON.parse(e),fnContext=replaceCircular(e,e))},setFn=function(fnString){return eval("fnToExecute = "+fnString)},run=function(e){var n,t,r,o;null==e&&(e=[]);try{o=fnToExecute.apply(fnContext,parseFnsInArgs(e))}catch(t){n=t,postMessage({status:"reject",payload:n.name+": "+n.message}),r=!0}return r?void 0:o&&o.then?(o.then(function(e){return postMessage({status:"resolve",payload:stringifyFnsInObjects(e)})}),o["catch"](function(e){return postMessage({status:"reject",payload:stringifyFnsInObjects(e)})})):postMessage({status:"resolve",payload:stringifyFnsInObjects(o)})},replaceCircular=function(object,context){var key,value;for(key in object)value=object[key],value===circularReference?object[key]=context:"object"!=typeof value||Array.isArray(value)?"string"==typeof value&&0===value.indexOf(functionReference)&&(object[key]=eval("___ ="+value.replace(functionReference,""))):object[key]=replaceCircular(value,object);return object},stringifyFnsInArgs=function(e){var n,t,r,o,i;for(i=[],r=t=0,o=e.length;o>t;r=++t)n=e[r],"function"==typeof n?i[r]=functionReference+n.toString():i[r]=n;return i},stringifyFnsInObjects=function(e,n){var t,r;if(null==n&&(n=[]),"function"==typeof e)return functionReference+e.toString();for(t in e)r=e[t],"object"==typeof r&&-1===n.indexOf(r)?(n.push(r),e[t]=stringifyFnsInObjects(r,n)):"function"==typeof r&&(e[t]=functionReference+r.toString());return e},parseFnsInArgs=function(args){var ___,arg,i,index,len,newArgs;for(newArgs=[],___=void 0,index=i=0,len=args.length;len>i;index=++i)arg=args[index],"string"==typeof arg&&0===arg.indexOf(functionReference)?newArgs[index]=eval("___ ="+arg.replace(functionReference,"")):newArgs[index]=arg;return newArgs},parseFnsInObjects=function(object,cache){var ___,key,value;if(null==cache&&(cache=[]),___=void 0,"string"==typeof object&&0===object.indexOf(functionReference))return eval("___ ="+object.replace(functionReference,""));cache.push(object);for(key in object)value=object[key],"object"==typeof value&&-1===cache.indexOf(value)?(cache.push(value),object[key]=parseFnsInObjects(value,cache)):"string"==typeof value&&0===value.indexOf(functionReference)&&(object[key]=eval("___ ="+value.replace(functionReference,"")));return object}},promisePolyfill='(function(){"use strict";var f,g=[];function l(a){g.push(a);1==g.length&&f()}function m(){for(;g.length;)g[0](),g.shift()}f=function(){setTimeout(m)};function n(a){this.a=p;this.b=void 0;this.f=[];var b=this;try{a(function(a){q(b,a)},function(a){r(b,a)})}catch(c){r(b,c)}}var p=2;function t(a){return new n(function(b,c){c(a)})}function u(a){return new n(function(b){b(a)})}function q(a,b){if(a.a==p){if(b==a)throw new TypeError;var c=!1;try{var d=b&&b.then;if(null!=b&&"object"==typeof b&&"function"==typeof d){d.call(b,function(b){c||q(a,b);c=!0},function(b){c||r(a,b);c=!0});return}}catch(e){c||r(a,e);return}a.a=0;a.b=b;v(a)}} function r(a,b){if(a.a==p){if(b==a)throw new TypeError;a.a=1;a.b=b;v(a)}}function v(a){l(function(){if(a.a!=p)for(;a.f.length;){var b=a.f.shift(),c=b[0],d=b[1],e=b[2],b=b[3];try{0==a.a?"function"==typeof c?e(c.call(void 0,a.b)):e(a.b):1==a.a&&("function"==typeof d?e(d.call(void 0,a.b)):b(a.b))}catch(h){b(h)}}})}n.prototype.g=function(a){return this.c(void 0,a)};n.prototype.c=function(a,b){var c=this;return new n(function(d,e){c.f.push([a,b,d,e]);v(c)})}; function w(a){return new n(function(b,c){function d(c){return function(d){h[c]=d;e+=1;e==a.length&&b(h)}}var e=0,h=[];0==a.length&&b(h);for(var k=0;k<a.length;k+=1)u(a[k]).c(d(k),c)})}function x(a){return new n(function(b,c){for(var d=0;d<a.length;d+=1)u(a[d]).c(b,c)})};window.Promise||(window.Promise=n,window.Promise.resolve=u,window.Promise.reject=t,window.Promise.race=x,window.Promise.all=w,window.Promise.prototype.then=n.prototype.c,window.Promise.prototype["catch"]=n.prototype.g);}());',window.SimplyThread=SimplyThread}();