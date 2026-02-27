import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, ChevronDown, Download, Eye, Layout, Minus, Plus, RefreshCw, Save, Upload, Ban } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ui, defaultLang } from '@/i18n/ui';
import { useToast } from './ui/Toast';
import { ResizablePanel } from './ui/ResizablePanel';
import { PreviewGallery } from './previews/PreviewGallery';
import { generateManifest, generateAppJson, generateOpenGraph } from '@/lib/generators';
import { AVAILABLE_SIZES } from '@/lib/constants';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getSvgDimensions, normalizeSvg } from '@/lib/svg-utils';

interface EditorProps {
    lang: string;
}

const svgToPng = (svgString: string, width: number, height: number): Promise<Blob | null> => {
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
                 ctx.drawImage(img, 0, 0, width, height);
                 canvas.toBlob((blob) => {
                     URL.revokeObjectURL(url);
                     resolve(blob);
                 });
             } else {
                 resolve(null);
             }
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(null);
        };
        img.src = url;
    });
};

const fitLogoToCanvas = (width: number, height: number) => {
    // Determine the safe area size.
    // If width/height is huge, we just want to scale it to fit roughly within 400px view if needed
    // But for smaller logos (like 128x128), we might want to start at 100% scale.
    // The previous logic forced fitting to 400px.

    // If the logo is smaller than the default canvas viewport (e.g. 512), maybe just center it at scale 1?
    // Let's stick to centering at 100% scale for better UX as requested.

    return {
        scale: 1,
        x: 0,
        y: 0
    };
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

  // View Controls
  const [viewScale, setViewScale] = useState(1);
  const [viewPosition, setViewPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [colors, setColors] = useState<Record<string, string>>({});
  const [uniqueColors, setUniqueColors] = useState<string[]>([]);
  const [showGuide, setShowGuide] = useLocalStorage('editor-show-guide', true);

  // Use project state for selection, derived in render or useEffect, updated via DB
  // Defaults
  const selectedSizes = project?.selectedSizes || AVAILABLE_SIZES;
  const selectedExtraAssets = new Set(project?.selectedExtraAssets || ['favicon', 'splash', 'manifest', 'appjson', 'opengraph']); // Added defaults

  const [initialized, setInitialized] = useState(false);
  const [logoDimensions, setLogoDimensions] = useState({ width: 512, height: 512 });

  // Resize State
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [initialScale, setInitialScale] = useState(1);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [openSections, setOpenSections] = useLocalStorage<string[]>('editor-open-sections', ['style', 'colors']);

  const toggleSection = (section: string) => {
    setOpenSections((prev: string[]) => prev.includes(section) ? prev.filter((s: string) => s !== section) : [...prev, section]);
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
        // If it looks like a new project (default values), try to fit the logo
        if (project.logoScale === 1 && project.logoX === 0 && project.logoY === 0) {
             const dims = getSvgDimensions(project.svgContent);
             const { scale: fitScale, x, y } = fitLogoToCanvas(dims.width, dims.height);
             setScale(fitScale);
             setPosition({ x, y });
        } else {
             setScale(project.logoScale || 1);
             setPosition({ x: project.logoX || 0, y: project.logoY || 0 });
        }

        if (project.borderRadius === undefined && id) {
             db.projects.update(id, { borderRadius: 12 });
        }

        if (project.colors) {
            setColors(project.colors);
        }
        setInitialized(true);
    }
  }, [project, initialized, id]);

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
    const newViewScale = Math.min(Math.max(0.1, viewScale - e.deltaY * zoomSensitivity), 5);
    setViewScale(newViewScale);
  };

  const [isSpacePressed, setIsSpacePressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
         e.preventDefault(); // Prevent scrolling
         setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTab !== 'edit') return;

    // Middle click or Space+Left Click
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewPosition.x, y: e.clientY - viewPosition.y });
    } else if (e.button === 0) {
      setIsDragging(true);
      // Account for view scale when calculating drag start relative to logo position
      setDragStart({
          x: e.clientX / viewScale - position.x,
          y: e.clientY / viewScale - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
        setViewPosition({
            x: e.clientX - panStart.x,
            y: e.clientY - panStart.y
        });
    } else if (isDragging) {
      setPosition({
        x: e.clientX / viewScale - dragStart.x,
        y: e.clientY / viewScale - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
      setIsPanning(false);
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
    const nextColors = { ...colors, [original]: newColor };
    setColors(nextColors);
    if (project && id) {
        db.projects.update(id, { colors: nextColors });
    }
  };

  const handleSave = async () => {
    if (project && id) {
       // Generate OG Image on save
       let ogImage = undefined;
       try {
           const processedSvg = getProcessedSvg();
           ogImage = await generateOpenGraph({ ...project, colors }, processedSvg);
       } catch (e) {
           console.error("Failed to generate OG image on save", e);
       }

       await db.projects.update(id, {
           svgContent: getProcessedSvg(),
           colors: colors,
           updatedAt: new Date(),
           ...(ogImage ? { ogImage } : {})
       });
       addToast(t('editor.saved'), 'success');
    }
  };

  const handleToggleSize = async (size: number) => {
      if (!project || !id) return;
      const current = project.selectedSizes || AVAILABLE_SIZES;
      const next = current.includes(size)
        ? current.filter(s => s !== size)
        : [...current, size].sort((a, b) => a - b);
      await db.projects.update(id, { selectedSizes: next });
  };

  const handleSelectAllSizes = async () => {
      if (!project || !id) return;
      await db.projects.update(id, {
          selectedSizes: AVAILABLE_SIZES,
          selectedExtraAssets: ['favicon', 'splash', 'manifest', 'appjson', 'opengraph']
      });
  };

  const handleDeselectAllSizes = async () => {
      if (!project || !id) return;
      await db.projects.update(id, {
          selectedSizes: [],
          selectedExtraAssets: []
      });
  };

  const handleToggleExtraAsset = async (asset: string) => {
      if (!project || !id) return;
      const current = new Set(project.selectedExtraAssets || ['favicon', 'splash', 'manifest', 'appjson', 'opengraph']);
      if (current.has(asset)) current.delete(asset);
      else current.add(asset);
      await db.projects.update(id, { selectedExtraAssets: Array.from(current) });
  };

  const handleExport = async () => {
      if (!project) return;
      const zip = new JSZip();
      const svgString = getProcessedSvg();
      const sortedSizes = [...selectedSizes].sort((a, b) => a - b);

      // Add SVG
      zip.file(`${project.name}.svg`, svgString);

      // Manifest.json & App.json (Conditional)
      if (selectedExtraAssets.has('manifest')) {
        const manifest = generateManifest(project, sortedSizes);
        zip.file('manifest.json', JSON.stringify(manifest, null, 2));
      }

      if (selectedExtraAssets.has('appjson')) {
        const appJson = generateAppJson(project, sortedSizes);
        zip.file('app.json', JSON.stringify(appJson, null, 2));
      }

      // Generate PNGs Helper
      const generatePng = (width: number, height: number, scaleFactor: number = 1, isFavicon: boolean = false): Promise<Blob | null> => {
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
                      // Canvas logic for export
                      if (!isFavicon) {
                          // Calculate radius relative to the max dimension of the logo container to maintain visual consistency
                          const maxDim = Math.max(logoDimensions.width, logoDimensions.height);
                          const radius = (project.borderRadius || 0) * (width / maxDim);

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
                      }

                      if (project.backgroundColor) {
                          ctx.fillStyle = project.backgroundColor;
                          ctx.fillRect(0, 0, width, height);
                      }

                      ctx.save();

                      // Move to center of export canvas
                      ctx.translate(width / 2, height / 2);

                      // Apply user position
                      // Position is stored in pixels relative to the logo's intrinsic size
                      // So we need to scale the translation based on the export ratio
                      // If export width is equal to logo width, ratio is 1.
                      // We use max dimension to determine the "canvas" scale relative to the logo

                      const maxDim = Math.max(logoDimensions.width, logoDimensions.height);
                      const exportRatio = width / maxDim;

                      const userLogoX = (project.logoX || 0) * exportRatio;
                      const userLogoY = (project.logoY || 0) * exportRatio;
                      ctx.translate(userLogoX, userLogoY);

                      // Apply user scale
                      // Draw width/height should be the logo's intrinsic size scaled by the export ratio
                      const drawWidth = logoDimensions.width * exportRatio;
                      const drawHeight = logoDimensions.height * exportRatio;

                      const logoScale = (project.logoScale || 1);
                      ctx.scale(logoScale * scaleFactor, logoScale * scaleFactor);

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
      if (selectedExtraAssets.has('splash')) {
          const splashPromise = generatePng(1080, 1920, 0.5).then(blob => {
              if (blob) zip.file('splash.png', blob);
          });
          promises.push(splashPromise);
      }

      // Generate Favicon
      if (selectedExtraAssets.has('favicon')) {
          const faviconPromise = generatePng(32, 32, 1, true).then(blob => {
              if (blob) zip.file('favicon.ico', blob);
          });
          promises.push(faviconPromise);
      }

      // Generate OpenGraph Image
      if (selectedExtraAssets.has('opengraph')) {
          try {
              const ogSvg = await generateOpenGraph(project, svgString);
              if (ogSvg) {
                  zip.file('opengraph-image.svg', ogSvg);
                  const ogPng = await svgToPng(ogSvg, 1200, 630);
                  if (ogPng) {
                      zip.file('opengraph-image.png', ogPng);
                  }
              }
          } catch (e) {
              console.error("OG Generation failed", e);
          }
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

              const normalizedContent = normalizeSvg(content);

              // Detect background color from SVG rects that act as background
              let detectedBg: string | undefined = undefined;
              const parser = new DOMParser();
              const doc = parser.parseFromString(normalizedContent, 'image/svg+xml');
              const firstRect = doc.querySelector('rect');
              if (firstRect) {
                  const width = firstRect.getAttribute('width');
                  const height = firstRect.getAttribute('height');
                  // If it's a 100% or very large rect, it's likely a background
                  if (width === '100%' && height === '100%' || (Number(width) >= 512 && Number(height) >= 512)) {
                      detectedBg = firstRect.getAttribute('fill') || undefined;
                      if (detectedBg === 'none' || detectedBg === 'transparent') {
                          detectedBg = undefined;
                      }
                  }
              }

              // Calculate auto-fit for the new logo
              const dims = getSvgDimensions(normalizedContent);
              const { scale: fitScale, x, y } = fitLogoToCanvas(dims.width, dims.height);

              await db.projects.update(id, {
                  svgContent: normalizedContent,
                  updatedAt: new Date(),
                  logoScale: fitScale,
                  logoX: x,
                  logoY: y,
                  borderRadius: 12,
                  ...(detectedBg ? { backgroundColor: detectedBg } : {})
              });

              setScale(fitScale);
              setPosition({ x, y });

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
         <div className={`flex-1 relative bg-zinc-50 dark:bg-zinc-950 overflow-hidden cursor-grab active:cursor-grabbing ${activeTab === 'edit' ? 'block' : 'hidden'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
         >
            {/* Infinite Grid Background - Moves with Pan/Zoom */}
             <div
                className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"
                style={{
                    transform: `translate(${viewPosition.x}px, ${viewPosition.y}px) scale(${viewScale})`,
                    transformOrigin: '0 0'
                }}
             />

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* View Container - Handles Zoom/Pan of the Work Area */}
                <div
                    style={{
                        transform: `translate(${viewPosition.x}px, ${viewPosition.y}px) scale(${viewScale})`,
                        transformOrigin: 'center',
                        transition: isPanning ? 'none' : 'transform 0.1s ease-out'
                    }}
                >
                    {/* Canvas Background (Artboard) */}
                    <div
                    className="relative border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-center overflow-hidden pointer-events-auto"
                    style={{
                        width: logoDimensions.width,
                        height: logoDimensions.height,
                        backgroundColor: project.backgroundColor || 'transparent',
                        borderRadius: project.borderRadius ? `${project.borderRadius}px` : '0'
                    }}
                    onMouseDown={(e) => {
                        // If not panning, we are interacting with content
                        if (e.button !== 1 && !isSpacePressed) {
                             e.stopPropagation();
                             // Manually trigger handleMouseDown because stopPropagation prevents the parent from hearing it
                             // But we need parent to handle the "logo drag" logic which is currently on the parent container
                             // Actually, let's keep the logic on the parent but prevent "pan" if clicking here?
                             // No, we want to allow dragging logo here.
                             // The parent handler handles both based on button/keys.
                             // So we just let it bubble?
                             // Yes, bubbling is fine.
                             // But we need to make sure we don't start panning if we click on the logo to drag it.
                             // The parent handler checks for button 1 or space.
                             handleMouseDown(e);
                        }
                    }}
                    >
                        {/* Render the LOGO inside the artboard with correct dimensions and transform */}
                            <div
                                style={{
                                    width: logoDimensions.width,
                                    height: logoDimensions.height,
                                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                    transformOrigin: 'center',
                                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                                    flexShrink: 0 // Prevent shrinking
                                }}
                            >
                                <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: getProcessedSvg() }} />
                            </div>
                    </div>

                    {/* Selection Overlay */}
                    {/* Matches the position of the artboard content exactly */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                            style={{
                                width: logoDimensions.width,
                                height: logoDimensions.height,
                                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                transformOrigin: 'center',
                                position: 'relative'
                            }}
                        >
                            {/* Outline */}
                            <div className="absolute inset-0 border border-blue-500 opacity-50 pointer-events-none"></div>

                            {/* Handles */}
                            <div
                                className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-nwse-resize pointer-events-auto shadow-sm"
                                onMouseDown={(e) => handleResizeMouseDown(e, 'tl')}
                                style={{ transform: `scale(${1/scale})` }}
                            />
                            <div
                                className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-nesw-resize pointer-events-auto shadow-sm"
                                onMouseDown={(e) => handleResizeMouseDown(e, 'tr')}
                                style={{ transform: `scale(${1/scale})` }}
                            />
                            <div
                                className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-nesw-resize pointer-events-auto shadow-sm"
                                onMouseDown={(e) => handleResizeMouseDown(e, 'bl')}
                                style={{ transform: `scale(${1/scale})` }}
                            />
                            <div
                                className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-nwse-resize pointer-events-auto shadow-sm"
                                onMouseDown={(e) => handleResizeMouseDown(e, 'br')}
                                style={{ transform: `scale(${1/scale})` }}
                            />
                        </div>
                    </div>

                    {/* Guides Overlay */}
                    {showGuide && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="opacity-60" style={{ width: logoDimensions.width, height: logoDimensions.height }}>
                        <svg
                            width={logoDimensions.width}
                            height={logoDimensions.height}
                            viewBox={`0 0 ${logoDimensions.width} ${logoDimensions.height}`}
                            className="mix-blend-difference stroke-white/50"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* Outer Grid (Lines every ~1/4th) */}
                            <g strokeDasharray="2 4" strokeWidth="0.5" vectorEffect="non-scaling-stroke" opacity="0.5">
                                {/* Verticals */}
                                {[...Array(3)].map((_, i) => (
                                    <line
                                        key={`v-${i}`}
                                        x1={(i + 1) * (logoDimensions.width / 4)}
                                        y1="0"
                                        x2={(i + 1) * (logoDimensions.width / 4)}
                                        y2={logoDimensions.height}
                                    />
                                ))}
                                {/* Horizontals */}
                                {[...Array(3)].map((_, i) => (
                                    <line
                                        key={`h-${i}`}
                                        x1="0"
                                        y1={(i + 1) * (logoDimensions.height / 4)}
                                        x2={logoDimensions.width}
                                        y2={(i + 1) * (logoDimensions.height / 4)}
                                    />
                                ))}
                            </g>

                            {/* Center Cross - Solid */}
                            <g strokeWidth="1" className="stroke-cyan-500" vectorEffect="non-scaling-stroke" opacity="0.6">
                                <line x1={logoDimensions.width / 2} y1="0" x2={logoDimensions.width / 2} y2={logoDimensions.height} />
                                <line x1="0" y1={logoDimensions.height / 2} x2={logoDimensions.width} y2={logoDimensions.height / 2} />
                            </g>

                            {/* Diagonals - Dashed */}
                            <g strokeDasharray="2 4" strokeWidth="0.5" vectorEffect="non-scaling-stroke" opacity="0.4">
                                <line x1="0" y1="0" x2={logoDimensions.width} y2={logoDimensions.height} />
                                <line x1={logoDimensions.width} y1="0" x2="0" y2={logoDimensions.height} />
                            </g>

                            {/* Circular Guides */}
                            <g strokeWidth="0.5" strokeDasharray="2 4" vectorEffect="non-scaling-stroke" opacity="0.5">
                                {/* Outer Circle */}
                                <ellipse cx={logoDimensions.width / 2} cy={logoDimensions.height / 2} rx={logoDimensions.width / 2} ry={logoDimensions.height / 2} />
                                {/* Inner Circle 1 (~85% = 340/400 approx safe zone) */}
                                <ellipse cx={logoDimensions.width / 2} cy={logoDimensions.height / 2} rx={logoDimensions.width * 0.425} ry={logoDimensions.height * 0.425} />
                                {/* Inner Circle 2 (~50%) */}
                                <ellipse cx={logoDimensions.width / 2} cy={logoDimensions.height / 2} rx={logoDimensions.width * 0.25} ry={logoDimensions.height * 0.25} />
                            </g>
                        </svg>
                    </div>
                    </div>
                    )}
                </div>
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg px-4 py-2 flex items-center space-x-4">
                <button onClick={() => setViewScale(s => Math.max(0.1, s - 0.1))} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-slate-600 dark:text-slate-300">
                    <Minus className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono w-12 text-center text-slate-900 dark:text-white">{Math.round(viewScale * 100)}%</span>
                <button onClick={() => setViewScale(s => Math.min(5, s + 0.1))} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-slate-600 dark:text-slate-300">
                    <Plus className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-2"></div>
                <button onClick={() => { setViewScale(1); setViewPosition({x:0,y:0}); }} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-slate-600 dark:text-slate-300" title={t('editor.reset_view')}>
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
                onToggleSize={handleToggleSize}
                onSelectAllSizes={handleSelectAllSizes}
                onDeselectAllSizes={handleDeselectAllSizes}
                scale={scale}
                position={position}

                // Extra Props for new features
                shortName={project.shortName}
                description={project.description}
                themeColor={project.themeColor}

                selectedExtraAssets={selectedExtraAssets}
                onToggleExtraAsset={handleToggleExtraAsset}
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
                                    {/* Transparent Button */}
                                    <button
                                        onClick={() => handleColorChange(color, 'transparent')}
                                        className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-red-500 transition-colors mr-1"
                                        title="Make Transparent"
                                    >
                                        <Ban className="w-3 h-3" />
                                    </button>

                                    <div className={`w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 overflow-hidden cursor-pointer relative ${
                                        (colors[color] === 'transparent' || colors[color] === 'rgba(0,0,0,0)')
                                        ? 'bg-[url(https://upload.wikimedia.org/wikipedia/commons/1/18/Transparent_square_tiles_texture.png)] bg-[length:8px_8px]'
                                        : ''
                                    }`}>
                                        <input
                                            type="color"
                                            value={colors[color] === 'transparent' ? '#ffffff' : (colors[color] || color)}
                                            onChange={(e) => handleColorChange(color, e.target.value)}
                                            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 m-0 border-none opacity-0"
                                        />
                                        {/* Visual indication if not transparent */}
                                        {colors[color] !== 'transparent' && (
                                            <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: colors[color] || color }}></div>
                                        )}
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
                    <span>{t('editor.download_assets')} ({selectedSizes.length + selectedExtraAssets.size})</span>
                </button>
            </div>
        </div>
      </ResizablePanel>
    </div>
  );
}
