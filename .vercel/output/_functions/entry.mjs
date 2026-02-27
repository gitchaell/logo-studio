import { renderers } from './renderers.mjs';
import { a as actions } from './chunks/_noop-actions_CfKMStZn.mjs';
import { c as createExports } from './chunks/entrypoint_DXDgmWur.mjs';
import { manifest } from './manifest_DzQF0lrM.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/500.astro.mjs');
const _page3 = () => import('./pages/api/generate-og.astro.mjs');
const _page4 = () => import('./pages/_lang_/demo.astro.mjs');
const _page5 = () => import('./pages/_lang_/editor.astro.mjs');
const _page6 = () => import('./pages/_lang_.astro.mjs');
const _page7 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/500.astro", _page2],
    ["src/pages/api/generate-og.ts", _page3],
    ["src/pages/[lang]/demo/index.astro", _page4],
    ["src/pages/[lang]/editor.astro", _page5],
    ["src/pages/[lang]/index.astro", _page6],
    ["src/pages/index.astro", _page7]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions,
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "middlewareSecret": "c809d6ba-bb60-4da5-b734-b0a34f044f40",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
