import { c as createAstro, a as createComponent, b as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_D3ZOkX-6.mjs';
import 'kleur/colors';
import { $ as $$Hero } from '../chunks/Hero_D_qplxRa.mjs';
import { $ as $$Layout } from '../chunks/Layout_C1uwhOyj.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://astrotmp.vercel.app");
const $$404 = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$404;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Astro Template", "description": "Astro Template" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="container mx-auto"> ${renderComponent($$result2, "Hero", $$Hero, {})} </main> ` })}`;
}, "/app/src/pages/404.astro", void 0);

const $$file = "/app/src/pages/404.astro";
const $$url = "/404";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$404,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
