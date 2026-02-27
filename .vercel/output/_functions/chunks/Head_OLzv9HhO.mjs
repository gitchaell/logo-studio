import { c as createAstro, a as createComponent, b as renderComponent, g as renderScript, r as renderTemplate, d as addAttribute, f as renderHead } from './astro/server_D3ZOkX-6.mjs';
import 'kleur/colors';
/* empty css                         */
/* empty css                         */
import 'clsx';

const languages = {
  en: "English",
  es: "Español",
  de: "Deutsch",
  ja: "日本語",
  ko: "한국어"
};
const defaultLang = "en";
const ui = {
  en: {
    "site.title": "Logo Studio",
    "site.description": "Edit and manage your SVG logos locally.",
    "hero.title": "Logo Studio",
    "hero.subtitle": "Local SVG Editor",
    "sidebar.library": "Library",
    "sidebar.my_projects": "My Projects",
    "sidebar.new_project": "New Project",
    "editor.back_to_gallery": "Back to Gallery",
    "editor.project_name": "Project Name",
    "editor.recolor": "Recolor",
    "editor.actions": "Actions",
    "editor.replace_svg": "Replace SVG",
    "editor.download_assets": "Download Assets",
    "editor.save": "Save",
    "editor.saved": "Saved!",
    "editor.reset_view": "Reset View",
    "gallery.search_placeholder": "Search projects...",
    "gallery.no_projects": "No projects yet",
    "gallery.upload_prompt": "Upload an SVG to get started.",
    "gallery.create_new": "Create New Project",
    "gallery.rename": "Rename",
    "gallery.delete": "Delete",
    "gallery.edited": "Edited",
    "preview.browser_tab": "Browser Favicon Preview",
    "preview.mobile_icon": "Mobile App Icon Preview",
    "preview.light_mode": "Light Mode",
    "preview.dark_mode": "Dark Mode",
    "preview.ios_home": "iOS Home",
    "preview.android_home": "Android Home",
    "success.project_deleted": "Project deleted",
    "success.project_renamed": "Project renamed",
    "alert.upload_svg": "Please upload an SVG file.",
    "alert.save_error": "Failed to save project.",
    "alert.delete_confirm": "Are you sure you want to delete this project?",
    "alert.rename_prompt": "Enter new project name:",
    "alert.confirm_delete_title": "Confirm Delete",
    "alert.rename_title": "Rename Project",
    "alert.cancel": "Cancel",
    "alert.confirm": "Confirm"
  },
  es: {
    "site.title": "Logo Studio",
    "site.description": "Edita y gestiona tus logos SVG localmente.",
    "hero.title": "Logo Studio",
    "hero.subtitle": "Editor SVG Local",
    "sidebar.library": "Biblioteca",
    "sidebar.my_projects": "Mis Proyectos",
    "sidebar.new_project": "Nuevo Proyecto",
    "editor.back_to_gallery": "Volver a la Galería",
    "editor.project_name": "Nombre del Proyecto",
    "editor.recolor": "Recolorear",
    "editor.actions": "Acciones",
    "editor.replace_svg": "Reemplazar SVG",
    "editor.download_assets": "Descargar Recursos",
    "editor.save": "Guardar",
    "editor.saved": "¡Guardado!",
    "editor.reset_view": "Restablecer Vista",
    "gallery.search_placeholder": "Buscar proyectos...",
    "gallery.no_projects": "Aún no hay proyectos",
    "gallery.upload_prompt": "Sube un SVG para comenzar.",
    "gallery.create_new": "Crear Nuevo Proyecto",
    "gallery.rename": "Renombrar",
    "gallery.delete": "Eliminar",
    "gallery.edited": "Editado",
    "preview.browser_tab": "Vista Previa de Favicon",
    "preview.mobile_icon": "Vista Previa de Icono Móvil",
    "preview.light_mode": "Modo Claro",
    "preview.dark_mode": "Modo Oscuro",
    "preview.ios_home": "Inicio iOS",
    "preview.android_home": "Inicio Android",
    "success.project_deleted": "Proyecto eliminado",
    "success.project_renamed": "Proyecto renombrado",
    "alert.upload_svg": "Por favor, sube un archivo SVG.",
    "alert.save_error": "Error al guardar el proyecto.",
    "alert.delete_confirm": "¿Estás seguro de que quieres eliminar este proyecto?",
    "alert.rename_prompt": "Introduce el nuevo nombre del proyecto:",
    "alert.confirm_delete_title": "Confirmar Eliminación",
    "alert.rename_title": "Renombrar Proyecto",
    "alert.cancel": "Cancelar",
    "alert.confirm": "Confirmar"
  },
  de: {
    "site.title": "Logo Studio",
    "site.description": "Bearbeiten und verwalten Sie Ihre SVG-Logos lokal.",
    "hero.title": "Logo Studio",
    "hero.subtitle": "Lokaler SVG-Editor",
    "sidebar.library": "Bibliothek",
    "sidebar.my_projects": "Meine Projekte",
    "sidebar.new_project": "Neues Projekt",
    "editor.back_to_gallery": "Zurück zur Galerie",
    "editor.project_name": "Projektname",
    "editor.recolor": "Umfärben",
    "editor.actions": "Aktionen",
    "editor.replace_svg": "SVG ersetzen",
    "editor.download_assets": "Assets herunterladen",
    "editor.save": "Speichern",
    "editor.saved": "Gespeichert!",
    "editor.reset_view": "Ansicht zurücksetzen",
    "gallery.search_placeholder": "Projekte suchen...",
    "gallery.no_projects": "Noch keine Projekte",
    "gallery.upload_prompt": "Laden Sie ein SVG hoch, um zu beginnen.",
    "gallery.create_new": "Neues Projekt erstellen",
    "gallery.rename": "Umbenennen",
    "gallery.delete": "Löschen",
    "gallery.edited": "Bearbeitet",
    "preview.browser_tab": "Browser-Favicon-Vorschau",
    "preview.mobile_icon": "Vorschau des mobilen App-Symbols",
    "preview.light_mode": "Heller Modus",
    "preview.dark_mode": "Dunkler Modus",
    "preview.ios_home": "iOS-Startbildschirm",
    "preview.android_home": "Android-Startbildschirm",
    "success.project_deleted": "Projekt gelöscht",
    "success.project_renamed": "Projekt umbenannt",
    "alert.upload_svg": "Bitte laden Sie eine SVG-Datei hoch.",
    "alert.save_error": "Projekt konnte nicht gespeichert werden.",
    "alert.delete_confirm": "Sind Sie sicher, dass Sie dieses Projekt löschen möchten?",
    "alert.rename_prompt": "Geben Sie einen neuen Projektnamen ein:",
    "alert.confirm_delete_title": "Löschen bestätigen",
    "alert.rename_title": "Projekt umbenennen",
    "alert.cancel": "Abbrechen",
    "alert.confirm": "Bestätigen"
  },
  ja: {
    "site.title": "Logo Studio",
    "site.description": "SVGロゴをローカルで編集および管理します。",
    "hero.title": "Logo Studio",
    "hero.subtitle": "ローカルSVGエディター",
    "sidebar.library": "ライブラリ",
    "sidebar.my_projects": "マイプロジェクト",
    "sidebar.new_project": "新規プロジェクト",
    "editor.back_to_gallery": "ギャラリーに戻る",
    "editor.project_name": "プロジェクト名",
    "editor.recolor": "色を変更",
    "editor.actions": "アクション",
    "editor.replace_svg": "SVGを置換",
    "editor.download_assets": "アセットをダウンロード",
    "editor.save": "保存",
    "editor.saved": "保存しました！",
    "editor.reset_view": "ビューをリセット",
    "gallery.search_placeholder": "プロジェクトを検索...",
    "gallery.no_projects": "プロジェクトはまだありません",
    "gallery.upload_prompt": "SVGをアップロードして開始してください。",
    "gallery.create_new": "新規プロジェクトを作成",
    "gallery.rename": "名前を変更",
    "gallery.delete": "削除",
    "gallery.edited": "編集済み",
    "preview.browser_tab": "ブラウザのファビコンプレビュー",
    "preview.mobile_icon": "モバイルアプリのアイコンプレビュー",
    "preview.light_mode": "ライトモード",
    "preview.dark_mode": "ダークモード",
    "preview.ios_home": "iOSホーム",
    "preview.android_home": "Androidホーム",
    "success.project_deleted": "プロジェクトが削除されました",
    "success.project_renamed": "プロジェクト名が変更されました",
    "alert.upload_svg": "SVGファイルをアップロードしてください。",
    "alert.save_error": "プロジェクトの保存に失敗しました。",
    "alert.delete_confirm": "このプロジェクトを削除してもよろしいですか？",
    "alert.rename_prompt": "新しいプロジェクト名を入力してください：",
    "alert.confirm_delete_title": "削除の確認",
    "alert.rename_title": "プロジェクト名の変更",
    "alert.cancel": "キャンセル",
    "alert.confirm": "確認"
  },
  ko: {
    "site.title": "Logo Studio",
    "site.description": "SVG 로고를 로컬에서 편집하고 관리하세요.",
    "hero.title": "Logo Studio",
    "hero.subtitle": "로컬 SVG 편집기",
    "sidebar.library": "라이브러리",
    "sidebar.my_projects": "내 프로젝트",
    "sidebar.new_project": "새 프로젝트",
    "editor.back_to_gallery": "갤러리로 돌아가기",
    "editor.project_name": "프로젝트 이름",
    "editor.recolor": "색상 변경",
    "editor.actions": "작업",
    "editor.replace_svg": "SVG 교체",
    "editor.download_assets": "자산 다운로드",
    "editor.save": "저장",
    "editor.saved": "저장됨!",
    "editor.reset_view": "보기 재설정",
    "gallery.search_placeholder": "프로젝트 검색...",
    "gallery.no_projects": "아직 프로젝트가 없습니다",
    "gallery.upload_prompt": "SVG를 업로드하여 시작하세요.",
    "gallery.create_new": "새 프로젝트 만들기",
    "gallery.rename": "이름 바꾸기",
    "gallery.delete": "삭제",
    "gallery.edited": "수정됨",
    "preview.browser_tab": "브라우저 파비콘 미리보기",
    "preview.mobile_icon": "모바일 앱 아이콘 미리보기",
    "preview.light_mode": "라이트 모드",
    "preview.dark_mode": "다크 모드",
    "preview.ios_home": "iOS 홈",
    "preview.android_home": "Android 홈",
    "success.project_deleted": "프로젝트 삭제됨",
    "success.project_renamed": "프로젝트 이름 변경됨",
    "alert.upload_svg": "SVG 파일을 업로드해주세요.",
    "alert.save_error": "프로젝트 저장 실패.",
    "alert.delete_confirm": "이 프로젝트를 삭제하시겠습니까?",
    "alert.rename_prompt": "새 프로젝트 이름을 입력하세요:",
    "alert.confirm_delete_title": "삭제 확인",
    "alert.rename_title": "프로젝트 이름 바꾸기",
    "alert.cancel": "취소",
    "alert.confirm": "확인"
  }
};

