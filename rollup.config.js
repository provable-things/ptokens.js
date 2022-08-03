import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import babel from '@rollup/plugin-babel'
import autoExternal from 'rollup-plugin-auto-external'
import cleanup from 'rollup-plugin-cleanup'
import dts from 'rollup-plugin-dts'
import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs';

const PACKAGE_ROOT_PATH = process.cwd()
const PACKAGE_NAME = PACKAGE_ROOT_PATH.split('/').at(-1)

const extensions = [
  '.ts', '.tsx',
];

export default [
  {
    input: `${PACKAGE_ROOT_PATH}/src/index.ts`,
    external: [/@babel\/runtime/],
    output: [{
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
      // Allows node_modules resolution
      resolve({ extensions }),
      json(),
      // Compile TypeScript/JavaScript files
      babel({
        extensions,
        include: ['src/**/*'],
        babelHelpers: 'runtime',
        presets: [
          "@babel/env",
          "@babel/typescript"
        ],
        plugins: [
          '@babel/plugin-proposal-export-default-from',
          '@babel/plugin-proposal-export-namespace-from',
          ['@babel/plugin-transform-runtime', {
            'helpers': true,
            'regenerator': true
          }]
        ]
      }),
      autoExternal()
    ],
  },
  // types generation
  {
    input: 'src/index.ts',
    output: {
      dir: `${PACKAGE_ROOT_PATH}/types`,
      format: 'es'
    },
    plugins: [
      commonjs(),
      resolve(),
      json(),
      typescript({ tsconfig: './tsconfig.json' }),
      autoExternal(),
    ]
  },
  // bundle types files
  {
    input: './types/index.d.ts',
    output: [{
      file: 'dist/index.d.ts',
      format: 'es'
    }],
    plugins: [
      dts(),
    ],
  }
] 