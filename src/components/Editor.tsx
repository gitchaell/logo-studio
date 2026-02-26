import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, ChevronDown, Download, Eye, Layout, Minus, Plus, RefreshCw, Save, Upload } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ui, defaultLang } from '@/i18n/ui';
import { useToast } from './ui/Toast';
import { ResizablePanel } from './ui/ResizablePanel';
import { PreviewGallery } from './previews/PreviewGallery';
import { generateManifest, generateAppJson, generateOpenGraph } from '@/lib/generators';

interface EditorProps {
    lang: string;
}

const getSvgDimensions = (svgString: string) => {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgString, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        if (!svg) return { width: 512, height: 512 };

        let width = parseFloat(svg.getAttribute('width') || '');
        let height = parseFloat(svg.getAttribute('height') || '');
        const viewBox = svg.getAttribute('viewBox');

        if (isNaN(width) && viewBox) {
            const parts = viewBox.split(/[\s,]+/).filter(Boolean);
            if (parts.length === 4) width = parseFloat(parts[2]);
        }
        if (isNaN(height) && viewBox) {
            const parts = viewBox.split(/[\s,]+/).filter(Boolean);
            if (parts.length === 4) height = parseFloat(parts[3]);
        }

        return {
            width: width || 512,
            height: height || 512
        };
    } catch (e) {
        return { width: 512, height: 512 };
    }
};

