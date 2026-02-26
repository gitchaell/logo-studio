import { db, type Project } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { FilePlus, Trash2, Edit2, Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { ui, defaultLang } from '@/i18n/ui';
import { useToast } from '../ui/Toast';
import { Modal } from '../ui/Modal';

interface GalleryProps {
    lang: string;
}

export default function Gallery({ lang }: GalleryProps) {
  const projects = useLiveQuery<Project[]>(() => db.projects.toArray());
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useToast();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);

  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState('');

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

  const confirmDelete = (id: number) => {
    setProjectToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (projectToDelete) {
      await db.projects.delete(projectToDelete);
      addToast('Project deleted', 'success');
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const startRename = (project: Project) => {
    setProjectToRename(project);
    setNewProjectName(project.name);
    setRenameModalOpen(true);
  };

  const handleRename = async () => {
    if (projectToRename && newProjectName && newProjectName !== projectToRename.name) {
      await db.projects.update(projectToRename.id!, { name: newProjectName, updatedAt: new Date() });
      addToast('Project renamed', 'success');
    }
    setRenameModalOpen(false);
    setProjectToRename(null);
  };

  const filteredProjects = projects?.filter((p: Project) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-8 h-16 flex items-center justify-between shrink-0 sticky top-0 z-10 pr-32">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Gallery</h2>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('gallery.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 w-64 shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
          <label className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm transition-all font-medium text-sm cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>{t('gallery.create_new')}</span>
            <input type="file" accept=".svg" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {!projects ? (
            <div className="text-center py-20 text-slate-500">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                <FilePlus className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">{t('gallery.no_projects')}</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6">{t('gallery.upload_prompt')}</p>
              <label className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-all font-medium cursor-pointer">
                <Plus className="w-5 h-5" />
                <span>{t('gallery.create_new')}</span>
                <input type="file" accept=".svg" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Project Cards */}
              {filteredProjects?.map((project) => (
                <div key={project.id} className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
                  {/* Preview Area */}
                  <a href={`editor?id=${project.id}`} className="aspect-video bg-zinc-50 dark:bg-black/40 flex items-center justify-center p-8 border-b border-zinc-200 dark:border-zinc-800 group-hover:bg-zinc-100 dark:group-hover:bg-black/60 transition-colors cursor-pointer relative overflow-hidden">
                    <div
                      className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                      dangerouslySetInnerHTML={{ __html: project.svgContent }}
                    />
                  </a>

                  {/* Details */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <a href={`editor?id=${project.id}`} className="flex-1 min-w-0 cursor-pointer">
                        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {project.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {t('gallery.edited')} {new Date(project.updatedAt).toLocaleDateString()}
                        </p>
                      </a>

                      {/* Actions */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => startRename(project)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title={t('gallery.rename')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(project.id!)}
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title={t('gallery.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New Card */}
              <label className="group flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all cursor-pointer min-h-[280px]">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-blue-500">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t('gallery.create_new')}</h3>
                <p className="text-xs text-slate-500 mt-1 text-center max-w-[150px]">{t('gallery.upload_prompt')}</p>
                <input type="file" accept=".svg" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          )}
        </div>
      </main>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={t('alert.confirm_delete_title')}
        footer={
          <>
            <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 text-sm font-medium">
              {t('alert.cancel')}
            </button>
            <button onClick={handleDelete} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-medium">
              {t('gallery.delete')}
            </button>
          </>
        }
      >
        <p>{t('alert.delete_confirm')}</p>
      </Modal>

      {/* Rename Modal */}
      <Modal
        isOpen={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        title={t('alert.rename_title')}
        footer={
          <>
            <button onClick={() => setRenameModalOpen(false)} className="px-4 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300 text-sm font-medium">
              {t('alert.cancel')}
            </button>
            <button onClick={handleRename} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">
              {t('alert.confirm')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
            <p>{t('alert.rename_prompt')}</p>
            <input
                type="text"
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') handleRename(); }}
            />
        </div>
      </Modal>
    </div>
  );
}
