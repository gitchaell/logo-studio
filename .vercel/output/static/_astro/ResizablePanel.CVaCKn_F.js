import{c,j as o}from"./Toast.Caj2rnBI.js";import{r as e}from"./index.Ba4_ASc-.js";/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]],D=c("chevron-down",S);/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],x=c("chevron-left",y);/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],z=c("chevron-right",I);/**
 * @license lucide-react v0.575.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]],q=c("globe",L);function G({defaultWidth:k=256,minWidth:w=200,maxWidth:m=480,side:l="left",storageKey:n,children:C,className:N="",collapsible:j=!0}){const[d,b]=e.useState(k),[r,p]=e.useState(!1),[s,v]=e.useState(!1),[a,E]=e.useState(!1),u=e.useRef(null);e.useEffect(()=>{const t=()=>E(window.innerWidth<768);return t(),window.addEventListener("resize",t),()=>window.removeEventListener("resize",t)},[]),e.useEffect(()=>{if(n){const t=localStorage.getItem(`${n}-width`),i=localStorage.getItem(`${n}-collapsed`);t&&b(Number(t)),i&&v(i==="true")}},[n]),e.useEffect(()=>{n&&(localStorage.setItem(`${n}-width`,String(d)),localStorage.setItem(`${n}-collapsed`,String(s)))},[d,s,n]);const $=e.useCallback(t=>{t.preventDefault(),p(!0)},[]),f=e.useCallback(()=>{p(!1)},[]),h=e.useCallback(t=>{if(r&&u.current){let i;const g=u.current.getBoundingClientRect();l==="left"?i=t.clientX-g.left:i=g.right-t.clientX,i>=w&&i<=m&&b(i)}},[r,l,w,m]);e.useEffect(()=>(r&&(window.addEventListener("mousemove",h),window.addEventListener("mouseup",f)),()=>{window.removeEventListener("mousemove",h),window.removeEventListener("mouseup",f)}),[r,h,f]);const R=()=>v(!s);return o.jsxs("div",{ref:u,className:`relative flex flex-col shrink-0 h-full bg-white dark:bg-zinc-900 transition-[width] border-zinc-200 dark:border-zinc-800
        ${r?"duration-0 select-none":"duration-300 ease-in-out"}
        ${l==="left"?"border-r":"border-l"}
        ${N}`,style:{width:a?"100%":s?0:d},children:[o.jsx("div",{className:`flex-1 overflow-hidden flex flex-col min-w-0 ${s&&!a?"opacity-0 invisible":"opacity-100 visible"} transition-opacity duration-200`,children:C}),!s&&!a&&o.jsx("div",{className:`absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors z-40 group flex items-center justify-center
            ${l==="left"?"-right-0.5":"-left-0.5"}`,onMouseDown:$,title:"Drag to resize",children:o.jsx("div",{className:"w-0.5 h-full group-hover:bg-blue-500 transition-colors"})}),j&&!a&&o.jsx("button",{onClick:R,className:`absolute top-1/2 -translate-y-1/2 w-6 h-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-md flex items-center justify-center text-slate-400 hover:text-blue-500 z-50 focus:outline-none transition-transform duration-300 hover:scale-110
            ${l==="left"?"-right-3":"-left-3"}
          `,"aria-label":s?"Expand":"Collapse",title:s?"Expand":"Collapse",children:s?l==="left"?o.jsx(z,{className:"w-4 h-4"}):o.jsx(x,{className:"w-4 h-4"}):l==="left"?o.jsx(x,{className:"w-4 h-4"}):o.jsx(z,{className:"w-4 h-4"})})]})}export{D as C,q as G,G as R};
