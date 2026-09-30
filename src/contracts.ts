export type Mode = 'single' | 'pages' | 'groups' | 'cuts';
export interface SelectionPlan {
  /** One-based page numbers, sorted in source order within each output. */
  groups: number[][];
  duplicateCount: number;
  totalPages: number;
}
export interface OutputFile { name: string; buffer: ArrayBuffer; pages: number[] }
export type WorkerRequest =
  | { type: 'load'; id: number; file: File }
  | { type: 'extract'; id: number; mode: Mode; selection: string; baseName: string };
export type WorkerResponse =
  | { type: 'loaded'; id: number; pages: number }
  | { type: 'progress'; id: number; stage: 'loading' | 'extracting' | 'packaging'; current: number; total: number }
  | { type: 'complete'; id: number; files: OutputFile[]; zip: { name: string; buffer: ArrayBuffer } | null }
  | { type: 'error'; id: number; code: string; message: string };
