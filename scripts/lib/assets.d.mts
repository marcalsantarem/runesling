export interface AssetPaths {
  root: string;
  manifest: string;
  raw: string;
  cut: string;
  out: string;
  preview: string;
  cache: string;
}
export interface ResolvedItem {
  key: string;
  preset: string;
  category: string;
  kind: 'sprite' | 'tile' | 'app';
  atlas: string | null;
  size: number | [number, number];
  circularMask: boolean;
  removeBg: boolean;
  bgColor: string | null;
  raw: string;
  cut: string;
  standaloneIcon: boolean;
}
export interface Logger {
  log(...a: unknown[]): void;
  warn(...a: unknown[]): void;
}
export interface PhaserFrame {
  frame: { x: number; y: number; w: number; h: number };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
}
export interface PhaserAtlas {
  frames: Record<string, PhaserFrame>;
  meta: { app: string; version: string; image: string; format: string; size: { w: number; h: number }; scale: string };
}
export const CUT_VERSION: number;
export const MARGIN: number;
export const EXTRUDE: number;
export const WEBP_QUALITY: number;
export const APP_BG: string;
export function resolvePaths(opts?: Partial<AssetPaths>): AssetPaths;
export function parseColor(c: string | null | undefined): [number, number, number] | null;
export function loadManifest(paths: AssetPaths): { manifest: unknown; items: ResolvedItem[] };
export function ingest(
  inputs: string[],
  paths: AssetPaths,
  log?: Logger,
): Promise<{ ingested: string[]; unknown: string[]; duplicates: string[]; missing: string[] }>;
export function cutBackground(
  input: Buffer | string,
  opts?: { bgColor?: string | null; t0?: number; t1?: number },
): Promise<Buffer>;
export function cutAll(
  paths: AssetPaths,
  opts?: { force?: boolean },
  log?: Logger,
): Promise<{ cut: string[]; copied: string[]; skipped: string[]; missing: string[] }>;
export function normalizeSprite(
  input: Buffer | string,
  size: number,
  opts?: { circularMask?: boolean; margin?: number },
): Promise<Buffer>;
export function packAtlas(
  frames: { key: string; buffer: Buffer }[],
  name: string,
  opts?: { extrude?: number; padding?: number; maxSize?: number },
): Promise<{ image: Buffer; json: PhaserAtlas }>;
export function buildAll(
  paths: AssetPaths,
  log?: Logger,
): Promise<{ written: string[]; missing: string[]; atlases: Record<string, PhaserAtlas> }>;
export function writePreview(
  paths: AssetPaths,
  items: ResolvedItem[],
  atlasJson: Record<string, PhaserAtlas>,
  written: string[],
): void;
export function parseArgs(argv: string[]): Record<string, string | boolean> & { _: string[] };
export function runCli(fn: (opts: Record<string, string | boolean> & { _: string[] }) => Promise<void>): Promise<void>;
