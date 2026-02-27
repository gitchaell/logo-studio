import { c as createAstro, a as createComponent, m as maybeRenderHead, g as renderScript, d as addAttribute, r as renderTemplate, b as renderComponent, e as renderSlot } from './astro/server_D3ZOkX-6.mjs';
import 'kleur/colors';
import { l as languages, $ as $$Head, a as $$Index } from './Head_OLzv9HhO.mjs';
import 'clsx';

const $$Astro$1 = createAstro("https://astrotmp.vercel.app");
const $$LanguageSelector = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$LanguageSelector;
  const { pathname } = Astro2.url;
  const currentLang = Astro2.currentLocale || "en";
  function getPathForLang(lang) {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && Object.keys(languages).includes(segments[0])) {
      segments[0] = lang;
    } else {
      segments.unshift(lang);
    }
    return `/${segments.join("/")}`;
  }
  return renderTemplate`${maybeRenderHead()}<div class="relative ml-2"> <button id="language-toggle" type="button" class="inline-flex items-center gap-1 rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" aria-label="Change language"> <span class="font-medium text-sm">${currentLang.toUpperCase()}</span> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down opacity-60"> <path d="m6 9 6 6 6-6"></path> </svg> </button> <div id="language-menu" class="absolute right-0 top-full mt-2 hidden w-32 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 z-50 animate-in fade-in slide-in-from-top-2 duration-200"> ${Object.entries(languages).map(([lang, label]) => renderTemplate`<a${addAttribute(getPathForLang(lang), "href")}${addAttribute([
    "block px-4 py-2 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800",
    { "font-bold text-blue-600 dark:text-blue-400": lang === currentLang },
    { "text-zinc-700 dark:text-zinc-300": lang !== currentLang }
  ], "class:list")}> ${label} </a>`)} </div> </div> ${renderScript($$result, "/app/src/components/LanguageSelector.astro?astro&type=script&index=0&lang.ts")}`;
}, "/app/src/components/LanguageSelector.astro", void 0);

const $$ThemeToggle = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<button id="theme-toggle" aria-label="Toggle Dark Mode" class="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"> <svg class="sun hidden h-5 w-5 text-yellow-500 dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path> </svg> <svg class="moon block h-5 w-5 text-zinc-900 dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path> </svg> </button> ${renderScript($$result, "/app/src/components/ThemeToggle.astro?astro&type=script&index=0&lang.ts")}`;
}, "/app/src/components/ThemeToggle.astro", void 0);

const $$Astro = createAstro("https://astrotmp.vercel.app");
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title, description, lang = Astro2.currentLocale || "en" } = Astro2.props;
  return renderTemplate`<html${addAttribute(lang, "lang")}> ${renderComponent($$result, "Head", $$Head, { "title": title, "description": description })}${maybeRenderHead()}<body class="relative h-dvh overflow-x-hidden overflow-y-auto bg-zinc-50 font-sans text-black antialiased selection:bg-zinc-300 selection:text-zinc-900 dark:bg-zinc-900 dark:text-white dark:selection:bg-zinc-700 dark:selection:text-zinc-50"> <div class="absolute top-4 right-4 z-50 flex items-center gap-2"> ${renderComponent($$result, "LanguageSelector", $$LanguageSelector, {})} ${renderComponent($$result, "ThemeToggle", $$ThemeToggle, {})} </div> ${renderSlot($$result, $$slots["default"])} ${renderComponent($$result, "Analytics", $$Index, {})} </body></html>`;
}, "/app/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
