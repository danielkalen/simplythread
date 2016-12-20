var slice=[].slice;!function(){var PRIMITIVE_TYPES,STRINGIFY_OPTS,SUPPORTS,SimplyThread,Thread,ThreadInterface,currentID,exposeStringifyFn,functionBodyRegEx,genTransactionID,promisePolyfill,threadEmit,workerScript;return SimplyThread=new function(){var t;return t=[],this.create=function(e){var n;return n=new ThreadInterface(e),t.push(n),n},this.remove=function(e){var n;return n=t.indexOf(e),t.splice(n,1)},this.list=function(){return t.slice()},this.killAll=function(){return t.slice().forEach(function(t){return t.kill()}),!0},this},functionBodyRegEx=/^\s*function\s*\(\)\s*\{\s*([\w\W]+)\s*\}\s*$/,SUPPORTS={workers:!!window.Worker&&!!window.Blob&&!!window.URL,promises:!!window.Promise},PRIMITIVE_TYPES={string:!0,number:!0,"boolean":!0,symbol:!0},STRINGIFY_OPTS={references:!0},currentID=0,genTransactionID=function(){return++currentID},exposeStringifyFn=function(){!function(t,e){"function"==typeof require&&"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define(function(){return e()}):t.javascriptStringify=e()}(this,function(){function t(t){var e=u[t];return e||"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)}function e(t){return!f[t]&&l.test(t)}function n(t){return"Function("+s("return this;")+")()"}function r(t){for(var n="",r=0;r<t.length;r++)n+=e(t[r])?"."+t[r]:"["+s(t[r])+"]";return n}function o(t,e,n){var r=t.map(function(t,r){var o=n(t,r);return void 0===o?String(o):e+o.split("\n").join("\n"+e)}).join(e?",\n":",");return e&&r?"[\n"+r+"\n]":"["+r+"]"}function i(t,n,r){var o=Object.keys(t).reduce(function(o,i){var a=r(t[i],i);return void 0===a?o:(i=e(i)?i:s(i),a=String(a).split("\n").join("\n"+n),o.push(n+i+":"+(n?" ":"")+a),o)},[]).join(n?",\n":",");return n&&o?"{\n"+o+"\n}":"{"+o+"}"}function a(t){var e=String(t),n=Object.keys(t),r,o;if(o=n.length){for(r="var x="+e+";";o--;)r+="x['"+n[o]+"']="+s(t[n[o]])+";";return"(function(){"+r+"return x;}())"}return e}function s(t,e,n){if(Object(t)!==t)return p[typeof t](t,e,n);if("function"==typeof Buffer&&Buffer.isBuffer(t))return"new Buffer("+n(t.toString())+")";var r=d[Object.prototype.toString.call(t)];return r?r(t,e,n):void 0}var c=/[\\\'\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,u={"\b":"\\b","	":"\\t","\n":"\\n","\f":"\\f","\r":"\\r","'":"\\'",'"':'\\"',"\\":"\\\\"},f={};"break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public let yield".split(" ").map(function(t){f[t]=!0});var l=/^[A-Za-z_$][A-Za-z0-9_$]*$/,d={"[object Array]":o,"[object Object]":i,"[object Date]":function(t){return"new Date("+t.getTime()+")"},"[object String]":function(t){return"new String("+s(t.toString())+")"},"[object Number]":function(t){return"new Number("+t+")"},"[object Boolean]":function(t){return"new Boolean("+t+")"},"[object Uint8Array]":function(t,e){return"new Uint8Array("+o(t)+")"},"[object RegExp]":a,"[object Function]":a,"[object global]":n,"[object Window]":n},p={string:function(e){return"'"+e.replace(c,t)+"'"},number:String,object:String,"boolean":String,symbol:String,undefined:String};return function(t,e,n,o){function i(t,e){if(!u||void 0!==t){l.push(e);var n=m(t,s);return l.pop(),n}}o=o||{},"string"!=typeof n&&(n=new Array(Math.max(0,0|n)+1).join(" "));var a=Number(o.maxDepth)||100,c=!!o.references,u=!!o.skipUndefinedProperties,f=Number(o.maxValues)||1e5,l=[],d=[],p=[],h=[],y=[],m=c?function(t,e){if(t&&("object"==typeof t||"function"==typeof t)){var r=p.indexOf(t);if(r>-1)return void y.push(l.slice(),h[r]);p.push(t),h.push(l.slice())}if(!(l.length>a||f--<=0))return e(t,n,i)}:function(t,e){var r=d.indexOf(t);if(!(r>-1||l.length>a||f--<=0)){d.push(t);var t=e(t,n,i);return d.pop(),t}};if("function"==typeof e){var b=m;m=function(t,n){return b(t,function(t,r,o){return e(t,r,function(t){return n(t,r,o)})})}}var v=m(t,s);if(y.length){for(var g=n?"\n":"",S=n?" = ":"=",_=";"+g,b=n?"(function () {":"(function(){",P="}())",w=["var x"+S+v],I=0;I<y.length;I+=2)w.push("x"+r(y[I])+S+"x"+r(y[I+1]));return w.push("return x"),b+g+w.join(_)+_+P}return v}})},promisePolyfill='(function(){"use strict";var f,g=[];function l(a){g.push(a);1==g.length&&f()}function m(){for(;g.length;)g[0](),g.shift()}f=function(){setTimeout(m)};function n(a){this.a=p;this.b=void 0;this.f=[];var b=this;try{a(function(a){q(b,a)},function(a){r(b,a)})}catch(c){r(b,c)}}var p=2;function t(a){return new n(function(b,c){c(a)})}function u(a){return new n(function(b){b(a)})}function q(a,b){if(a.a==p){if(b==a)throw new TypeError;var c=!1;try{var d=b&&b.then;if(null!=b&&"object"==typeof b&&"function"==typeof d){d.call(b,function(b){c||q(a,b);c=!0},function(b){c||r(a,b);c=!0});return}}catch(e){c||r(a,e);return}a.a=0;a.b=b;v(a)}} function r(a,b){if(a.a==p){if(b==a)throw new TypeError;a.a=1;a.b=b;v(a)}}function v(a){l(function(){if(a.a!=p)for(;a.f.length;){var b=a.f.shift(),c=b[0],d=b[1],e=b[2],b=b[3];try{0==a.a?"function"==typeof c?e(c.call(void 0,a.b)):e(a.b):1==a.a&&("function"==typeof d?e(d.call(void 0,a.b)):b(a.b))}catch(h){b(h)}}})}n.prototype.g=function(a){return this.c(void 0,a)};n.prototype.c=function(a,b){var c=this;return new n(function(d,e){c.f.push([a,b,d,e]);v(c)})}; function w(a){return new n(function(b,c){function d(c){return function(d){h[c]=d;e+=1;e==a.length&&b(h)}}var e=0,h=[];0==a.length&&b(h);for(var k=0;k<a.length;k+=1)u(a[k]).c(d(k),c)})}function x(a){return new n(function(b,c){for(var d=0;d<a.length;d+=1)u(a[d]).c(b,c)})};self.Promise||(self.Promise=n,self.Promise.resolve=u,self.Promise.reject=t,self.Promise.race=x,self.Promise.all=w,self.Promise.prototype.then=n.prototype.c,self.Promise.prototype["catch"]=n.prototype.g);}());',ThreadInterface=function(t){var e,n;return this.fn=t,this.fnString=null!=(e=this.fn)?e.toString():void 0,this.status="active",n=new Thread(this.fn,this.fnString),Object.defineProperty(this,"thread",{enumerable:!1,configurable:!1,get:function(){return n}}),this},ThreadInterface.prototype.run=function(){var t;return t=1<=arguments.length?slice.call(arguments,0):[],"function"==typeof this.fn?this.thread.sendCommand("run",this._stringifyPayload(t)).then(function(t){return function(e){return t._parsePayload(e)}}(this))["catch"](function(t){return function(e){return Promise.reject(t._parseRejection(e))}}(this)):Promise.reject(new Error("No function was set for this thread."))},ThreadInterface.prototype.on=function(t,e){if("function"!=typeof e)throw new Error("Provided callback isn't a function");return this.thread.socket.on(t,function(t){return function(n){return e(t._parsePayload(n.payload))}}(this))},ThreadInterface.prototype.setFn=function(t,e){if("function"!=typeof t)throw new Error("Provided argument isn't a function");return this.fn=t,this.fnString=t.toString(),this.thread.sendCommand("setFn",this.fnString),e&&this.setContext(e),this},ThreadInterface.prototype.setGlobals=function(t){return this.thread.sendCommand("setGlobals",this._stringifyPayload(t)),this},ThreadInterface.prototype.setScripts=function(t){return this.thread.sendCommand("setScripts",this._stringifyPayload([].concat(t))),this},ThreadInterface.prototype.setContext=function(t){return this.thread.sendCommand("setContext",this._stringifyPayload(t)),this},ThreadInterface.prototype.kill=function(){return this.thread.worker&&this.thread.worker.terminate(),this.status="dead",SimplyThread.remove(this),this},ThreadInterface.prototype._stringifyPayload=function(t){var e;return e={type:typeof t},e.data=this.javascriptStringify(t,null,null,STRINGIFY_OPTS),e},ThreadInterface.prototype._parsePayload=function(payload){return PRIMITIVE_TYPES[payload.type]?payload.data:eval("("+payload.data+")")},ThreadInterface.prototype._parseRejection=function(t){var e,n;return e=this._parsePayload(t),e&&"object"==typeof e&&window[e.name]&&window[e.name].constructor===Function?(n=new window[e.name](e.message),n.stack=e.stack,n):e},exposeStringifyFn.call(ThreadInterface.prototype),Thread=function(t,e){return this.fn=t,this.fnString=e,this.worker=this.init(),this.socket=this.openSocket(),this.fn&&this.sendCommand("setFn",this.fnString),this},Thread.prototype.init=function(){return SUPPORTS.workers?new Worker(this.createURI()):!1},Thread.prototype.createURI=function(){var t,e,n;return n=workerScript.toString().match(functionBodyRegEx)[1],e=SimplyThread.threadDeps||"",e+=exposeStringifyFn.toString().match(functionBodyRegEx)[1],e+="var PRIMITIVE_TYPES = "+JSON.stringify(PRIMITIVE_TYPES)+";",e+="var STRINGIFY_OPTS = "+JSON.stringify(STRINGIFY_OPTS)+";",SUPPORTS.promises||(e+=promisePolyfill),t=new Blob([e+n],{type:"application/javascript"}),URL.createObjectURL(t)},Thread.prototype.openSocket=function(){return this.worker&&this.worker.addEventListener("message",function(t){return function(e){return e.data.ID&&t.socket.callbacks[e.data.ID]?t.socket.callbacks[e.data.ID](e.data):void 0}}(this)),{on:function(t,e){return this.callbacks[t]=e},callbacks:{}}},Thread.prototype.sendCommand=function(command,payload){return new Promise(function(_this){return function(resolve,reject){var ID;if(ID=null,_this.worker)return"run"===command&&_this.socket.on(ID=genTransactionID(),function(t){switch(t.status){case"resolve":return resolve(t.payload);case"reject":return reject(t.payload)}}),_this.worker.postMessage({command:command,payload:payload,ID:ID});switch(command){case"run":if(_this.fn)return _this.fn.apply(_this.context,payload);break;case"setFn":if("function"==typeof payload)return _this.fn=eval("("+payload.toString()+")");break;case"setContext":return _this.context=payload}}}(this))},threadEmit=function(t,e){var n;return"function"==typeof(n=this.socket.callbacks)[t]?n[t](e):void 0},workerScript=function(){var _fetchExternal,_fetchModule,_fnContext,_fnToExecute,_parsePayload,_run,_scriptsLoaded,_setGlobals,_setScripts,_stringifyError,_stringifyPayload,onmessage;_fnToExecute=null,_fnContext=null,_scriptsLoaded=Promise.resolve(),_stringifyPayload=function(t){var e;return e={type:typeof t},e.data=PRIMITIVE_TYPES[e.type]?t:javascriptStringify(t,null,null,STRINGIFY_OPTS),e},_stringifyError=function(t){var e,n,r;return n=t.name,e=t.message,r=t.stack,_stringifyPayload(n?{name:n,message:e,stack:r}:arguments[0])},_parsePayload=function(payload){return PRIMITIVE_TYPES[payload.type]?payload.data:eval("("+payload.data+")")},_fetchExternal=function(t){return new Promise(function(e,n){var r;return r=new XMLHttpRequest,r.open("GET",t,!0),r.onerror=n,r.onload=function(){var t;return 200>=(t=this.status)&&400>t?e(this.response):n(new Error("External fetch failed (status:"+r.status+"): "+r.response))},r.send()})},_fetchModule=function(module){var moduleLabel,moduleName;return moduleName=module.split("#")[0],moduleLabel=module.split("#")[1]||moduleName,moduleName=moduleName.replace(/\//g,"%2F"),_fetchExternal("https://wzrd.in/bundle/"+moduleName).then(function(result){var loader;return result?(loader=eval(result),self[moduleLabel]=loader(moduleName)):void 0})},onmessage=function(e){var ID,command,payload;switch(command=e.data.command,payload=e.data.payload,ID=e.data.ID,command){case"setGlobals":return _setGlobals(_parsePayload(payload));case"setScripts":return _setScripts(_parsePayload(payload));case"setContext":return _fnContext=_parsePayload(payload);case"setFn":return _fnToExecute=eval("("+payload+")");case"run":return _run(ID,_parsePayload(payload))}},_setGlobals=function(t){var e,n;for(e in t)n=t[e],self[e]=n},_setScripts=function(scripts){return _scriptsLoaded=new Promise(function(finalResolve,finalReject){var completedScripts,i,len,script,scriptPromise;for(completedScripts=0,i=0,len=scripts.length;len>i;i++)script=scripts[i],scriptPromise=function(){switch(typeof script){case"function":return Promise.resolve(script.call(self));case"string":return"MODULE:"===script.slice(0,7)?_fetchModule(script.slice(7)):"file:"===script.slice(0,5)?Promise.resolve(importScripts(script)):_fetchExternal(script).then(function(result){return result?eval("("+result+")"):void 0});default:return Promise.resolve()}}(),scriptPromise.then(function(){return++completedScripts===scripts.length?finalResolve():void 0})["catch"](finalReject)})},_run=function(t,e){return null==e&&(e=[]),_scriptsLoaded.then(function(){var n,r,o,i;try{i=_fnToExecute.apply(_fnContext,e)}catch(r){n=r,postMessage({ID:t,status:"reject",payload:_stringifyError(n)}),o=!0}return o?void 0:Promise.resolve(i).then(function(e){return postMessage({ID:t,status:"resolve",payload:_stringifyPayload(e)})})["catch"](function(e){return postMessage({ID:t,status:"reject",payload:_stringifyPayload(e)})})})["catch"](function(e){return postMessage({ID:t,status:"reject",payload:_stringifyError(e)})})},threadEmit=function(t,e){return postMessage({ID:t,payload:_stringifyPayload(e)})}},SimplyThread.version="1.7.0",null!=("undefined"!=typeof exports&&null!==exports?exports.module:void 0)?module.exports=SimplyThread:"function"==typeof define&&define.amd?define(["simplythread"],function(){return SimplyThread}):this.SimplyThread=SimplyThread}();