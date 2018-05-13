const gulp = require("gulp"),
    watch = require("gulp-watch"),
    browserSync = require("browser-sync"),
    del = require("del"),
    webp = require("gulp-webp"),
    uglify = require("gulp-uglify"),
    babel = require("gulp-babel"),
    es2015 = require("babel-preset-es2015"),
    pump = require("pump"),
    concat = require("gulp-concat"),
    htmlmin = require("gulp-htmlmin"),
    cleanCSS = require("gulp-clean-css"),
    autoprefixer = require("gulp-autoprefixer"),
    sourcemaps = require("gulp-sourcemaps"),
    runSequence = require("run-sequence");

gulp.task("default", ["watch"]);

gulp.task("browserSync", function() {
    browserSync({
        server: {
            baseDir: "app"
        }
    });
});

gulp.task("watch", ["browserSync"], function() {
    gulp.watch("app/css/**/*.css", ["minify-css"]);
    gulp.watch("img/**/*.jpg", ["webp"]);
    gulp.watch("app/js/**/*.js", ["compress"]);
    gulp.watch("app/*.html").on("minify", browserSync.reload);
});

gulp.task("webp", function() {
    return gulp.src("app/img/**/*.jpg")
        .pipe(webp())
        .pipe(gulp.dest("build/img"));
});

gulp.task("compress", function(cb) {
    pump([
            gulp.src("app/js/**/*.js"),
            babel({ presets: [es2015] }),
            uglify(),
            gulp.dest("build/js")
        ],
        cb
    );
});

gulp.task("minify-css", () => {
    return gulp.src("app/css/**/*.css")
        .pipe(sourcemaps.init())
        .pipe(autoprefixer())
        .pipe(concat("all.css"))
        .pipe(sourcemaps.write("."))
        .pipe(cleanCSS({ compatibility: "ie8" }))
        .pipe(gulp.dest("build/css"));
});

gulp.task("minify", function() {
    return gulp.src("app/*.html")
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest("build"));
});

gulp.task("clean", function() {
    del("dist");
});

gulp.task("build", function() {
    runSequence("clean", "minify-css", "minify", "compress", "webp");
});