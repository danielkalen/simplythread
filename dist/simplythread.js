var slice=[].slice;!function(){var FakeWorker,PRIMITIVE_TYPES,STRINGIFY_OPTS,SUPPORTS,SimplyThread,ThreadInterface,currentID,functionBodyRegEx,helpers,promisePolyfill,workerScript;return SimplyThread=new function(){var e;return e=[],this.create=function(t){var n;return n=new ThreadInterface(t),e.push(n),n},this.remove=function(t){var n;return n=e.indexOf(t),e.splice(n,1)},this.list=function(){return e.slice()},this.killAll=function(){return e.slice().forEach(function(e){return e.kill()}),!0},this},ThreadInterface=function(e){return this.fn=e,this.status="active",this.worker=function(e){return function(){return SUPPORTS.workers?helpers.patchWorkerMethods(new Worker(helpers.createWorkerURI())):new FakeWorker}}(this)(),this.socket=function(e){return function(){return e.worker.addEventListener("message",function(t){return t.ID&&e.socket.callbacks[t.ID]?e.socket.callbacks[t.ID](t):void 0}),{on:function(e,t){return this.callbacks[e]=t},callbacks:{}}}}(this)(),this.fn&&this.setFn(this.fn),this},ThreadInterface.prototype.run=function(){var e;return e=1<=arguments.length?slice.call(arguments,0):[],"function"==typeof this.fn?new Promise(function(t){return function(n,r){var o;return t.socket.on(o=helpers.genTransactionID(),function(e){switch(e.status){case"resolve":return n(e.payload);case"reject":return r(e.payload)}}),t.worker.postMessage({command:"run",payload:e,ID:o})}}(this)):Promise.reject(new Error("No function was set for this thread."))},ThreadInterface.prototype.on=function(e,t){if("function"!=typeof t)throw new Error("Provided callback isn't a function");return this.socket.on(e,function(e){return t(e.payload)})},ThreadInterface.prototype.setFn=function(e,t){if("function"!=typeof e)throw new Error("Provided argument isn't a function");return this.fn=e,this.fnString=e.toString(),this.worker.postMessage({command:"setFn",payload:this.fnString},!1),null!=t&&this.setContext(t),this},ThreadInterface.prototype.setGlobals=function(e){if(!e||"object"!=typeof e)throw new Error("Provided argument isn't an object");return this.worker.postMessage({command:"setGlobals",payload:e}),this},ThreadInterface.prototype.setScripts=function(e){return this.worker.postMessage({command:"setScripts",payload:[].concat(e)}),this},ThreadInterface.prototype.setContext=function(e){return this.worker.postMessage({command:"setContext",payload:e}),this},ThreadInterface.prototype.kill=function(){return this.worker.terminate(),this.status="dead",SimplyThread.remove(this),this},workerScript=function(){var e,t;e=eval,t=function(e,t){return postMessage({ID:e,payload:helpers.stringifyPayload(t)})},function(){var t,n,r,o,i,s,a,c,u;return n=null,t=null,r=Promise.resolve(),u=function(e){var t,n,r;return n=e.name,t=e.message,r=e.stack,n?helpers.stringifyPayload({name:n,message:t,stack:r}):helpers.stringifyPayload(arguments[0])},o=function(e){return new Promise(function(t,n){var r;return r=new XMLHttpRequest,r.open("GET",e,!0),r.onerror=n,r.onload=function(){var e;return 200>=(e=this.status)&&400>e?t(this.response):n(new Error("External fetch failed (status:"+r.status+"): "+r.response))},r.send()})},i=function(t){var n,r;return r=t.split("#")[0],n=t.split("#")[1]||r,r=r.replace(/\//g,"%2F"),o("https://wzrd.in/bundle/"+r).then(function(t){var o;return t?(o=e(t),self[n]=o(r)):void 0})},a=function(e){var t,n;for(t in e)n=e[t],self[t]=n},c=function(t){return r=new Promise(function(n,r){var s,a,c,u,f;for(s=0,a=function(a){var c;return c=function(){switch(typeof a){case"function":return Promise.resolve(a.call(self));case"string":return"MODULE:"===a.slice(0,7)?i(a.slice(7)):o(a).then(function(t){return t?e("("+t+")"):void 0});default:return Promise.resolve()}}(),c.then(function(){return++s===t.length?n():void 0})["catch"](r)},c=0,u=t.length;u>c;c++)f=t[c],a(f)})},s=function(e,o){return null==o&&(o=[]),r.then(function(){var r,i,s,a;try{a=n.apply(t,o)}catch(i){r=i,postMessage({ID:e,status:"reject",payload:u(r)}),s=!0}return s?void 0:Promise.resolve(a).then(function(t){return postMessage({ID:e,status:"resolve",payload:helpers.stringifyPayload(t)})})["catch"](function(t){return postMessage({ID:e,status:"reject",payload:helpers.stringifyPayload(t)})})})["catch"](function(t){return postMessage({ID:e,status:"reject",payload:u(t)})})},this.onmessage=function(r){var o,i,u;switch(i=r.data.command,u=r.data.payload,o=r.data.ID,i){case"setGlobals":return a(helpers.parsePayload(u));case"setScripts":return c(helpers.parsePayload(u));case"setContext":return t=helpers.parsePayload(u);case"setFn":return n=e("("+u+")");case"run":return s(o,helpers.parsePayload(u))}}}()},FakeWorker=function(){var _fnContext,_fnToExecute,_globalsString,_scriptsLoaded,fetchExternal,fetchModule,postMessage,run,setFn,setGlobals,setScripts,threadEmit;return this.isAlive=!0,this.messageCallback=null,_fnToExecute=null,_fnContext=null,_globalsString="",_scriptsLoaded=Promise.resolve(),threadEmit=function(e){return function(e,t){return postMessage({ID:e,payload:t})}}(this),postMessage=function(e){return function(t){return e.messageCallback(t)}}(this),fetchExternal=function(e){return new Promise(function(t,n){var r;return r=new XMLHttpRequest,r.open("GET",e,!0),r.onerror=n,r.onreadystatechange=function(){var e;return 4===this.readyState?200>=(e=this.status)&&400>e?t(this.responseText):n(new Error("External fetch failed (status:"+this.status+"): "+this.responseText)):void 0},r.send()})},fetchModule=function(e){var t,n;return n=e.split("#")[0],t=e.split("#")[1]||n,n=n.replace(/\//g,"%2F"),fetchExternal("https://wzrd.in/bundle/"+n).then(function(e){return e?(e=e.slice(0,-1),_globalsString+="var "+t+" = ("+e+")('"+n+"');",setFn()):void 0})},setFn=function(fnString){return null==fnString&&(fnString=_fnToExecute.toString()),_fnToExecute=eval(_globalsString+" ("+fnString+")")},setGlobals=function(e){_globalsString+=helpers.stringifyAsGlobals(e),setFn()},setScripts=function(scripts){return _scriptsLoaded=new Promise(function(_this){return function(finalResolve,finalReject){var completedScripts,i,len,script,scriptPromise;for(completedScripts=0,i=0,len=scripts.length;len>i;i++)script=scripts[i],scriptPromise=function(){switch(typeof script){case"function":return Promise.resolve(script.call(self));case"string":return"MODULE:"===script.slice(0,7)?fetchModule(script.slice(7)):fetchExternal(script).then(function(result){return result?eval("("+result+")"):void 0});default:return Promise.resolve()}}(),scriptPromise.then(function(){return++completedScripts===scripts.length?finalResolve():void 0})["catch"](finalReject)}}(this))},run=function(e,t){return null==t&&(t=[]),_scriptsLoaded.then(function(n){return function(){var n,r,o,i;try{i=_fnToExecute.apply(_fnContext,t)}catch(r){n=r,postMessage({ID:e,status:"reject",payload:n}),o=!0}return o?void 0:Promise.resolve(i).then(function(t){return postMessage({ID:e,status:"resolve",payload:t})})["catch"](function(t){return postMessage({ID:e,status:"reject",payload:t})})}}(this))["catch"](function(t){return function(t){return postMessage({ID:e,status:"reject",payload:t})}}(this))},this.onmessage=function(e){var t,n,r;switch(n=e.command,r=e.payload,t=e.ID,n){case"setGlobals":return setGlobals(r);case"setScripts":return setScripts(r);case"setContext":return _fnContext=r;case"setFn":return setFn(r);case"run":return run(t,r)}},this},FakeWorker.prototype={addEventListener:function(e,t){return this.isAlive?this.messageCallback=t:void 0},postMessage:function(e){return this.isAlive?this.onmessage(e):void 0},terminate:function(){return this.isAlive=!1}},helpers={},currentID=0,helpers.genTransactionID=function(){return++currentID},helpers.extend=function(e,t,n){var r,o,i,s;for(i=Object.keys(t),r=0,s=i.length;s>r;r++)o=i[r],o!==n&&(e[o]=t[o]);return e},helpers.createWorkerURI=function(){var e,t,n;return n=workerScript.toString().match(functionBodyRegEx)[1],t=SimplyThread.threadDeps||"",t+="var helpers="+helpers.javascriptStringify(helpers.extend({},helpers,"javascriptStringify"))+"; helpers.exposeStringifyFn();",t+="var PRIMITIVE_TYPES = "+JSON.stringify(PRIMITIVE_TYPES)+";",t+="var STRINGIFY_OPTS = "+JSON.stringify(STRINGIFY_OPTS)+";",SUPPORTS.promises||(t+=promisePolyfill),e=new Blob([t+n],{type:"application/javascript"}),(window.URL||window.webkitURL).createObjectURL(e)},helpers.patchWorkerMethods=function(e){var t,n;return n=e.postMessage.bind(e),e.postMessage=function(e,t){return null==t&&(t=!0),t&&(e.payload=helpers.stringifyPayload(e.payload)),n(e)},t=e.addEventListener.bind(e),e.addEventListener=function(e,n){return t(e,function(e){var t;return e.data.payload&&(t="reject"===e.data.status?"parseRejection":"parsePayload",e.data.payload=helpers[t](e.data.payload)),n(e.data)})},e},helpers.stringifyAsGlobals=function(e){var t,n,r,o,i,s;for(t="",i=Object.keys(e),r=n=0,s=i.length;s>n;r=++n)o=i[r],t+=o+"="+this.javascriptStringify(e[o])+(r===i.length-1?";":",")+" ";return t?"var "+t:t},helpers.stringifyPayload=function(e){var t;return t={type:typeof e},t.data=PRIMITIVE_TYPES[t.type]?e:this.javascriptStringify(e,null,null,STRINGIFY_OPTS),t},helpers.parsePayload=function(payload){return PRIMITIVE_TYPES[payload.type]?payload.data:eval("("+payload.data+")")},helpers.parseRejection=function(e){var t,n;return t=this.parsePayload(e),t&&"object"==typeof t&&window[t.name]&&window[t.name].constructor===Function?(n=new window[t.name](t.message),n.stack=t.stack,n):t},helpers.exposeStringifyFn=function(){!function(e,t){"function"==typeof require&&"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define(function(){return t()}):e.javascriptStringify=t()}(this,function(){function e(e){var t=u[e];return t||"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)}function t(e){return!f[e]&&l.test(e)}function n(e){return"Function("+a("return this;")+")()"}function r(e){for(var n="",r=0;r<e.length;r++)n+=t(e[r])?"."+e[r]:"["+a(e[r])+"]";return n}function o(e,t,n){var r=e.map(function(e,r){var o=n(e,r);return void 0===o?String(o):t+o.split("\n").join("\n"+t)}).join(t?",\n":",");return t&&r?"[\n"+r+"\n]":"["+r+"]"}function i(e,n,r){var o=Object.keys(e).reduce(function(o,i){var s=r(e[i],i);return void 0===s?o:(i=t(i)?i:a(i),s=String(s).split("\n").join("\n"+n),o.push(n+i+":"+(n?" ":"")+s),o)},[]).join(n?",\n":",");return n&&o?"{\n"+o+"\n}":"{"+o+"}"}function s(e){var t=String(e),n=Object.keys(e),r,o;if(o=n.length){for(r="var x="+t+";";o--;)r+="x['"+n[o]+"']="+a(e[n[o]])+";";return"(function(){"+r+"return x;}())"}return t}function a(e,t,n){if(Object(e)!==e)return h[typeof e](e,t,n);if("function"==typeof Buffer&&Buffer.isBuffer(e))return"new Buffer("+n(e.toString())+")";var r=p[Object.prototype.toString.call(e)];return r?r(e,t,n):void 0}var c=/[\\\'\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,u={"\b":"\\b","	":"\\t","\n":"\\n","\f":"\\f","\r":"\\r","'":"\\'",'"':'\\"',"\\":"\\\\"},f={};"break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public let yield".split(" ").map(function(e){f[e]=!0});var l=/^[A-Za-z_$][A-Za-z0-9_$]*$/,p={"[object Array]":o,"[object Object]":i,"[object Date]":function(e){return"new Date("+e.getTime()+")"},"[object String]":function(e){return"new String("+a(e.toString())+")"},"[object Number]":function(e){return"new Number("+e+")"},"[object Boolean]":function(e){return"new Boolean("+e+")"},"[object Uint8Array]":function(e,t){return"new Uint8Array("+o(e)+")"},"[object RegExp]":s,"[object Function]":s,"[object global]":n,"[object Window]":n},h={string:function(t){return"'"+t.replace(c,e)+"'"},number:String,object:String,"boolean":String,symbol:String,undefined:String};return function(e,t,n,o){function i(e,t){if(!u||void 0!==e){l.push(t);var n=v(e,a);return l.pop(),n}}o=o||{},"string"!=typeof n&&(n=new Array(Math.max(0,0|n)+1).join(" "));var s=Number(o.maxDepth)||100,c=!!o.references,u=!!o.skipUndefinedProperties,f=Number(o.maxValues)||1e5,l=[],p=[],h=[],d=[],y=[],v=c?function(e,t){if(e&&("object"==typeof e||"function"==typeof e)){var r=h.indexOf(e);if(r>-1)return void y.push(l.slice(),d[r]);h.push(e),d.push(l.slice())}if(!(l.length>s||f--<=0))return t(e,n,i)}:function(e,t){var r=p.indexOf(e);if(!(r>-1||l.length>s||f--<=0)){p.push(e);var e=t(e,n,i);return p.pop(),e}};if("function"==typeof t){var g=v;v=function(e,n){return g(e,function(e,r,o){return t(e,r,function(e){return n(e,r,o)})})}}var b=v(e,a);if(y.length){for(var m=n?"\n":"",w=n?" = ":"=",S=";"+m,g=n?"(function () {":"(function(){",P="}())",T=["var x"+w+b],k=0;k<y.length;k+=2)T.push("x"+r(y[k])+w+"x"+r(y[k+1]));return T.push("return x"),g+m+T.join(S)+S+P}return b}})},helpers.exposeStringifyFn(),functionBodyRegEx=/^\s*function\s*\(\)\s*\{\s*([\w\W]+)\s*\}\s*$/,SUPPORTS=SimplyThread.SUPPORTS={},SUPPORTS.promises=!!window.Promise,SUPPORTS.workers=!!window.Worker&&!!window.Blob&&(!!window.URL||!!window.webkitURL)&&function(){try{return new Worker(helpers.createWorkerURI()).terminate(),!0}catch(e){}}(),PRIMITIVE_TYPES={string:!0,number:!0,"boolean":!0,symbol:!0},STRINGIFY_OPTS={references:!0},promisePolyfill='(function(){"use strict";var f,g=[];function l(a){g.push(a);1==g.length&&f()}function m(){for(;g.length;)g[0](),g.shift()}f=function(){setTimeout(m)};function n(a){this.a=p;this.b=void 0;this.f=[];var b=this;try{a(function(a){q(b,a)},function(a){r(b,a)})}catch(c){r(b,c)}}var p=2;function t(a){return new n(function(b,c){c(a)})}function u(a){return new n(function(b){b(a)})}function q(a,b){if(a.a==p){if(b==a)throw new TypeError;var c=!1;try{var d=b&&b.then;if(null!=b&&"object"==typeof b&&"function"==typeof d){d.call(b,function(b){c||q(a,b);c=!0},function(b){c||r(a,b);c=!0});return}}catch(e){c||r(a,e);return}a.a=0;a.b=b;v(a)}} function r(a,b){if(a.a==p){if(b==a)throw new TypeError;a.a=1;a.b=b;v(a)}}function v(a){l(function(){if(a.a!=p)for(;a.f.length;){var b=a.f.shift(),c=b[0],d=b[1],e=b[2],b=b[3];try{0==a.a?"function"==typeof c?e(c.call(void 0,a.b)):e(a.b):1==a.a&&("function"==typeof d?e(d.call(void 0,a.b)):b(a.b))}catch(h){b(h)}}})}n.prototype.g=function(a){return this.c(void 0,a)};n.prototype.c=function(a,b){var c=this;return new n(function(d,e){c.f.push([a,b,d,e]);v(c)})}; function w(a){return new n(function(b,c){function d(c){return function(d){h[c]=d;e+=1;e==a.length&&b(h)}}var e=0,h=[];0==a.length&&b(h);for(var k=0;k<a.length;k+=1)u(a[k]).c(d(k),c)})}function x(a){return new n(function(b,c){for(var d=0;d<a.length;d+=1)u(a[d]).c(b,c)})};self.Promise||(self.Promise=n,self.Promise.resolve=u,self.Promise.reject=t,self.Promise.race=x,self.Promise.all=w,self.Promise.prototype.then=n.prototype.c,self.Promise.prototype["catch"]=n.prototype.g);}());',SimplyThread.version="2.0.1",null!=("undefined"!=typeof exports&&null!==exports?exports.module:void 0)?module.exports=SimplyThread:"function"==typeof define&&define.amd?define(["simplythread"],function(){return SimplyThread}):this.SimplyThread=SimplyThread}();