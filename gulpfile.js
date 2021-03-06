var gulp = require('gulp'),
    gutil = require('gulp-util'),
    coffee = require('gulp-coffee'),
    browserify = require('gulp-browserify'),
    concat = require('gulp-concat'),
    compass = require('gulp-compass'),
    connect = require('gulp-connect'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    jsonMinify = require('gulp-jsonminify'),
    imagemin = require('gulp-imagemin'),
    pngcrush = require('imagemin-pngcrush');

var env, coffeeSources, jsSources, sassSources, htmlSources, jsonSources, outputDir, sassStyle, imgSources;
var PROD = 'production',
    DEV = 'development';

env = process.env.NODE_ENV || DEV;
gutil.log('Detected Environment : ' + env);

if (env === DEV) {
    outputDir = 'builds/development/';
    sassStyle = 'expanded';
} else {
    outputDir = 'builds/production/';
    sassStyle = 'compressed';
}

coffeeSources = ['components/coffee/tagline.coffee'];
jsSources = [
            'components/scripts/rclick.js',
            'components/scripts/pixgrid.js',
            'components/scripts/tagline.js',
            'components/scripts/template.js'
            ];
sassSources = ['components/sass/style.scss'];
htmlSources = ['builds/development/*.html'];
jsonSources = ['builds/development/js/*.json'];
imgSources = ['builds/development/images/**/*.*'];

gulp.task('coffee', function () {
    gulp.src(coffeeSources)
        .pipe(coffee({
                bare: true
            })
            .on('error', gutil.log)
        )
        .pipe(gulp.dest('components/scripts'));
})

gulp.task('js', function () {
    gulp.src(jsSources)
        .pipe(concat('script.js'))
        .pipe(browserify())
        .pipe(gulpif(env === PROD, uglify()))
        .pipe(gulp.dest(outputDir + 'js'))
        .pipe(connect.reload());
});

gulp.task('css', function () {
    gulp.src(sassSources)
        .pipe(compass({
            sass: 'components/sass',
            image: outputDir + 'images',
            style: 'compressed'
        }))
        .on('error', gutil.log)
        .pipe(gulp.dest(outputDir + 'css'))
        .pipe(connect.reload());
});

gulp.task('html', function () {
    gulp.src(htmlSources)
        .pipe(gulpif(env === PROD, minifyHTML()))
        .pipe(gulpif(env === PROD, gulp.dest(outputDir)))
        .pipe(connect.reload());
});

gulp.task('images', function () {
    gulp.src(imgSources)
        .pipe(gulpif(env === PROD, imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: pngcrush()
        })))
        .pipe(gulpif(env === PROD, gulp.dest(outputDir + 'images/')))
        .pipe(connect.reload());
});

gulp.task('json', function () {
    gulp.src(jsonSources)
        .pipe(gulpif(env === PROD, jsonMinify()))
        .pipe(gulpif(env === PROD, gulp.dest(outputDir + 'js/')))
        .pipe(connect.reload());
})

gulp.task('watch', function () {
    gulp.watch(coffeeSources, ['coffee']);
    gulp.watch(jsSources, ['js']);
    gulp.watch('components/sass/*.scss', ['css']);
    gulp.watch(htmlSources, ['html']);
    gulp.watch(jsonSources, ['json']);
    gulp.watch(imgSources, ['images']);
});

gulp.task('connect', function () {
    connect.server({
        root: outputDir,
        livereload: true
    })
});

gulp.task('default', ['html', 'json', 'coffee', 'css', 'images', 'js', 'connect', 'watch']);
