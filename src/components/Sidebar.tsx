import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Grid, PenTool, Plus } from 'lucide-react';
import React from 'react';
import { LanguageSelector } from './ui/LanguageSelector';
import { ThemeToggle } from './ui/ThemeToggle';
import { ui, defaultLang } from '@/i18n/ui';
import { useToast } from './ui/Toast';
import { ResizablePanel } from './ui/ResizablePanel';

interface SidebarProps {
  lang: string;
}

export default function Sidebar({ lang }: SidebarProps) {
  const projects = useLiveQuery(() => db.projects.toArray());
  const { addToast } = useToast();

  const t = (key: string) => {
    // @ts-ignore
    return ui[lang]?.[key] || ui[defaultLang]?.[key] || key;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/svg+xml') {
      addToast(t('alert.upload_svg'), 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      try {
        const id = await db.projects.add({
          name: file.name.replace('.svg', ''),
          svgContent: content,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        window.location.href = `/${lang}/editor?id=${id}`;
      } catch (error) {
        console.error('Failed to save project:', error);
        addToast(t('alert.save_error'), 'error');
      }
    };
    reader.readAsText(file);
  };

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const currentId = searchParams.get('id');

  return (
    <ResizablePanel
      side="left"
      defaultWidth={256}
      minWidth={200}
      maxWidth={320}
      storageKey="main-sidebar"
      className="z-20 h-auto md:h-full w-full bg-white dark:bg-zinc-900 border-b md:border-b-0"
    >
       {/* Header */}
       <div className="h-16 px-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center shrink-0">
         <div className="flex items-center space-x-3 overflow-hidden">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
               <PenTool className="w-5 h-5" />
             </div>
             <h1 className="font-bold text-lg tracking-tight whitespace-nowrap overflow-hidden">Logo Studio</h1>
         </div>
       </div>

       {/* Project List */}
       <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{t('sidebar.library')}</h3>
                <label className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" title={t('sidebar.new_project')}>
                    <Plus className="w-4 h-4" />
                    <input type="file" accept=".svg" className="hidden" onChange={handleFileUpload} />
                </label>
            </div>


             {/* Dynamic Project List */}
            <div className="mt-4 space-y-1">
                {projects?.map(project => (
                    <a
                        key={project.id}
                        href={`/${lang}/editor?id=${project.id}`}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group ${currentId === String(project.id) ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <div className="w-4 h-4 mr-3 shrink-0 rounded overflow-hidden flex items-center justify-center bg-white dark:bg-black/20 border border-zinc-200 dark:border-zinc-700">
                             <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: project.svgContent }} />
                        </div>
                        <span className="truncate">{project.name}</span>
                    </a>
                ))}
            </div>
          </div>
       </div>

       {/* Footer */}
       <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
          <ThemeToggle />
          <LanguageSelector currentLang={lang} />
       </div>
    </ResizablePanel>
  );
}
