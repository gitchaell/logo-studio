import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Download, Minus, Plus, RefreshCw, Save, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ui, defaultLang } from '@/i18n/ui';
import { useToast } from '../ui/Toast';

interface EditorProps {
    lang: string;
}

export default function Editor({ lang }: EditorProps) {
  const [id, setId] = useState<number | null>(null);
  const project = useLiveQuery(() => (id ? db.projects.get(id) : undefined), [id]);
  const { addToast } = useToast();

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [colors, setColors] = useState<Record<string, string>>({});
  const [uniqueColors, setUniqueColors] = useState<string[]>([]);

  const t = (key: string) => {
    // @ts-ignore
    return ui[lang]?.[key] || ui[defaultLang]?.[key] || key;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    if (idParam) setId(Number(idParam));
  }, []);

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
      // Simple string replacement - robust enough for simple SVGs
      // Use global regex replacing all occurrences
      content = content.replaceAll(`"${original}"`, `"${replacement}"`);
      content = content.replaceAll(`'${original}'`, `'${replacement}'`);
    });
    return content;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSensitivity = 0.001;
    const newScale = Math.min(Math.max(0.1, scale - e.deltaY * zoomSensitivity), 5);
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
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

  const handleMouseUp = () => setIsDragging(false);

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

      // Add SVG
      zip.file(`${project.name}.svg`, svgString);

      // Generate PNGs
      const sizes = [16, 32, 64, 128, 512, 1024];
      const promises = sizes.map(async (size) => {
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
                      ctx.drawImage(img, 0, 0, size, size);
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
              addToast(t('editor.saved'), 'success'); // Reused 'saved' message for upload success? Or specific 'updated'? Saved is fine.
          };
          reader.readAsText(file);
      }
  };

  if (!project) return <div className="flex items-center justify-center h-full text-slate-500">Loading...</div>;

  return (
    <div className="flex h-full bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar - Configuration */}
      <aside className="w-80 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-10 overflow-y-auto shrink-0">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
           <a href={`/${lang}/`} className="flex items-center text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-4">
             <ArrowLeft className="w-4 h-4 mr-1" /> {t('editor.back_to_gallery')}
           </a>
           <div className="space-y-4">
             <div>
               <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">{t('editor.project_name')}</label>
               <input
                 type="text"
                 value={project.name}
                 onChange={(e) => db.projects.update(project.id!, { name: e.target.value })}
                 className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-3 py-2 text-sm text-slate-900 dark:text-white"
               />
             </div>
           </div>
        </div>

        <div className="p-6 flex-1 space-y-8">
           {/* Colors */}
           <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{t('editor.recolor')}</h3>
              <div className="space-y-3">
                 {uniqueColors.map((color, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                       <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded border border-zinc-200 dark:border-zinc-700" style={{ backgroundColor: color }}></div>
                          <span className="text-xs font-mono text-slate-500">{color}</span>
                       </div>
                       <ArrowLeft className="w-3 h-3 text-slate-400 rotate-180" />
                       <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={colors[color] || color}
                            onChange={(e) => handleColorChange(color, e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                          />
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
                    className="w-full flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                 >
                    <span className="text-sm text-slate-700 dark:text-slate-200">{t('editor.save')}</span>
                    <Save className="w-4 h-4 text-slate-500" />
                 </button>
                 <label className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                    <span className="text-sm text-slate-700 dark:text-slate-200">{t('editor.replace_svg')}</span>
                    <Upload className="w-4 h-4 text-slate-500" />
                    <input type="file" accept=".svg" className="hidden" onChange={handleLogoUpload} />
                 </label>
              </div>
           </div>
        </div>

        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/20">
            <button
                onClick={handleExport}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow-sm font-medium transition-colors"
            >
                <Download className="w-4 h-4" />
                <span>{t('editor.download_assets')}</span>
            </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 relative bg-zinc-100 dark:bg-black/50 overflow-hidden cursor-move"
         onMouseDown={handleMouseDown}
         onMouseMove={handleMouseMove}
         onMouseUp={handleMouseUp}
         onMouseLeave={handleMouseUp}
         onWheel={handleWheel}
      >
         <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: 'center',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
         >
             <div
               className="w-[512px] h-[512px] bg-transparent relative"
               dangerouslySetInnerHTML={{ __html: getProcessedSvg() }}
             />
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
         </div>
      </main>
    </div>
  );
}
