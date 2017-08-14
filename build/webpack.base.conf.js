const path = require('path')
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')
const vuxLoader = require('vux-loader')

const webpackConfig = {
  entry: {
    app: './src/main.js'
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production' ? config.build.assetsPublicPath : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': getVue(),
      '@': resolve('src'),
      '$rootPath': config.build.rootTag
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 8192,
          name: '[name].[ext]?v=[hash:7]',
          publicPath: process.env.NODE_ENV === 'production' ? config.build.assetsPublicPath : config.dev.assetsPublicPath,  //替换CSS引用的图片路径 可以替换成爱拍云上的路径
          outputPath: utils.assetsPath('img/')        //生成之后存放的路径
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 8192,
          name: '[name].[ext]?v=[hash:7]',
          publicPath: process.env.NODE_ENV === 'production' ? config.build.assetsPublicPath : config.dev.assetsPublicPath,  //替换CSS引用的图片路径 可以替换成爱拍云上的路径
          outputPath: utils.assetsPath('fonts/')        //生成之后存放的路径
        }
      },
      {
        test: /\.ico$/,
        loader: 'url-loader',
        options: {
          limit: 8192,
          name: '[name].[ext]?v=[hash:7]',
          publicPath: process.env.NODE_ENV === 'production' ? config.build.assetsPublicPath : config.dev.assetsPublicPath,  //替换CSS引用的图片路径 可以替换成爱拍云上的路径
          outputPath: utils.assetsPath('')        //生成之后存放的路径
        }
      }
    ]
  }
}

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

function getVue() {
  // return process.env.NODE_ENV === 'production' ? 'vue/dist/vue.runtime.common.js' : 'vue/dist/vue.esm.js'
  return 'vue/dist/vue.esm.js'
}

module.exports = vuxLoader.merge(webpackConfig, {
  plugins: [
    'vux-ui',
    {
      name: 'less-theme',
      path: 'src/vux-config-style.less'
    }, {
      name: 'duplicate-style',
      events: {
        done () {
          console.log('duplicate-style done!')
        }
      }
    },]
})