const $$Astro$3 = createAstro("https://astrotmp.vercel.app");
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$Index;
  const propsStr = JSON.stringify(Astro2.props);
  const paramsStr = JSON.stringify(Astro2.params);
  return renderTemplate`${renderComponent($$result, "vercel-analytics", "vercel-analytics", { "data-props": propsStr, "data-params": paramsStr, "data-pathname": Astro2.url.pathname })} ${renderScript($$result, "/app/node_modules/@vercel/analytics/dist/astro/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "/app/node_modules/@vercel/analytics/dist/astro/index.astro", void 0);

const $$Astro$2 = createAstro("https://astrotmp.vercel.app");
const $$ClientRouter = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$ClientRouter;
  const { fallback = "animate" } = Astro2.props;
  return renderTemplate`<meta name="astro-view-transitions-enabled" content="true"><meta name="astro-view-transitions-fallback"${addAttribute(fallback, "content")}>${renderScript($$result, "/app/node_modules/astro/components/ClientRouter.astro?astro&type=script&index=0&lang.ts")}`;
}, "/app/node_modules/astro/components/ClientRouter.astro", void 0);

const $$Favicon = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<link rel="icon" type="image/svg+xml" href="/favicon.svg">${renderScript($$result, "/app/src/components/Favicon.astro?astro&type=script&index=0&lang.ts")}`;
}, "/app/src/components/Favicon.astro", void 0);

