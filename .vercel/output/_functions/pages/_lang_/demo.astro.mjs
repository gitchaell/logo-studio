import { a as createComponent, c as createAstro, m as maybeRenderHead, s as spreadAttributes, d as addAttribute, e as renderSlot, b as renderComponent, r as renderTemplate } from '../../chunks/astro/server_D3ZOkX-6.mjs';
import 'kleur/colors';
import { l as languages } from '../../chunks/Head_OLzv9HhO.mjs';
import { $ as $$Layout } from '../../chunks/Layout_C1uwhOyj.mjs';
export { renderers } from '../../renderers.mjs';

const defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
};

const hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
  return false;
};

const $$Astro$1 = createAstro("https://astrotmp.vercel.app");
const $$Icon = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Icon;
  const {
    color = "currentColor",
    size = 24,
    "stroke-width": strokeWidth = 2,
    absoluteStrokeWidth = false,
    iconNode = [],
    class: className,
    ...rest
  } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<svg${spreadAttributes({
    ...defaultAttributes,
    width: size,
    height: size,
    stroke: color,
    "stroke-width": absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
    ...!hasA11yProp(rest) && { "aria-hidden": "true" },
    ...rest
  })}${addAttribute(["lucide", className], "class:list")}> ${iconNode.map(([Tag, attrs]) => renderTemplate`${renderComponent($$result, "Tag", Tag, { ...attrs })}`)} ${renderSlot($$result, $$slots["default"])} </svg>`;
}, "/app/node_modules/@lucide/astro/src/Icon.astro", void 0);

const mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();

const toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

const createLucideIcon = (iconName, iconNode) => {
  const Component = createComponent(
    ($$result, $$props, $$slots) => {
      const { class: className, ...restProps } = $$props;
      return renderTemplate`${renderComponent(
        $$result,
        "Icon",
        $$Icon,
        {
          class: mergeClasses(
            Boolean(iconName) && `lucide-${toKebabCase(iconName)}`,
            Boolean(className) && className
          ),
          iconNode,
          ...restProps
        },
        { default: () => renderTemplate`${renderSlot($$result, $$slots["default"])}` }
      )}`;
    },
    void 0,
    "none"
  );
  return Component;
};

const Activity = createLucideIcon("activity", [["path", { "d": "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" }]]);

const Code = createLucideIcon("code", [["path", { "d": "m16 18 6-6-6-6" }], ["path", { "d": "m8 6-6 6 6 6" }]]);

const $$Astro = createAstro("https://astrotmp.vercel.app");
function getStaticPaths() {
  return Object.keys(languages).map((lang) => ({ params: { lang } }));
}
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const { lang } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Demo Page", "description": "A demo page showcasing typography and theme.", "lang": lang }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="container mx-auto max-w-2xl py-12 px-4 prose dark:prose-invert"> <h1 class="text-4xl font-bold mb-8 text-black dark:text-white">Typography Demo</h1> <div class="space-y-6 text-zinc-800 dark:text-zinc-200"> <section> <h2 class="text-2xl font-semibold mb-2 flex items-center gap-2">${renderComponent($$result2, "Code", Code, {})} Headings</h2> <h1 class="text-4xl font-bold">Heading 1</h1> <h2 class="text-3xl font-bold">Heading 2</h2> <h3 class="text-2xl font-bold">Heading 3</h3> <h4 class="text-xl font-bold">Heading 4</h4> </section> <section> <h2 class="text-2xl font-semibold mb-2 flex items-center gap-2">${renderComponent($$result2, "Activity", Activity, {})} Paragraphs</h2> <p class="mb-4">
This is a paragraph using the <strong>Geist Sans</strong> font. It is optimized for readability.
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam non urna erot.
</p> <p class="font-mono bg-zinc-100 dark:bg-zinc-800 p-4 rounded text-sm">
This block uses the <strong>Google Sans Code</strong> font.
					const hello = "world";
					console.log(hello);
</p> </section> <section> <h2 class="text-2xl font-semibold mb-2">Buttons & Interactive</h2> <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
Primary Button
</button> <button class="px-4 py-2 bg-zinc-200 text-zinc-900 rounded hover:bg-zinc-300 transition dark:bg-zinc-700 dark:text-white dark:hover:bg-zinc-600 ml-2">
Secondary Button
</button> </section> </div> </main> ` })}`;
}, "/app/src/pages/[lang]/demo/index.astro", void 0);

const $$file = "/app/src/pages/[lang]/demo/index.astro";
const $$url = "/[lang]/demo";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
