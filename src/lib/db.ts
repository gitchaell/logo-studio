import Dexie, { type Table } from 'dexie';

export interface Project {
  id?: number;
  name: string;
  svgContent: string;
  colors?: Record<string, string>;

  // PWA / Manifest
  shortName?: string;
  description?: string;
  themeColor?: string;
  appBackgroundColor?: string;
  displayMode?: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation?: 'any' | 'natural' | 'landscape' | 'portrait';
  startUrl?: string;

  // Style
  borderRadius?: number;
  backgroundColor?: string;
  logoScale?: number;
  logoX?: number;
  logoY?: number;

  // Exports
  selectedSizes?: number[];
  selectedExtraAssets?: string[];

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
