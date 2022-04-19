import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import babel from '@rollup/plugin-babel'
import autoExternal from 'rollup-plugin-auto-external'
import cleanup from 'rollup-plugin-cleanup'

const production = !process.env.ROLLUP_WATCH

const PACKAGE_ROOT_PATH = process.cwd()
const PACKAGE_NAME = PACKAGE_ROOT_PATH.split('/').at(-1)

export default {
  input: `${PACKAGE_ROOT_PATH}/src/index.ts`,
  external: [/@babel\/runtime/],
  output: [
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',
    },
    {
      file: 'dist/bundle.esm.js',
      format: 'esm',
    },
    {
      name: PACKAGE_NAME,
      file: 'dist/bundle.umd.js',
      format: 'umd',
    },
  ],
  plugins: [
    resolve(),
    typescript({
      tsconfig: `${PACKAGE_ROOT_PATH}/tsconfig.json`,
    }),
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      babelHelpers: 'runtime',
      presets: [
        [
          '@babel/env',
          {
            modules: false,
            targets: {
              node: 'current',
              browsers: 'last 2 versions',
            },
          },
        ],
      ],
      plugins: [
        '@babel/plugin-proposal-export-default-from',
        '@babel/plugin-proposal-export-namespace-from',
        [
          '@babel/plugin-transform-runtime',
          {
            helpers: true,
            regenerator: true,
          },
        ],
      ],
    }),
    autoExternal(),
    cleanup(),
  ],
}
