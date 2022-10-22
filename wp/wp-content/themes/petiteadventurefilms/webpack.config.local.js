const path = require('path')
const webpack = require('webpack')
require('dotenv').config({ path: __dirname + '/.env_local' })

const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const environment = process.env.NODE_ENV || 'dev';

module.exports = 
{
    mode: 'development'
    , entry:
    {
        // index: './src/js/index.js',
          pafshop: './src/js/pages/pafshop.js'
        , events: './src/js/pages/events.js'
        // style: './src/js/css/style.css'
    }
    , watch: true
    , output:
    {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js'
    }
    , devServer:
    {
        contentBase: path.resolve(__dirname, 'public')
    }
    , module:
    {
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
    }
    , resolve:
    {
        extensions: ['.js', '.vue', '.scss'],
        alias:
        {
            // vue-template-compilerに読ませてコンパイルするために必要
              vue$      : 'vue/dist/vue.esm.js'
            , config$   : path.resolve(__dirname, `./src/js/config/${environment}.js`)
            , VUE : path.resolve(__dirname, './src/vue/')
            , JS : path.resolve(__dirname, './src/js/')
        },
    }
    , plugins: [
        new VueLoaderPlugin()
        , new MiniCssExtractPlugin({
            filename: 'style.css',
            ignoreOrder: true,
        })
        , new webpack.DefinePlugin({
            'process.env': {
                  STRIPE_PUBLIC_KEY : JSON.stringify(process.env.STRIPE_PUBLIC_KEY)
                , STRIPE_SECRET_KEY : JSON.stringify(process.env.STRIPE_SECRET_KEY)
                , SITE_URL          : JSON.stringify(process.env.SITE_URL)
                , CONTACT_URL       : JSON.stringify(process.env.CONTACT_URL)
                , TEMPLATE_URL      : JSON.stringify(process.env.TEMPLATE_URL)
                , RECAPTCHA_SITE_KEY: JSON.stringify(process.env.RECAPTCHA_SITE_KEY)
            }
        })
    ]
    , devServer: {
        proxy: {
          '/create.php': {
            target: 'http://localhost:8081/create.php',
          }
        }
      }
}
