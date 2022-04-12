import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import babel from '@rollup/plugin-babel'
import { string } from 'rollup-plugin-string'
import { terser } from 'rollup-plugin-terser'

const production = !process.env.ROLLUP_WATCH

const PACKAGE_ROOT_PATH = process.cwd()
const PACKAGE_NAME = PACKAGE_ROOT_PATH.split('/').at(-1)

export default {
  input: `${PACKAGE_ROOT_PATH}/src/index.ts`,
  external: [/@babel\/runtime/],
  output: [
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs'
    },
    {
      file: 'dist/bundle.esm.js',
      format: 'esm'
    },
    {
      name: PACKAGE_NAME,
      file: 'dist/bundle.umd.js',
      format: 'umd'
    }
  ],
  plugins: [
    resolve(),
    typescript({
      tsconfig: `${PACKAGE_ROOT_PATH}/tsconfig.json`
    }),
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'runtime',
      rootMode: 'upward'
    }),
    string({
      include: '**/*.html'
    }),
    production && terser()
  ]
}