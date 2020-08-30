const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    mode: 'development',
    entry: {
      js: './src/index.js',
      // style: './src/css/style.css'
    },
    watch: true,
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'main.js'
    }
    , devServer: {
        contentBase: path.resolve(__dirname, 'public')
    }
    , module: {
        rules: [
          {
            test: /\.vue$/, // ファイルが.vueで終われば...
            loader: 'vue-loader' // vue-loaderを使う
          },
          {
            test: /\.js$/,
            loader: 'babel-loader',
          },
          {
            test: /\.css$/,
            use: ['vue-style-loader', 'css-loader'] // css-loader -> vue-style-loaderの順で通していく
          }
        ]
    },
    resolve: {
    extensions: ['.js', '.vue', '.scss'],
    alias: {
        // vue-template-compilerに読ませてコンパイルするために必要
        vue$: 'vue/dist/vue.esm.js',
    },
    },
    plugins: [
      new VueLoaderPlugin(),
      new MiniCssExtractPlugin({
        filename: 'style.css',
        ignoreOrder: true,
      })
    ]
}