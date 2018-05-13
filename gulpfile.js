const gulp = require("gulp"),
    webp = require("gulp-webp"),
    uglify = require("gulp-uglify"),
    babel = require("gulp-babel"),
    babel_core = require("babel-core"),
    es2015 = require("babel-preset-es2015"),
    pump = require("pump"),
    concat = require("gulp-concat"),
    gzip = require("gulp-gzip"),
    htmlmin = require("gulp-htmlmin");

gulp.task("webp", function() {
    return gulp.src("img/**/*.jpg")
        .pipe(webp())
        .pipe(gulp.dest("build/img"));
});

gulp.task("compress", function(cb) {
    pump([
            gulp.src("app/js/**/*.js"),
            babel({ presets: [es2015] }),
            concat("all.js"),
            uglify(),
            gzip(),
            gulp.dest("build/js")
        ],
        cb
    );
});

gulp.task("minify", function() {
    return gulp.src("app/*.html")
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest("build"));
});