'use strict';

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    mocha = require('gulp-mocha'),
    istanbul = require('gulp-istanbul');


function handle(error) {
    /* jslint validthis:true */
    console.error(error.toString());
    this.emit('end');
}


gulp.task('lint', function() {
    return gulp.src([
            'gulpfile.js',
            'src/**/*.js',
            'lib/**/*.js',
        ])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .on('error', handle);
});

gulp.task('lint-tests', function() {
    gulp.src('test/**/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .on('error', handle);
});

gulp.task('test', ['lint'], function(cb) {
    gulp.src([
        'index.js',
        'lib/**/*.js',
        'src/**/*.js',
    ])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
        .on('error', handle)
        .on('finish', function() {
            gulp.src('test/**/*.js')
                .pipe(mocha({ reporter: 'list' }))
                .on('error', handle)
                .pipe(istanbul.writeReports())
                .on('end', cb);
        });
});

gulp.task('tr-test', function() {
    gulp.src('test/**/*.js')
        .pipe(mocha({ reporter: 'list' }));
});

gulp.task('watch', ['test'], function() {
    // Linting tasks
    gulp.watch([
        'gulpfile.js',
    ], ['lint']);

    // gulp.watch('test/**/*.js', ['lint-tests']);

    // Tests
    gulp.watch([
        'test/**/*.js',
        'src/**/*.js',
        'lib/**/*.js',
    ], ['test']);
});

gulp.task('default', ['watch']);
