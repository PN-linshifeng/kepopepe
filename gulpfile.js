var gulp = require('gulp');
const { src, dest, watch, series, parallel } = require('gulp');
var browserSync = require('browser-sync').create();
var ssi = require('browsersync-ssi');
var reload = browserSync.reload;
var rubySass = require('gulp-ruby-sass');
var sourcemaps = require('gulp-sourcemaps'); // 来源地图
// var node        = require('node-sass');
// var nodeSass    = require('gulp-sass');
var cleanCss = require('gulp-minify-css'); //css压缩
// var spriter = require('gulp-css-spriter'); //雪碧图
// var imagemin = require('gulp-imagemin');
// var pngquant = require('imagemin-pngquant');
// var imageminMozjpeg = require('imagemin-mozjpeg');
// var autoprefix = require('gulp-autoprefixer'); //浏览器商家前缀
var rev = require('gulp-rev-dxb');
var revCollector = require('gulp-rev-collector-dxb');
var cdn = require('gulp-cdn');
var del = require('del');
var minifyHTML = require('gulp-minify-html');
var tap = require('gulp-tap');
var babel = require('gulp-babel');
var { createProxyMiddleware } = require('http-proxy-middleware');

var webUrl = '.';
var scssUrl = '*';

function cssLoad() {
  console.log(98);
  return src(webUrl + '/**/*.css').pipe(
    browserSync.stream({
      match: '**/*.css',
    })
  );
}
var jsonPlaceholderProxy = createProxyMiddleware('/api', {
  // target: 'http://10.44.60.156',
  target: 'http://47.108.105.243:9003',
  changeOrigin: true, // for vhosted sites, changes host header to match to target's host
  pathRewrite: {
    '^/api': '',
  },
  logLevel: 'debug',
});

/**
 * 开发环境启动
 */
function serve() {
  browserSync.init({
    server: {
      baseDir: './',
      middleware: [
        ssi({
          baseDir: './',
          ext: ['.html'],
        }),
        jsonPlaceholderProxy,
      ],
    },
    port: 1110,
  });

  watch(webUrl + '/**/*.html').on('change', reload);
  // watch(webUrl + '/**/*.js').on('change', reload);
  watch(webUrl + '/**/*.css', series(cssLoad));
  watch('css/' + scssUrl + '.scss', series(scss));
  watch(webUrl + '/**/*.js').on('change', reload);
}

function scss() {
  var src = 'css/**/+(sprite)*.scss';
  var filter = 'css/**/!(sprite)*.scss';
  var src = 'css/*.scss';
  return rubySass([src], {
    sourcemap: true,
  })
    .pipe(
      cleanCss({
        compatibility: 'ie7',
      })
    ) //压缩
    .pipe(
      sourcemaps.write('./', {
        //路径相对 gulp.dest
        includeContent: false,
        sourceRoot: '../css/', //gulp.dest sourcemaps
      })
    )
    .pipe(dest(webUrl + '/css'))
    .pipe(
      browserSync.stream({
        match: '**/*.css',
      })
    );
}

function js() {
  return src(webUrl + '/**/*.js')
    .pipe(rev())
    .pipe(dest('dist/' + webUrl))
    .pipe(rev.manifest())
    .pipe(dest('rev/js'));
}

function images() {
  return src(webUrl + '/**/*.{png,jpg,svg,gif}')
    .pipe(rev())
    .pipe(dest('dist/' + webUrl))
    .pipe(rev.manifest())
    .pipe(dest('rev/images'));
}
function css() {
  var v = +new Date();
  v = v.toString().substr(10);
  return src(webUrl + '/**/*.css')
    .pipe(
      // css背景图片路径替换
      tap((file) => {
        file.contents = Buffer.from(file.contents.toString().replace(/\.\.\/\.\.\/\.\./g, '/public/website/theme'));
        file.contents = Buffer.from(file.contents.toString().replace(/(png|jpg|gif)(?!\?)/g, '$1?v' + v));
      })
    ) // 替换售后模块中图片的引用路径
    .pipe(cleanCss())
    .pipe(rev())
    .pipe(dest('dist/' + webUrl))
    .pipe(rev.manifest())
    .pipe(dest('rev/css'));
}
function html() {
  return src(['rev/**/*.json', webUrl + '/**/*.html'])
    .pipe(revCollector())
    .pipe(
      cdn([
        {
          domain: '"css',
          cdn: '"/public/website/theme/css',
        },
        {
          domain: 'images/',
          cdn: '/public/website/theme/images/',
        },
        {
          domain: '"js',
          cdn: '"/public/website/theme/js',
        },
      ])
    )
    .pipe(
      minifyHTML({
        empty: true,
        spare: true,
      })
    )
    .pipe(dest('dist/' + webUrl));
}

async function clean(cb) {
  await del(['dist/' + webUrl, 'rev']);
  cb();
}

function es6() {
  return gulp
    .src(webUrl + '/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest(webUrl + '/dist'));
}

exports.default = js;
exports.images = images;
exports.css = css;
exports.clean = clean;
exports.html = html;
exports.scss = scss;
exports.es6 = es6;
exports.serve = series(serve, scss);
exports.build = series(clean, series(css, images, js, parallel(html)));
