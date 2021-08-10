const path = require('path');
const WorkerPlugin = require('worker-plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  runtimeCompiler: true,
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@core': path.resolve(__dirname, 'di_core'),
        '@chart': path.resolve(__dirname, 'src/shared/components/charts'),
        '@filter': path.resolve(__dirname, 'src/screens/DashboardDetail/components/WidgetContainer/filters')
      }
    },
    output: {
      globalObject: 'this'
    },
    plugins: [
      new WorkerPlugin(),
      new MonacoWebpackPlugin({
        // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
        languages: ['javascript', 'html', 'css']
      })
    ]
  },
  chainWebpack: config => {
    if (process.env.NODE_ENV === 'test') {
      const scssRule = config.module.rule('scss');
      scssRule.uses.clear();
      scssRule.use('null-loader').loader('null-loader');
    }
  }
};
