import purs from 'rollup-plugin-purs'

export default {
  input: './src/Main.purs',
  output: {
    sourceMap: true,
    file: 'bundle.js',
    format: 'iife'
  },
  plugins: [
    purs({
      optimizations: {
        uncurry: true,
        inline: true,
        removeDeadCode: false,
        assumePureVars: true
      }
    })
  ]
}
