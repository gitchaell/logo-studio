import Dexie, { type Table } from 'dexie';

export interface Project {
  id?: number;
  name: string;
  svgContent: string;
  createdAt: Date;
  updatedAt: Date;
}

export class LogoStudioDB extends Dexie {
  projects!: Table<Project>;

  constructor() {
    super('LogoStudioDB');
    this.version(1).stores({
      projects: '++id, name, createdAt, updatedAt'
    });
  }
}

export const db = new LogoStudioDB();
