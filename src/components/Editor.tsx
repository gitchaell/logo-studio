import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Download, Eye, Layout, Minus, Plus, RefreshCw, Save, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ui, defaultLang } from '@/i18n/ui';
import { useToast } from './ui/Toast';
import { ResizablePanel } from './ui/ResizablePanel';
import { PreviewGallery } from './previews/PreviewGallery';

interface EditorProps {
    lang: string;
}

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

  // Extract unique colors from SVG content
  useEffect(() => {
    if (project?.svgContent) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(project.svgContent, 'image/svg+xml');
      const allElements = doc.querySelectorAll('*');
      const foundColors = new Set<string>();

      allElements.forEach(el => {
        const fill = el.getAttribute('fill');
        if (fill && fill !== 'none' && fill !== 'transparent') foundColors.add(fill);
        const stroke = el.getAttribute('stroke');
        if (stroke && stroke !== 'none' && stroke !== 'transparent') foundColors.add(stroke);
      });

      setUniqueColors(Array.from(foundColors));
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
      const largestSize = sortedSizes.length > 0 ? sortedSizes[sortedSizes.length - 1] : undefined;

      // Add SVG
      zip.file(`${project.name}.svg`, svgString);

      // Manifest.json
      const manifest = {
          name: project.name,
          short_name: project.shortName || project.name,
          description: project.description || '',
          theme_color: project.themeColor || '#ffffff',
          background_color: project.appBackgroundColor || '#ffffff',
          display: project.displayMode || 'standalone',
          orientation: project.orientation || 'any',
          start_url: project.startUrl || '/',
          icons: sortedSizes.map(size => ({
              src: `icon-${size}.png`,
              sizes: `${size}x${size}`,
              type: 'image/png'
          }))
      };
      zip.file('manifest.json', JSON.stringify(manifest, null, 2));

      // app.json (Expo)
      const appJson = {
          expo: {
              name: project.name,
              slug: project.shortName?.toLowerCase().replace(/\s+/g, '-') || project.name.toLowerCase().replace(/\s+/g, '-'),
              version: "1.0.0",
              orientation: project.orientation === 'any' ? 'default' : project.orientation,
              icon: largestSize ? `./icon-${largestSize}.png` : undefined,
              userInterfaceStyle: "light",
              splash: {
                  image: largestSize ? `./icon-${largestSize}.png` : undefined,
                  resizeMode: "contain",
                  backgroundColor: project.appBackgroundColor || "#ffffff"
              },
              ios: {
                  supportsTablet: true,
                  bundleIdentifier: `com.example.${project.shortName?.toLowerCase().replace(/\s+/g, '') || 'app'}`
              },
              android: {
                  adaptiveIcon: {
                      foregroundImage: largestSize ? `./icon-${largestSize}.png` : undefined,
                      backgroundColor: project.appBackgroundColor || "#ffffff"
                  },
                  package: `com.example.${project.shortName?.toLowerCase().replace(/\s+/g, '') || 'app'}`
              },
              web: {
                  favicon: sortedSizes.includes(32) ? "./icon-32.png" : undefined
              },
              description: project.description || ''
          }
      };
      zip.file('app.json', JSON.stringify(appJson, null, 2));


      // Generate PNGs
      const promises = selectedSizes.map(async (size) => {
          return new Promise<void>((resolve) => {
              const img = new Image();
              const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
              const url = URL.createObjectURL(svgBlob);

              img.onload = () => {
                  const canvas = document.createElement('canvas');
                  canvas.width = size;
                  canvas.height = size;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                      // Apply border radius and background
                      const radius = (project.borderRadius || 0) * (size / 512); // Scale radius relative to 512px canvas

                      ctx.beginPath();
                      ctx.moveTo(radius, 0);
                      ctx.lineTo(size - radius, 0);
                      ctx.quadraticCurveTo(size, 0, size, radius);
                      ctx.lineTo(size, size - radius);
                      ctx.quadraticCurveTo(size, size, size - radius, size);
                      ctx.lineTo(radius, size);
                      ctx.quadraticCurveTo(0, size, 0, size - radius);
                      ctx.lineTo(0, radius);
                      ctx.quadraticCurveTo(0, 0, radius, 0);
                      ctx.closePath();

                      ctx.clip();

                      if (project.backgroundColor) {
                          ctx.fillStyle = project.backgroundColor;
                          ctx.fill();
                      }

                      // Apply transformations
                      ctx.save();
                      const scaleFactor = size / 512;

                      // Move to center
                      ctx.translate(size / 2, size / 2);

                      // Apply user position (scaled)
                      const logoX = project.logoX || 0;
                      const logoY = project.logoY || 0;
                      ctx.translate(logoX * scaleFactor, logoY * scaleFactor);

                      // Apply user scale
                      const logoScale = project.logoScale || 1;
                      ctx.scale(logoScale, logoScale);

                      // Draw image centered relative to the new origin
                      ctx.drawImage(img, -size / 2, -size / 2, size, size);

                      ctx.restore();

                      canvas.toBlob((blob) => {
                          if (blob) zip.file(`icon-${size}.png`, blob);
                          URL.revokeObjectURL(url);
                          resolve();
                      });
                  } else {
                      resolve();
                  }
              };
              img.src = url;
          });
      });

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
         {/* Top Bar for Mode Switching */}
         <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-full p-1 shadow-sm flex items-center">
            <button
                onClick={() => setActiveTab('edit')}
                className={`flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === 'edit' ? 'bg-zinc-100 dark:bg-zinc-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
            >
                <Layout className="w-4 h-4 mr-2" />
                Edit
            </button>
            <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === 'preview' ? 'bg-zinc-100 dark:bg-zinc-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
            >
                <Eye className="w-4 h-4 mr-2" />
                Preview
            </button>
         </div>

         {/* Edit Mode Canvas */}
         <div className={`flex-1 relative bg-zinc-50 dark:bg-zinc-950 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] overflow-hidden cursor-move ${activeTab === 'edit' ? 'block' : 'hidden'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
         >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Canvas Background & Logo */}
                <div
                   className="absolute w-[512px] h-[512px] overflow-hidden shadow-2xl"
                   style={{
                       backgroundColor: project.backgroundColor || 'transparent',
                       borderRadius: project.borderRadius ? `${project.borderRadius}px` : '0'
                   }}
                >
                     <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            transformOrigin: 'center',
                            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                        }}
                     >
                          <div className="w-[512px] h-[512px]" dangerouslySetInnerHTML={{ __html: getProcessedSvg() }} />
                     </div>
                </div>

                {/* Guides Overlay */}
                {showGuide && (
                  <div className="absolute w-[512px] h-[512px] border border-zinc-300 dark:border-zinc-700 z-20 opacity-40 pointer-events-none">
                    {/* 4x4 Grid */}
                    <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className="border border-zinc-200/50 dark:border-zinc-700/50"></div>
                      ))}
                    </div>
                    {/* Rule of Thirds */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="border border-blue-500/10 dark:border-blue-400/10"></div>
                      ))}
                    </div>
                    {/* Diagonals */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 512 512">
                         <line x1="0" y1="0" x2="512" y2="512" stroke="currentColor" className="text-zinc-400 dark:text-zinc-600" />
                         <line x1="512" y1="0" x2="0" y2="512" stroke="currentColor" className="text-zinc-400 dark:text-zinc-600" />
                    </svg>
                    {/* Center Cross */}
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-blue-500/50"></div>
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-500/50"></div>
                    {/* Safe Area Circle */}
                    <div className="absolute inset-8 rounded-full border border-dashed border-zinc-400/50"></div>
                    {/* Inner Safe Area (Square) */}
                    <div className="absolute inset-16 border border-dashed border-zinc-400/30"></div>
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
             />
         </div>
      </main>

      {/* Right Sidebar - Configuration */}
      <ResizablePanel side="right" defaultWidth={320} minWidth={280} maxWidth={400} storageKey="editor-sidebar" className="z-10 !h-1/2 md:!h-full !w-full md:!w-auto border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
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

            <div className="p-6 flex-1 space-y-8 overflow-y-auto">
             {/* Logo Style */}
             <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Logo Style</h3>
                <div className="space-y-4">
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
             </div>

             {/* PWA / Manifest Settings */}
             <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">PWA & Manifest</h3>
                <div className="space-y-4">
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
             </div>
            {/* Colors */}
            <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{t('editor.recolor')}</h3>
                <div className="space-y-3">
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
            </div>

            {/* Actions */}
            <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{t('editor.actions')}</h3>
                <div className="space-y-3">
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
