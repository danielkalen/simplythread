var slice=[].slice;
(function(){var r,t,m,k,g,n,f,l,u,p,h,v,w;r=!!window.Worker&&!!window.Blob&&!!window.URL;t=!!window.Promise;m=new function(){var a;a=[];this.create=function(b){b=new g(b);a.push(b);return b};this.remove=function(b){b=a.indexOf(b);if(-1!==b)return a.splice(b,1)};this.list=function(){return a.slice()};this.killAll=function(){a.forEach(function(a){return a.kill()});return this.list()};return this};n="**_circular_**";f="**_function_**";g=function(a){var b,c;this.fn=a;this.fnString=null!=(b=this.fn)?b.toString():
void 0;this.status="active";c=new k(this.fn,this.fnString);Object.defineProperty(this,"thread",{enumerable:!1,configurable:!1,get:function(){return c}});return this};g.prototype.run=function(){var a;a=1<=arguments.length?slice.call(arguments,0):[];return new Promise(function(b){return function(c,d){return"function"===typeof b.fn?b.thread.sendCommand("run",p(a)).then(function(a){return c(l(a))},d):d(Error("No function was set for this thread."))}}(this))};g.prototype.setFn=function(a,b){"function"===
typeof a&&(this.fn=a,this.fnString=a.toString(),this.thread.sendCommand("setFn",this.fnString),b&&this.setContext(b));return this};g.prototype.setGlobals=function(a){this.thread.sendCommand("setGlobals",h(a));return this};g.prototype.setScripts=function(a){this.thread.sendCommand("setScripts",h(a));return this};g.prototype.setContext=function(a){var b;try{b=JSON.stringify(a)}catch(c){b=function(){var b,c;b=[];c=JSON.stringify(a,function(c,e){if(null!==e&&"object"===typeof e)if(-1!==b.indexOf(e)){if(e===
a)return n;if(null==e||!e.nodeName||!e.nodeType){if("function"===typeof e)return f+e.toString();return}}else b.push(e);return e});b=null;return c}()}this.thread.sendCommand("setContext",b);return this};g.prototype.kill=function(){var a;null!=(a=this.thread)&&a.worker.terminate();this.status="dead";m.remove(this);return this};p=function(a){var b,c,d,e,q;q=[];d=c=0;for(e=a.length;c<e;d=++c)b=a[d],q[d]="function"===typeof b?f+b.toString():b;return q};h=function(a,b){var c,d,e;null==b&&(b=[]);if("function"===
typeof a)return f+a.toString();if("object"===typeof a){b.push(a);d=Array.isArray(a)?[]:{};for(c in a)e=a[c],"object"===typeof e&&-1===b.indexOf(e)?(b.push(e),d[c]=h(e,b)):d[c]="function"===typeof e?f+e.toString():e;return d}return a};l=function(a,b){var c,d;null==b&&(b=[]);if("string"===typeof a&&0===a.indexOf(f))return eval("___ ="+a.replace(f,""));b.push(a);for(c in a)d=a[c],"object"===typeof d&&-1===b.indexOf(d)?(b.push(d),a[c]=l(d,b)):"string"===typeof d&&0===d.indexOf(f)&&(a[c]=eval("___ ="+
d.replace(f,"")));return a};k=function(a,b){this.fn=a;this.fnString=b;this.worker=this.init();this.fn&&this.sendCommand("setFn",this.fnString);return this};k.prototype.init=function(){return r?new Worker(this.createURI()):!1};k.prototype.createURI=function(){var a;a=v.toString().match(w)[1];t||(a+=u);a=new Blob([a],{type:"application/javascript"});return URL.createObjectURL(a)};k.prototype.sendCommand=function(a,b){return new Promise(function(c){return function(d,e){var f;if(c.worker)return f=function(a){switch(a.data.status){case "resolve":d(a.data.payload);
break;case "reject":e(a.data.payload)}return c.worker.removeEventListener("message",f)},"run"===a&&c.worker.addEventListener("message",f),c.worker.postMessage({command:a,payload:b});switch(a){case "run":if(c.fn)return c.fn.apply(c.context,b);break;case "setFn":if("function"===typeof b)return c.fn=b;break;case "setContext":return c.context=b}}}(this))};w=/^\s*function\s*\(\)\s*\{\s*([\w\W]+)\s*\}\s*$/;v=function(){n="**_circular_**";f="**_function_**";p=function(a){var b,c,d,e,g;g=[];d=c=0;for(e=a.length;c<
e;d=++c)b=a[d],g[d]="function"===typeof b?f+b.toString():b;return g};h=function(a,b){var c,d,e;null==b&&(b=[]);if("function"===typeof a)return f+a.toString();if("object"===typeof a){b.push(a);d=Array.isArray(a)?[]:{};for(c in a)e=a[c],"object"===typeof e&&-1===b.indexOf(e)?(b.push(e),d[c]=h(e,b)):d[c]="function"===typeof e?f+e.toString():e;return d}return a};l=function(a,b){var c,d;null==b&&(b=[]);if("string"===typeof a&&0===a.indexOf(f))return eval("___ ="+a.replace(f,""));b.push(a);for(c in a)d=
a[c],"object"===typeof d&&-1===b.indexOf(d)?(b.push(d),a[c]=l(d,b)):"string"===typeof d&&0===d.indexOf(f)&&(a[c]=eval("___ ="+d.replace(f,"")));return a}};u='(function(){"use strict";var f,g=[];function l(a){g.push(a);1==g.length&&f()}function m(){for(;g.length;)g[0](),g.shift()}f=function(){setTimeout(m)};function n(a){this.a=p;this.b=void 0;this.f=[];var b=this;try{a(function(a){q(b,a)},function(a){r(b,a)})}catch(c){r(b,c)}}var p=2;function t(a){return new n(function(b,c){c(a)})}function u(a){return new n(function(b){b(a)})}function q(a,b){if(a.a==p){if(b==a)throw new TypeError;var c=!1;try{var d=b&&b.then;if(null!=b&&"object"==typeof b&&"function"==typeof d){d.call(b,function(b){c||q(a,b);c=!0},function(b){c||r(a,b);c=!0});return}}catch(e){c||r(a,e);return}a.a=0;a.b=b;v(a)}} function r(a,b){if(a.a==p){if(b==a)throw new TypeError;a.a=1;a.b=b;v(a)}}function v(a){l(function(){if(a.a!=p)for(;a.f.length;){var b=a.f.shift(),c=b[0],d=b[1],e=b[2],b=b[3];try{0==a.a?"function"==typeof c?e(c.call(void 0,a.b)):e(a.b):1==a.a&&("function"==typeof d?e(d.call(void 0,a.b)):b(a.b))}catch(h){b(h)}}})}n.prototype.g=function(a){return this.c(void 0,a)};n.prototype.c=function(a,b){var c=this;return new n(function(d,e){c.f.push([a,b,d,e]);v(c)})}; function w(a){return new n(function(b,c){function d(c){return function(d){h[c]=d;e+=1;e==a.length&&b(h)}}var e=0,h=[];0==a.length&&b(h);for(var k=0;k<a.length;k+=1)u(a[k]).c(d(k),c)})}function x(a){return new n(function(b,c){for(var d=0;d<a.length;d+=1)u(a[d]).c(b,c)})};window.Promise||(window.Promise=n,window.Promise.resolve=u,window.Promise.reject=t,window.Promise.race=x,window.Promise.all=w,window.Promise.prototype.then=n.prototype.c,window.Promise.prototype["catch"]=n.prototype.g);}());';
return window.SimplyThread=m})();
