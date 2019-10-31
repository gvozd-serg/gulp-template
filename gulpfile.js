'use strict';
let gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    csso = require('gulp-csso'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    del = require('del'),
    cache = require('gulp-cache'),
    browserSync = require("browser-sync"),
    autoprefixer = require('gulp-autoprefixer'),
    iconfont = require('gulp-iconfont'),
    notify = require("gulp-notify"),
    gutil = require('gulp-util'),
    ftp = require('vinyl-ftp'),
    iconfontCss = require('gulp-iconfont-css');

gulp.task('deploy', function () {
  // host, user и password, тут всё как в FileZilla Client.
  var conn = ftp.create({
    host: '',
    user: '',
    password: '',
    parallel: 10,
    log: gutil.log
  });

  var globs = [
    'dist/**',
    'dist/.htaccess',
  ];
  return gulp.src(globs, {buffer: false})
      .pipe(conn.dest('/public_html/'));
});


gulp.task('browserSync', function () {
  browserSync({
    server: {
      baseDir: "./src/"
    },
    port: 8080,
    open: true,
    notify: true,
  });
});

gulp.task('scripts', function () {
  return gulp.src([
    'node_modules/jquery/dist/jquery.min.js'
    // 'node_modules/magnific-popup/dist/jquery.magnific-popup.min.js',
    // 'node_modules/slick-carousel/slick/slick.min.js',
  ])
      .pipe(concat('libs.min.js'))
      .pipe(gulp.dest('src/js'))
      .pipe(browserSync.reload({stream: true}));
});

let fontName = 'Icons';
gulp.task('icon', function () {
  gulp.src(['src/icons/*.svg'])
      .pipe(iconfontCss({
        fontName: fontName,
        path: '',
        targetPath: '../icons/_icons.scss',
        fontPath: '../fonts/icons/'
      }))
      .pipe(iconfont({
        fontName: fontName,
        prependUnicode: true,
        formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'],
        normalize: true,
        fontHeight: 1001
      }))
      .pipe(gulp.dest('src/fonts/icons/'));
});

gulp.task('sass', function () {
  return gulp.src('src/scss/**/*.+(scss|sass)')
      .pipe(sourcemaps.init())
      .pipe(sass({outputStyle: 'compressed'}).on('error', notify.onError()))
      .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('src/css'))
      .pipe(browserSync.reload({stream: true}));
});

gulp.task('css-libs', ['sass'], function () {
  return gulp.src('src/css/libs.css')
      .pipe(csso())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('src/css'));
});

gulp.task('watch', ['browserSync', 'css-libs', 'scripts'], function () {
  gulp.watch('src/scss/**/*.+(scss|sass)', ['sass']);
  gulp.watch('src/*.html', browserSync.reload);
  gulp.watch('src/js/**/*.js', browserSync.reload);
});

gulp.task('clean', function () {
  return del.sync('dist');
});

gulp.task('build', ['clean', 'sass', 'scripts'], function () {

  let buildCss = gulp.src([
    'src/css/all.css',
    'src/css/libs.min.css'
  ])
      .pipe(csso())
      .pipe(gulp.dest('dist/css'));

  let buildFonts = gulp.src('src/fonts/**/*')
      .pipe(gulp.dest('dist/fonts'));

  let buildIconFonts = gulp.src('src/icons/**/*')
      .pipe(gulp.dest('dist/icons'));

  let buildImg = gulp.src('src/img/**/*')
      .pipe(gulp.dest('dist/img'));

  let buildJs = gulp.src('src/js/**/*')
      .pipe(gulp.dest('dist/js'));

  let buildHtml = gulp.src('src/*.html')
      .pipe(gulp.dest('dist'));

  let buildPhp = gulp.src('src/*.php')
      .pipe(gulp.dest('dist'));
});

gulp.task('clear', function () {
  return cache.clearAll();
});

gulp.task('default', ['watch']);
