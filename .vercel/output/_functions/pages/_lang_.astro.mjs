import { c as createAstro, a as createComponent, b as renderComponent, r as renderTemplate } from '../chunks/astro/server_D3ZOkX-6.mjs';
import 'kleur/colors';
import { l as languages } from '../chunks/Head_OLzv9HhO.mjs';
import { $ as $$StudioLayout } from '../chunks/StudioLayout_DxtR7SKB.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://astrotmp.vercel.app");
function getStaticPaths() {
  return Object.keys(languages).map((lang) => ({ params: { lang } }));
}
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const { lang } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "StudioLayout", $$StudioLayout, { "title": "Logo Studio Gallery", "description": "Manage your local logo projects.", "lang": lang }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Gallery", null, { "client:only": "react", "lang": lang, "client:component-hydration": "only", "client:component-path": "@/components/Gallery.tsx", "client:component-export": "default" })} ` })}`;
}, "/app/src/pages/[lang]/index.astro", void 0);

const $$file = "/app/src/pages/[lang]/index.astro";
const $$url = "/[lang]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	getStaticPaths,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