export default function Editor({ lang }: EditorProps) {
  const [id, setId] = useState<number | null>(null);
  const project = useLiveQuery(() => (id ? db.projects.get(id) : undefined), [id]);
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [colors, setColors] = useState<Record<string, string>>({});
  const [uniqueColors, setUniqueColors] = useState<string[]>([]);
  const [showGuide, setShowGuide] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([16, 32, 64, 128, 192, 512, 1024]);
  const [initialized, setInitialized] = useState(false);
  const [logoDimensions, setLogoDimensions] = useState({ width: 512, height: 512 });

  // Resize State
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [initialScale, setInitialScale] = useState(1);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(['style', 'colors']);

  const toggleSection = (section: string) => {
    setOpenSections(prev => prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]);
  };

  const t = (key: string) => {
    // @ts-ignore
    return ui[lang]?.[key] || ui[defaultLang]?.[key] || key;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    if (idParam) setId(Number(idParam));
  }, []);

  useEffect(() => {
    if (project && !initialized) {
        setScale(project.logoScale || 1);
        setPosition({ x: project.logoX || 0, y: project.logoY || 0 });
        setInitialized(true);
    }
  }, [project, initialized]);

  // Persist scale changes (debounced)
  useEffect(() => {
      if (!initialized || !project || !id) return;
      const timer = setTimeout(() => {
         if (project.logoScale !== scale) {
             db.projects.update(id, { logoScale: scale });
         }
      }, 500);
      return () => clearTimeout(timer);
  }, [scale, id, initialized]);

  // Parse SVG for colors and dimensions
  useEffect(() => {
    if (project?.svgContent) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(project.svgContent, 'image/svg+xml');

      // Colors
      const allElements = doc.querySelectorAll('*');
      const foundColors = new Set<string>();
      allElements.forEach(el => {
        const fill = el.getAttribute('fill');
        if (fill && fill !== 'none' && fill !== 'transparent') foundColors.add(fill);
        const stroke = el.getAttribute('stroke');
        if (stroke && stroke !== 'none' && stroke !== 'transparent') foundColors.add(stroke);
      });
      setUniqueColors(Array.from(foundColors));

      // Dimensions
      const dims = getSvgDimensions(project.svgContent);
      setLogoDimensions(dims);
    }
  }, [project]);

  // Apply color replacements
  const getProcessedSvg = () => {
    if (!project?.svgContent) return '';
    let content = project.svgContent;
    Object.entries(colors).forEach(([original, replacement]) => {
      content = content.replaceAll(`"${original}"`, `"${replacement}"`);
      content = content.replaceAll(`'${original}'`, `'${replacement}'`);
    });
    return content;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (activeTab !== 'edit') return;
    e.preventDefault();
    const zoomSensitivity = 0.001;
    const newScale = Math.min(Math.max(0.1, scale - e.deltaY * zoomSensitivity), 5);
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTab !== 'edit') return;
    if (e.button === 1 || e.button === 0) { // Middle or Left click
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
      setIsDragging(false);
      if (project && id) {
          db.projects.update(id, { logoX: position.x, logoY: position.y });
      }
  };

  // Resize Handlers
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
        if (!isResizing) return;

        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        let delta = 0;
        // In screen coordinates
        switch (activeHandle) {
            case 'br': delta = Math.max(deltaX, deltaY); break;
            case 'bl': delta = Math.max(-deltaX, deltaY); break;
            case 'tr': delta = Math.max(deltaX, -deltaY); break;
            case 'tl': delta = Math.max(-deltaX, -deltaY); break;
        }

        const sensitivity = 0.005;
        const newScale = Math.max(0.1, Math.min(5, initialScale + delta * sensitivity));

        setScale(newScale);
    };

    const handleWindowMouseUp = () => {
        if (isResizing) {
            setIsResizing(false);
            setActiveHandle(null);
        }
    };

    if (isResizing) {
        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);
    }
    return () => {
        window.removeEventListener('mousemove', handleWindowMouseMove);
        window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isResizing, resizeStart, initialScale, activeHandle]);

  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setActiveHandle(handle);
    setResizeStart({ x: e.clientX, y: e.clientY });
    setInitialScale(scale);
  };

  const handleColorChange = (original: string, newColor: string) => {
    setColors(prev => ({ ...prev, [original]: newColor }));
  };

  const handleSave = async () => {
    if (project && id) {
       await db.projects.update(id, {
           svgContent: getProcessedSvg(),
           updatedAt: new Date()
       });
       addToast(t('editor.saved'), 'success');
    }
  };

  const handleExport = async () => {
      if (!project) return;
      const zip = new JSZip();
      const svgString = getProcessedSvg();
      const sortedSizes = [...selectedSizes].sort((a, b) => a - b);

      // Add SVG
      zip.file(`${project.name}.svg`, svgString);

      // Manifest.json & App.json
      const manifest = generateManifest(project, sortedSizes);
      zip.file('manifest.json', JSON.stringify(manifest, null, 2));

      const appJson = generateAppJson(project, sortedSizes);
      zip.file('app.json', JSON.stringify(appJson, null, 2));

      // Generate PNGs Helper
      const generatePng = (width: number, height: number, scaleFactor: number = 1): Promise<Blob | null> => {
          return new Promise((resolve) => {
              const img = new Image();
              const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
              const url = URL.createObjectURL(svgBlob);

              img.onload = () => {
                  const canvas = document.createElement('canvas');
                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                      // Canvas logic for export (drawing centered on Artboard concept)
                      // When exporting 'icon-512', we assume 512 is the artboard size.
                      // We need to map the Editor's visual scaling to this export canvas.

                      const radius = (project.borderRadius || 0) * (width / 512);

                      ctx.beginPath();
                      ctx.moveTo(radius, 0);
                      ctx.lineTo(width - radius, 0);
                      ctx.quadraticCurveTo(width, 0, width, radius);
                      ctx.lineTo(width, height - radius);
                      ctx.quadraticCurveTo(width, height, width - radius, height);
                      ctx.lineTo(radius, height);
                      ctx.quadraticCurveTo(0, height, 0, height - radius);
                      ctx.lineTo(0, radius);
                      ctx.quadraticCurveTo(0, 0, radius, 0);
                      ctx.closePath();

                      ctx.clip();

                      if (project.backgroundColor) {
                          ctx.fillStyle = project.backgroundColor;
                          ctx.fill();
                      }

                      ctx.save();

                      // Move to center of export canvas
                      ctx.translate(width / 2, height / 2);

                      // Apply user position
                      // Position in Editor is px offset from center.
                      // We scale this offset proportional to the export size (assuming 512 is base)
                      const positionScale = width / 512;
                      const userLogoX = (project.logoX || 0) * positionScale;
                      const userLogoY = (project.logoY || 0) * positionScale;
                      ctx.translate(userLogoX, userLogoY);

                      // Apply user scale
                      // In editor, scale applies to the logo content.
                      const logoScale = (project.logoScale || 1) * scaleFactor;
                      ctx.scale(logoScale, logoScale);

                      // Draw Image
                      // We draw the image centered at (0,0) with its intrinsic size?
                      // Wait, if logoDimensions are 64x64, we should draw it as 64x64?
                      // In the editor, `logoDimensions * scale` is the visual size.
                      // If I export at 512x512, and logo is 64x64, it should look tiny (unless scaled).
                      // We need to scale the logo by (width/512) ONLY IF the logo dimensions were relative to 512.
                      // But logoDimensions are absolute pixels from SVG.
                      // If I export a 1024x1024 icon, everything should double in size.
                      // So we scale the *base dimensions* by (width/512).

                      const exportRatio = width / 512;

                      // Draw image centered
                      // img.width/height might be browser dependent if not loaded, but we parsed dims.
                      const drawWidth = logoDimensions.width * exportRatio;
                      const drawHeight = logoDimensions.height * exportRatio;

                      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);

                      ctx.restore();

                      canvas.toBlob((blob) => {
                          URL.revokeObjectURL(url);
                          resolve(blob);
                      });
                  } else {
                      resolve(null);
                  }
              };
              img.src = url;
          });
      };

      // Generate Standard Sizes
      const promises = sortedSizes.map(async (size) => {
          const blob = await generatePng(size, size);
          if (blob) zip.file(`icon-${size}.png`, blob);
      });

      // Generate Splash Screen (1080x1920)
      const splashPromise = generatePng(1080, 1920, 0.5).then(blob => {
          if (blob) zip.file('splash.png', blob);
      });
      promises.push(splashPromise);

      // Generate Favicon
      const faviconPromise = generatePng(32, 32).then(blob => {
          if (blob) zip.file('favicon.ico', blob);
      });
      promises.push(faviconPromise);

      // Generate OpenGraph Image
      try {
          const ogSvg = await generateOpenGraph(project, svgString);
          if (ogSvg) {
              zip.file('opengraph-image.svg', ogSvg);
          }
      } catch (e) {
          console.error("OG Generation failed", e);
      }

      await Promise.all(promises);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${project.name}-assets.zip`);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && id) {
          const reader = new FileReader();
          reader.onload = async (ev) => {
              const content = ev.target?.result as string;
              await db.projects.update(id, { svgContent: content, updatedAt: new Date() });
              addToast(t('editor.saved'), 'success');
          };
          reader.readAsText(file);
      }
  };

  if (!project) return <div className="flex items-center justify-center h-full text-slate-500">Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row h-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden">

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
         {/* Header */}
         <header className="h-16 px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center shrink-0 z-20 relative">
             <a href={`/${lang}`} className="absolute left-6 p-2 rounded-lg text-slate-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors" title={t('sidebar.back_to_overview')}>
                <ArrowLeft className="w-5 h-5" />
             </a>
             <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg">
                <button
                    onClick={() => setActiveTab('edit')}
                    className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'edit' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                    <Layout className="w-4 h-4 mr-2" />
                    Edit
                </button>
                <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'preview' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                </button>
             </div>
         </header>

         {/* Edit Mode Canvas */}
         <div className={`flex-1 relative bg-zinc-50 dark:bg-zinc-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] overflow-hidden cursor-move ${activeTab === 'edit' ? 'block' : 'hidden'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
         >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Canvas Background (Artboard) */}
                <div
                   className="absolute w-[512px] h-[512px] overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm"
                   style={{
                       backgroundColor: project.backgroundColor || 'transparent',
                       borderRadius: project.borderRadius ? `${project.borderRadius}px` : '0'
                   }}
                >
                    {/* Render the LOGO inside the artboard with correct dimensions and transform */}
                    <div className="w-full h-full flex items-center justify-center">
                         <div
                            style={{
                                width: logoDimensions.width,
                                height: logoDimensions.height,
                                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                transformOrigin: 'center',
                                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                            }}
                         >
                              <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: getProcessedSvg() }} />
                         </div>
                    </div>
                </div>

                {/* Selection Overlay */}
                {/* Visual match for the logo inside the artboard */}
                <div
                    className="absolute flex items-center justify-center" // Centered in screen (matching artboard center)
                    style={{ width: 0, height: 0 }} // Zero size wrapper
                >
                    <div
                        style={{
                            width: logoDimensions.width * scale,
                            height: logoDimensions.height * scale,
                            transform: `translate(${position.x}px, ${position.y}px)`,
                            position: 'absolute'
                        }}
                    >
                        {/* Outline */}
                        <div className="absolute inset-0 border border-blue-500 pointer-events-none opacity-50"></div>

                        {/* Handles */}
                        <div
                            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-nwse-resize pointer-events-auto shadow-sm"
                            onMouseDown={(e) => handleResizeMouseDown(e, 'tl')}
                        />
                        <div
                            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-nesw-resize pointer-events-auto shadow-sm"
                            onMouseDown={(e) => handleResizeMouseDown(e, 'tr')}
                        />
                        <div
                            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-nesw-resize pointer-events-auto shadow-sm"
                            onMouseDown={(e) => handleResizeMouseDown(e, 'bl')}
                        />
                        <div
                            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-nwse-resize pointer-events-auto shadow-sm"
                            onMouseDown={(e) => handleResizeMouseDown(e, 'br')}
                        />
                    </div>
                </div>

                {/* Guides Overlay */}
                {showGuide && (
                  <div className="absolute w-[512px] h-[512px] z-20 pointer-events-none opacity-60">
                    <svg width="512" height="512" viewBox="0 0 512 512" className="stroke-zinc-400/50 dark:stroke-zinc-600/50" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Outer Grid (16x16) - Dashed */}
                        <g strokeDasharray="4 4" strokeWidth="1">
                            {/* Verticals */}
                            {[...Array(7)].map((_, i) => (
                                <line key={`v-${i}`} x1={(i + 1) * 64} y1="0" x2={(i + 1) * 64} y2="512" />
                            ))}
                            {/* Horizontals */}
                            {[...Array(7)].map((_, i) => (
                                <line key={`h-${i}`} x1="0" y1={(i + 1) * 64} x2="512" y2={(i + 1) * 64} />
                            ))}
                        </g>

                        {/* Center Cross - Solid */}
                        <g strokeWidth="1.5" className="stroke-blue-500/50">
                            <line x1="256" y1="0" x2="256" y2="512" />
                            <line x1="0" y1="256" x2="512" y2="256" />
                        </g>

                        {/* Diagonals - Dashed */}
                        <g strokeDasharray="4 4" strokeWidth="1">
                            <line x1="0" y1="0" x2="512" y2="512" />
                            <line x1="512" y1="0" x2="0" y2="512" />
                        </g>

                        {/* Circular Guides */}
                        <g strokeWidth="1" strokeDasharray="4 4">
                            {/* Outer Circle (touching edges) */}
                            <circle cx="256" cy="256" r="256" />
                            {/* Inner Circle 1 (~85%) */}
                            <circle cx="256" cy="256" r="218" />
                             {/* Inner Circle 2 (~50%) */}
                            <circle cx="256" cy="256" r="128" />
                             {/* Inner Circle 3 (~25%) */}
                            <circle cx="256" cy="256" r="64" />
                        </g>

                        {/* Squircle Guides (App Icon Shape) */}
                        <g strokeWidth="1.5" strokeDasharray="4 4">
                             {/* Outer Squircle (Approximate path for Apple's superellipse) */}
                             <path d="M 256,0
                                C 64,0 0,64 0,256
                                C 0,448 64,512 256,512
                                C 448,512 512,448 512,256
                                C 512,64 448,0 256,0 Z"
                                className="stroke-zinc-500/50 dark:stroke-zinc-400/50"
                                transform="scale(0.9) translate(28.4, 28.4)" // Scale down slightly for visual fit like iOS grid
                             />

                             {/* Inner Square Guide */}
                             <rect x="128" y="128" width="256" height="256" rx="40" />
                        </g>
                    </svg>
                  </div>
                )}
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg px-4 py-2 flex items-center space-x-4">
                <button onClick={() => setScale(s => Math.max(0.1, s - 0.1))} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-slate-600 dark:text-slate-300">
                    <Minus className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono w-12 text-center text-slate-900 dark:text-white">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => Math.min(5, s + 0.1))} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-slate-600 dark:text-slate-300">
                    <Plus className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-2"></div>
                <button onClick={() => { setScale(1); setPosition({x:0,y:0}); }} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-slate-600 dark:text-slate-300" title={t('editor.reset_view')}>
                    <RefreshCw className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-2"></div>
                <button
                  onClick={() => setShowGuide(!showGuide)}
                  className={`p-1 rounded-full transition-colors ${showGuide ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300'}`}
                  title="Toggle Guide"
                >
                    <Layout className="w-4 h-4" />
                </button>
            </div>
         </div>

         {/* Preview Mode */}
         <div className={`flex-1 bg-zinc-50 dark:bg-zinc-950 overflow-hidden ${activeTab === 'preview' ? 'block' : 'hidden'}`}>
             <PreviewGallery
                svgContent={getProcessedSvg()}
                projectName={project.name}
                lang={lang}
                borderRadius={project.borderRadius}
                backgroundColor={project.backgroundColor}
                displayMode={project.displayMode}
                orientation={project.orientation}
                selectedSizes={selectedSizes}
                onToggleSize={(size) => setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])}
                onSelectAllSizes={() => setSelectedSizes([16, 32, 64, 128, 192, 512, 1024])}
                onDeselectAllSizes={() => setSelectedSizes([])}
                scale={scale}
                position={position}
             />
         </div>
      </main>

      {/* Right Sidebar - Configuration */}
      <ResizablePanel side="right" defaultWidth={320} minWidth={280} maxWidth={400} storageKey="editor-sidebar" className="z-10 h-1/2 md:h-full w-full border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                <div className="space-y-4">
                    <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">{t('editor.project_name')}</label>
                    <input
                        type="text"
                        value={project.name}
                        onChange={(e) => db.projects.update(project.id!, { name: e.target.value })}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                    />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
             {/* Logo Style */}
             <div className="border-b border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={() => toggleSection('style')}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Logo Style</h3>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${openSections.includes('style') ? 'rotate-180' : ''}`} />
                </button>
                {openSections.includes('style') && (
                    <div className="p-4 pt-0 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-2 block">Background Color</label>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 rounded border border-zinc-200 dark:border-zinc-700 overflow-hidden relative">
                                    <input
                                        type="color"
                                        value={project.backgroundColor || '#ffffff'}
                                        onChange={(e) => db.projects.update(project.id!, { backgroundColor: e.target.value })}
                                        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 m-0 border-none"
                                    />
                                </div>
                                <button
                                    onClick={() => db.projects.update(project.id!, { backgroundColor: undefined })}
                                    className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 underline"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-medium text-slate-500">Border Radius</label>
                                <span className="text-xs font-mono text-slate-400">{project.borderRadius || 0}px</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="256"
                                value={project.borderRadius || 0}
                                onChange={(e) => db.projects.update(project.id!, { borderRadius: Number(e.target.value) })}
                                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-blue-600"
                            />
                        </div>
                    </div>
                )}
             </div>

             {/* PWA / Manifest Settings */}
             <div className="border-b border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={() => toggleSection('pwa')}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">PWA & Manifest</h3>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${openSections.includes('pwa') ? 'rotate-180' : ''}`} />
                </button>
                {openSections.includes('pwa') && (
                    <div className="p-4 pt-0 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Short Name</label>
                            <input
                                type="text"
                                value={project.shortName || ''}
                                onChange={(e) => db.projects.update(project.id!, { shortName: e.target.value })}
                                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                placeholder="App"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Description</label>
                            <textarea
                                value={project.description || ''}
                                onChange={(e) => db.projects.update(project.id!, { description: e.target.value })}
                                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                                rows={2}
                                placeholder="My awesome app..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block">Theme Color</label>
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded border border-zinc-200 dark:border-zinc-700 overflow-hidden relative">
                                        <input
                                            type="color"
                                            value={project.themeColor || '#ffffff'}
                                            onChange={(e) => db.projects.update(project.id!, { themeColor: e.target.value })}
                                            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 m-0 border-none"
                                        />
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400">{project.themeColor}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block">App Bg Color</label>
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded border border-zinc-200 dark:border-zinc-700 overflow-hidden relative">
                                        <input
                                            type="color"
                                            value={project.appBackgroundColor || '#ffffff'}
                                            onChange={(e) => db.projects.update(project.id!, { appBackgroundColor: e.target.value })}
                                            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 m-0 border-none"
                                        />
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400">{project.appBackgroundColor}</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block">Display</label>
                                <select
                                    value={project.displayMode || 'standalone'}
                                    onChange={(e) => db.projects.update(project.id!, { displayMode: e.target.value as any })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                >
                                    <option value="standalone">Standalone</option>
                                    <option value="fullscreen">Fullscreen</option>
                                    <option value="minimal-ui">Minimal UI</option>
                                    <option value="browser">Browser</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 mb-1 block">Orientation</label>
                                <select
                                    value={project.orientation || 'any'}
                                    onChange={(e) => db.projects.update(project.id!, { orientation: e.target.value as any })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                >
                                    <option value="any">Any</option>
                                    <option value="natural">Natural</option>
                                    <option value="portrait">Portrait</option>
                                    <option value="landscape">Landscape</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Start URL</label>
                            <input
                                type="text"
                                value={project.startUrl || '/'}
                                onChange={(e) => db.projects.update(project.id!, { startUrl: e.target.value })}
                                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                )}
             </div>

            {/* Colors */}
            <div className="border-b border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={() => toggleSection('colors')}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('editor.recolor')}</h3>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${openSections.includes('colors') ? 'rotate-180' : ''}`} />
                </button>
                {openSections.includes('colors') && (
                    <div className="p-4 pt-0 space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
                        {uniqueColors.map((color, idx) => (
                            <div key={idx} className="flex items-center justify-between group">
                                <div className="flex items-center space-x-2">
                                    <div className="w-6 h-6 rounded border border-zinc-200 dark:border-zinc-700 shadow-sm" style={{ backgroundColor: color }}></div>
                                    <span className="text-xs font-mono text-slate-500">{color}</span>
                                </div>
                                <ArrowLeft className="w-3 h-3 text-slate-400 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center space-x-2 relative">
                                    <div className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 overflow-hidden cursor-pointer relative">
                                        <input
                                            type="color"
                                            value={colors[color] || color}
                                            onChange={(e) => handleColorChange(color, e.target.value)}
                                            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 m-0 border-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {uniqueColors.length === 0 && <p className="text-xs text-slate-400">No editable colors found.</p>}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="border-b border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={() => toggleSection('actions')}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('editor.actions')}</h3>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${openSections.includes('actions') ? 'rotate-180' : ''}`} />
                </button>
                {openSections.includes('actions') && (
                    <div className="p-4 pt-0 space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
                        <button
                            onClick={handleSave}
                            className="w-full flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                        >
                            <span className="text-sm text-slate-700 dark:text-slate-200">{t('editor.save')}</span>
                            <Save className="w-4 h-4 text-slate-500" />
                        </button>
                        <label className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
                            <span className="text-sm text-slate-700 dark:text-slate-200">{t('editor.replace_svg')}</span>
                            <Upload className="w-4 h-4 text-slate-500" />
                            <input type="file" accept=".svg" className="hidden" onChange={handleLogoUpload} />
                        </label>
                    </div>
                )}
            </div>
            </div>

            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/20 shrink-0 space-y-4">
                <button
                    onClick={handleExport}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow-sm font-medium transition-colors"
                >
                    <Download className="w-4 h-4" />
                    <span>{t('editor.download_assets')} ({selectedSizes.length})</span>
                </button>
            </div>
        </div>
      </ResizablePanel>
    </div>
  );
}
