if(!self.define){let e,i={};const s=(s,r)=>(s=new URL(s+".js",r).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(r,n)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(i[o])return;let c={};const d=e=>s(e,o),l={module:{uri:o},exports:c,require:d};i[o]=Promise.all(r.map((e=>l[e]||d(e)))).then((e=>(n(...e),c)))}}define(["./workbox-3e911b1d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/bootstrap-icons-bb42NSi8.woff2",revision:null},{url:"assets/bootstrap-icons-TqycWyKO.woff",revision:null},{url:"assets/index-_rptGKPa.css",revision:null},{url:"assets/index-ZfMheomd.js",revision:null},{url:"assets/workbox-window.prod.es5-prqDwDSL.js",revision:null},{url:"favicon.ico",revision:"915c7ddc238c84c75eb73e112db5ea03"},{url:"images/circle.svg",revision:"49a4cfd6694fabc869536906dcba0573"},{url:"images/screenshot1.png",revision:"8a2c5c2439d12722be2bd651e026e907"},{url:"images/screenshot2.png",revision:"04a9b775853bdbd3d90471b2324f1fd9"},{url:"images/tire.svg",revision:"3cd91a729befe002007b12b626de91f0"},{url:"images/wheel.svg",revision:"3d251ace03600dc4491399bb2b7b8877"},{url:"index.html",revision:"0038683d58328d1061b01f353dfd56fa"},{url:"vite.svg",revision:"8e3a10e157f75ada21ab742c022d5430"},{url:"favicon.ico",revision:"915c7ddc238c84c75eb73e112db5ea03"},{url:"vite.svg",revision:"8e3a10e157f75ada21ab742c022d5430"},{url:"images/circle.svg",revision:"49a4cfd6694fabc869536906dcba0573"},{url:"images/tire.svg",revision:"3cd91a729befe002007b12b626de91f0"},{url:"images/wheel.svg",revision:"3d251ace03600dc4491399bb2b7b8877"},{url:"manifest.webmanifest",revision:"11dafb77ef6e01695e85ea06d1a1e21c"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
