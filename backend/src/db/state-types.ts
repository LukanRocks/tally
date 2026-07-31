/**
 * Shared state vocabulary, deliberately free of imports.
 *
 * `db/state.ts` cannot be imported when configuration resolution failed — it
 * pulls in `db/index.ts`, which opens a driver connection at module load. The
 * degraded server needs the type without that dependency, so it lives here.
 */
export type DatabaseState = 'READY' | 'PENDING_IMPORT' | 'MISCONFIGURED'
