import{r as d}from"./index.Ba4_ASc-.js";var p={exports:{}},l={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var f;function w(){if(f)return l;f=1;var r=Symbol.for("react.transitional.element"),e=Symbol.for("react.fragment");function s(t,n,o){var i=null;if(o!==void 0&&(i=""+o),n.key!==void 0&&(i=""+n.key),"key"in n){o={};for(var a in n)a!=="key"&&(o[a]=n[a])}else o=n;return n=o.ref,{$$typeof:r,type:t,key:i,ref:n!==void 0?n:null,props:o}}return l.Fragment=e,l.jsx=s,l.jsxs=s,l}var h;function b(){return h||(h=1,p.exports=w()),p.exports}var c=b();/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=(...r)=>r.filter((e,s,t)=>!!e&&e.trim()!==""&&t.indexOf(e)===s).join(" ").trim();/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=r=>r.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=r=>r.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,s,t)=>t?t.toUpperCase():s.toLowerCase());/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=r=>{const e=E(r);return e.charAt(0).toUpperCase()+e.slice(1)};/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var T={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=r=>{for(const e in r)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1};/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=d.forwardRef(({color:r="currentColor",size:e=24,strokeWidth:s=2,absoluteStrokeWidth:t,className:n="",children:o,iconNode:i,...a},u)=>d.createElement("svg",{ref:u,...T,width:e,height:e,stroke:r,strokeWidth:t?Number(s)*24/Number(e):s,className:g("lucide",n),...!o&&!R(a)&&{"aria-hidden":"true"},...a},[...i.map(([v,y])=>d.createElement(v,y)),...Array.isArray(o)?o:[o]]));/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=(r,e)=>{const s=d.forwardRef(({className:t,...n},o)=>d.createElement(j,{ref:o,iconNode:e,className:g(`lucide-${C(k(r))}`,`lucide-${r}`,t),...n}));return s.displayName=k(r),s};/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],A=m("circle-alert",_);/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]],$=m("circle-check-big",N);/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],z=m("x",L),x="logo-studio:toast",q=(r,e="info")=>{if(typeof window<"u"){const s=new CustomEvent(x,{detail:{message:r,type:e}});window.dispatchEvent(s)}};function M(){const[r,e]=d.useState([]);d.useEffect(()=>{const t=n=>{const o=n.detail,i=Math.random().toString(36).substring(7);e(a=>[...a,{id:i,message:o.message,type:o.type}]),setTimeout(()=>{e(a=>a.filter(u=>u.id!==i))},3e3)};return window.addEventListener(x,t),()=>window.removeEventListener(x,t)},[]);const s=t=>{e(n=>n.filter(o=>o.id!==t))};return c.jsx("div",{className:"fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none",children:r.map(t=>c.jsxs("div",{className:`
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-right-full duration-300
            ${t.type==="success"?"bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200":""}
            ${t.type==="error"?"bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200":""}
            ${t.type==="info"?"bg-white border-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200":""}
          `,children:[t.type==="success"&&c.jsx($,{className:"w-5 h-5 text-green-500"}),t.type==="error"&&c.jsx(A,{className:"w-5 h-5 text-red-500"}),c.jsx("span",{className:"text-sm font-medium",children:t.message}),c.jsx("button",{onClick:()=>s(t.id),className:"ml-auto p-1 hover:bg-black/5 rounded-full transition-colors",children:c.jsx(z,{className:"w-4 h-4 opacity-50 hover:opacity-100"})})]},t.id))})}function P(){return{addToast:q}}export{M as T,z as X,m as c,c as j,P as u};