const $$Astro$1 = createAstro("https://astrotmp.vercel.app");
const $$SEO = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$SEO;
  const { title, description, image, url } = Astro2.props;
  const opengraph = {
    type: "website",
    locale: "en_US",
    site: {
      name: "Astro"
    },
    ...Astro2.props.opengraph
  };
  const twitter = {
    card: "summary_large_image",
    ...Astro2.props.twitter
  };
  const openGraphMetaTags = [
    { property: "og:title", content: title },
    { property: "og:type", content: opengraph.type },
    { property: "og:url", content: url },
    { property: "og:image", content: image.url },
    { property: "og:audio", content: opengraph.audio?.url },
    { property: "og:determiner", content: opengraph.determiner },
    { property: "og:locale", content: opengraph.locale },
    ...(opengraph.localeAlternates || []).map((alternate) => ({
      property: "og:locale:alternate",
      content: alternate
    })),
    { property: "og:description", content: description },
    { property: "og:site_name", content: opengraph.site.name },
    { property: "og:video", content: opengraph.video?.url },
    // Image
    { property: "og:image:url", content: image.url },
    { property: "og:image:secure_url", content: image.secureUrl },
    { property: "og:image:type", content: image.type },
    { property: "og:image:width", content: image.width },
    { property: "og:image:height", content: image.height },
    { property: "og:image:alt", content: image.alt },
    // Video
    { property: "og:video:url", content: opengraph.video?.url },
    { property: "og:video:secure_url", content: opengraph.video?.secureUrl },
    { property: "og:video:type", content: opengraph.video?.type },
    { property: "og:video:width", content: opengraph.video?.width },
    { property: "og:video:height", content: opengraph.video?.height },
    { property: "video:actor", content: opengraph.video?.actor?.name },
    { property: "video:actor:role", content: opengraph.video?.actor?.role },
    { property: "video:director", content: opengraph.video?.director },
    { property: "video:writer", content: opengraph.video?.writer },
    { property: "video:duration", content: opengraph.video?.duration },
    { property: "video:release_date", content: opengraph.video?.releaseDate },
    ...(opengraph.video?.tags || []).map((tag) => ({
      property: "video:tag",
      content: tag
    })),
    // Audio
    { property: "og:audio:url", content: opengraph.audio?.url },
    { property: "og:audio:secure_url", content: opengraph.audio?.secureUrl },
    { property: "og:audio:type", content: opengraph.audio?.type },
    // Music
    { property: "music:duration", content: opengraph.music?.duration },
    ...(opengraph.music?.musicians || []).map((musician) => ({
      property: "music:musician",
      content: musician
    })),
    { property: "music:release_date", content: opengraph.music?.releaseDate },
    { property: "music:creator", content: opengraph.music?.creator },
    { property: "music:song", content: opengraph.music?.song?.name },
    { property: "music:song:disc", content: opengraph.music?.song?.disc },
    { property: "music:song:track", content: opengraph.music?.song?.track },
    { property: "music:album", content: opengraph.music?.album?.name },
    { property: "music:album:disc", content: opengraph.music?.album?.disc },
    { property: "music:album:track", content: opengraph.music?.album?.track },
    // Article
    {
      property: "article:published_time",
      content: opengraph.article?.publishedTime
    },
    {
      property: "article:modified_time",
      content: opengraph.article?.modifiedTime
    },
    {
      property: "article:expiration_time",
      content: opengraph.article?.expirationTime
    },
    ...(opengraph.article?.authors || []).map((author) => ({
      property: "article:author",
      content: author
    })),
    { property: "article:section", content: opengraph.article?.section },
    ...(opengraph.article?.tags || []).map((tag) => ({
      property: "article:tag",
      content: tag
    })),
    // Book
    ...(opengraph.book?.authors || []).map((author) => ({
      property: "book:author",
      content: author
    })),
    { property: "book:isbn", content: opengraph.book?.isbn },
    { property: "book:release_date", content: opengraph.book?.releaseDate },
    ...(opengraph.book?.tags || []).map((tag) => ({
      property: "book:tag",
      content: tag
    })),
    // Profile
    { property: "profile:first_name", content: opengraph.profile?.firstName },
    { property: "profile:last_name", content: opengraph.profile?.lastName },
    { property: "profile:username", content: opengraph.profile?.username },
    { property: "profile:gender", content: opengraph.profile?.gender }
  ].filter((metatag) => metatag.content !== void 0);
  const twitterMetaTags = [
    { name: "twitter:card", content: twitter.card },
    { name: "twitter:site", content: twitter.site?.username },
    { name: "twitter:site:id", content: twitter.site?.id },
    { name: "twitter:creator", content: twitter.creator?.username },
    { name: "twitter:creator:id", content: twitter.creator?.id },
    { name: "twitter:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:image", content: image.url },
    { name: "twitter:image:alt", content: image.alt },
    { name: "twitter:player", content: twitter.player?.url },
    { name: "twitter:player:width", content: twitter.player?.width },
    { name: "twitter:player:height", content: twitter.player?.height },
    { name: "twitter:player:stream", content: twitter.player?.stream }
  ].filter((metatag) => metatag.content !== void 0);
  return renderTemplate`${url && renderTemplate`<link rel="canonical"${addAttribute(url, "href")}>`}<link rel="sitemap" href="/sitemap-index.xml"><meta name="description"${addAttribute(description, "content")}>${openGraphMetaTags.map(({ property, content }) => renderTemplate`<meta${addAttribute(property, "property")}${addAttribute(content, "content")}>`)}${twitterMetaTags.map(({ name, content }) => renderTemplate`<meta${addAttribute(name, "name")}${addAttribute(content, "content")}>`)}<meta name="robots" content="max-image-preview:large">`;
}, "/app/src/components/SEO.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://astrotmp.vercel.app");
const $$Head = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Head;
  const { title, description } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width">', '<meta name="generator"', "><title>", "</title>", "", "<script>\n		if (\n			localStorage.theme === 'dark' ||\n			(!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)\n		) {\n			document.documentElement.classList.add('dark');\n		} else {\n			document.documentElement.classList.remove('dark');\n		}\n	<\/script>", "</head>"])), renderComponent($$result, "Favicon", $$Favicon, {}), addAttribute(Astro2.generator, "content"), title, renderComponent($$result, "SEO", $$SEO, { "url": "https://amazing.app/", "title": title, "description": description, "image": { url: "https://amazing.app/opengraph/image.png", alt: "Amazing App Image" }, "twitter": { site: { username: "@amazingapp" } }, "opengraph": { type: "website", locale: "en", site: { name: "Amazing App" } } }), renderComponent($$result, "ClientRouter", $$ClientRouter, {}), renderHead());
}, "/app/src/components/Head.astro", void 0);

export { $$Head as $, $$Index as a, defaultLang as d, languages as l, ui as u };
