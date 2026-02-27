import { c as createAstro, a as createComponent, d as addAttribute, b as renderComponent, m as maybeRenderHead, e as renderSlot, r as renderTemplate } from './astro/server_D3ZOkX-6.mjs';
import 'kleur/colors';
import { $ as $$Head, a as $$Index } from './Head_OLzv9HhO.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const TOAST_EVENT = "logo-studio:toast";
function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const handleToast = (e) => {
      const detail = e.detail;
      const id = Math.random().toString(36).substring(7);
      setToasts((prev) => [...prev, { id, message: detail.message, type: detail.type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3e3);
    };
    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none", children: toasts.map((toast2) => /* @__PURE__ */ jsxs(
    "div",
    {
      className: `
            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-right-full duration-300
            ${toast2.type === "success" ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200" : ""}
            ${toast2.type === "error" ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200" : ""}
            ${toast2.type === "info" ? "bg-white border-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200" : ""}
          `,
      children: [
        toast2.type === "success" && /* @__PURE__ */ jsx(CheckCircle, { className: "w-5 h-5 text-green-500" }),
        toast2.type === "error" && /* @__PURE__ */ jsx(AlertCircle, { className: "w-5 h-5 text-red-500" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: toast2.message }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => removeToast(toast2.id),
            className: "ml-auto p-1 hover:bg-black/5 rounded-full transition-colors",
            children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4 opacity-50 hover:opacity-100" })
          }
        )
      ]
    },
    toast2.id
  )) });
}

const $$Astro = createAstro("https://astrotmp.vercel.app");
const $$StudioLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$StudioLayout;
  const { title, description, lang = Astro2.currentLocale || "en" } = Astro2.props;
  return renderTemplate`<html${addAttribute(lang, "lang")}> ${renderComponent($$result, "Head", $$Head, { "title": title, "description": description })}${maybeRenderHead()}<body class="bg-zinc-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-50 h-screen overflow-hidden flex flex-col md:flex-row transition-colors duration-200 font-sans"> ${renderComponent($$result, "Sidebar", null, { "client:only": "react", "lang": lang, "client:component-hydration": "only", "client:component-path": "@/components/Sidebar.tsx", "client:component-export": "default" })} <!-- Main Content Wrapper --> <div class="flex-1 flex flex-col h-full relative overflow-hidden"> ${renderComponent($$result, "ToastContainer", ToastContainer, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/ui/Toast", "client:component-export": "ToastContainer" })} ${renderSlot($$result, $$slots["default"])} </div> ${renderComponent($$result, "Analytics", $$Index, {})} </body></html>`;
}, "/app/src/layouts/StudioLayout.astro", void 0);

export { $$StudioLayout as $ };
