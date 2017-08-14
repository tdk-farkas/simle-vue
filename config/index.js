// see http://vuejs-templates.github.io/webpack for documentation.
const path = require('path')
let pubPath = ''
let dir = ''
let tag = ''

if (process.argv[2] === 'tomcat') {//专门针对 tomcat 的目录配置
  let tomcat = require('./tomcat.js')
  dir = tomcat.dir
  pubPath = path.resolve(tomcat.path, dir.substring(1, dir.length))
  tag = resolve('config/tomcat.js')
} else {
  let def = require('./default.js')
  dir = def.dir
  pubPath = def.path
  tag = resolve('config/default.js')
}

console.log(process.argv[2])

module.exports = {
  build: {
    rootTag: tag,
    env: require('./prod.env'),
    index: path.resolve(pubPath, 'index.html'),
    assetsRoot: pubPath,
    assetsSubDirectory: '',
    assetsPublicPath: dir + '/',
    productionSourceMap: true,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  },
  dev: {
    local: '192.168.1.88',
    port: '8080',
    env: require('./dev.env'),
    autoOpenBrowser: true,
    assetsSubDirectory: 'static',
    assetsPublicPath: dir + '/',
    proxyTable: {
      '/xtTicket': {
        target: 'http://192.168.1.10:8080',
        changeOrigin: true,
        pathRewrite: {
          '^/xtTicket': '/xtTicket'
        }
      }
    },
    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false
  }
}

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}
