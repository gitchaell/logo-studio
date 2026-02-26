import { db, type Project } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { FilePlus, MoreVertical, Trash2, Edit2, Search, Plus } from 'lucide-react';
import { useState } from 'react';

export default function Gallery() {
  const projects = useLiveQuery<Project[]>(() => db.projects.toArray());
  const [searchQuery, setSearchQuery] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/svg+xml') {
      alert('Please upload an SVG file.');
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
        window.location.href = `editor?id=${id}`;
      } catch (error) {
        console.error('Failed to save project:', error);
        alert('Failed to save project.');
      }
    };
    reader.readAsText(file);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await db.projects.delete(id);
    }
  };

  const handleRename = async (project: Project) => {
    const newName = prompt('Enter new project name:', project.name);
    if (newName && newName !== project.name) {
      await db.projects.update(project.id!, { name: newName, updatedAt: new Date() });
    }
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
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 w-64 shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
          <label className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm transition-all font-medium text-sm cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>New Project</span>
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
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">No projects yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6">Upload an SVG to get started.</p>
              <label className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-all font-medium cursor-pointer">
                <Plus className="w-5 h-5" />
                <span>Create New Project</span>
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
                          Edited {new Date(project.updatedAt).toLocaleDateString()}
                        </p>
                      </a>

                      {/* Actions */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleRename(project)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Rename"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(project.id!)}
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Delete"
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
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Create New Project</h3>
                <p className="text-xs text-slate-500 mt-1 text-center max-w-[150px]">Import SVG or start from scratch</p>
                <input type="file" accept=".svg" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
