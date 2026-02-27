import { c as createAstro, a as createComponent, r as renderTemplate, f as renderHead, d as addAttribute } from '../chunks/astro/server_D3ZOkX-6.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://astrotmp.vercel.app");
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate(_a || (_a = __template(['<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"', '><title>Loading...</title><meta http-equiv="refresh" content="0;url=/en"><script>\n			window.location.href = "/en";\n		<\/script>', '</head> <body class="bg-gray-950 text-white flex flex-col items-center justify-center min-h-screen"> <div class="relative flex items-center justify-center"> <div class="absolute animate-ping h-12 w-12 rounded-full bg-blue-400 opacity-75"></div> <div class="relative rounded-full h-12 w-12 bg-blue-500"></div> </div> <p class="mt-4 text-blue-200 animate-pulse">Loading...</p> </body></html>'])), addAttribute(Astro2.generator, "content"), renderHead());
}, "/app/src/pages/index.astro", void 0);

const $$file = "/app/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
