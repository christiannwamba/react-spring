import path from 'path'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { uglify } from 'rollup-plugin-uglify'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'

const root = process.platform === 'win32' ? path.resolve('/') : '/'
const external = id => !id.startsWith('.') && !id.startsWith(root)

const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  'prop-types': 'PropTypes',
  'react-spring': 'ReactSpring',
}

const getBabelOptions = ({ useESModules }) => ({
  exclude: '**/node_modules/**',
  runtimeHelpers: true,
  plugins: [['@babel/transform-runtime', { regenerator: false, useESModules }]],
})

function createConfig(entry, out, name) {
  return [
    {
      input: `./src/${entry}.js`,
      output: { file: `dist/${out}.js`, format: 'esm' },
      external,
      plugins: [babel(getBabelOptions({ useESModules: true })), sizeSnapshot()],
    },
    {
      input: `./src/${entry}.js`,
      output: { file: `dist/${out}.cjs.js`, format: 'cjs' },
      external,
      plugins: [babel(getBabelOptions({ useESModules: false }))],
    },
    ...(name
      ? [
          {
            input: `./src/${entry}.js`,
            output: {
              file: `dist/${out}.umd.js`,
              format: 'umd',
              name,
              globals,
            },
            external: Object.keys(globals),
            plugins: [
              resolve(),
              babel(getBabelOptions({ useESModules: true })),
              commonjs({ include: '**/node_modules/**' }),
              sizeSnapshot(),
              uglify(),
            ],
          },
        ]
      : []),
  ]
}

export default [
  ...createConfig('targets/web/index', 'hooks'),
  ...createConfig('targets/native/index', 'native'),
  ...createConfig('renderprops/targets/web/index', 'renderprops'),
  ...createConfig(
    'renderprops/addons/index',
    'renderprops-addons',
    'ReactSpringAddons'
  ),
  ...createConfig('renderprops/targets/native/index', 'renderprops-native'),
  ...createConfig(
    'renderprops/targets/universal/index',
    'renderprops-universal'
  ),
  ...createConfig('renderprops/targets/konva/index', 'renderprops-konva'),
]
