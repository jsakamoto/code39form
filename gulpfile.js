var gulp = require('gulp');
var ts = require('gulp-typescript');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var merge = require('merge-stream');

var bundleconfig = [
    {
        "inputFiles": ["./src/index.js"],
        "uglify": true,
        "outputFileName": "index.min.js"
    },
    {
        "inputFiles": [
            "./node_modules/jquery/dist/jquery.min.js",
            "./node_modules/jquery.cookie/jquery.cookie.js",
            "./src/vender/jquery-barcode.min.js",
            "./node_modules/json3/lib/json3.min.js",
            "./node_modules/handlebars/dist/handlebars.min.js"
        ],
        "uglify": false,
        "outputFileName": "vender.min.js"
    }
];


gulp.task('tsc', () => {
    let tsproject = ts.createProject('tsconfig.json');
    tsproject.src()
        .pipe(sourcemaps.init())
        .pipe(tsproject())
        .pipe(gulp.dest("./src"))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("./src"));
});

gulp.task('min:js', () => {
    var tasks = bundleconfig.map(bundle => {
        var task = gulp.src(bundle.inputFiles, { base: "." })
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(concat(bundle.outputFileName));
        if (bundle.uglify == true) task = task.pipe(uglify());
        return task
            .pipe(gulp.dest("."))
            .pipe(sourcemaps.write("./"))
            .pipe(gulp.dest("."));
    });
    return merge(tasks);
});

gulp.task('sass', () => {
    gulp.src('./src/site.scss')
        .pipe(sass())
        .pipe(cleanCSS())
        .pipe(gulp.dest("."));
});

gulp.task('watch', () => {
    bundleconfig.forEach(bundle => {
        gulp.watch('./src/*.ts', ["tsc"]);
        gulp.watch(bundle.inputFiles, ["min:js"]);
        gulp.watch('./src/site.scss', ["sass"]);
    });
});

gulp.task('build', ['tsc', 'min:js', 'sass']);