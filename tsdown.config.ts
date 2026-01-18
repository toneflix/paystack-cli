import { defineConfig } from 'tsdown'

export default defineConfig({
    entry: ['src/cli.ts'],
    format: ['esm', 'cjs'],
    outDir: 'bin',
    dts: false,
    sourcemap: false,
    external: [
        'fs',
        'path',
        'os',
        'dotenv'
    ],
    clean: true
}) 