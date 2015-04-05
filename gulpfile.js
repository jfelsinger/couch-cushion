'use strict';

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    mocha = require('gulp-mocha');


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
    return gulp.src('test/**/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .on('error', handle);
});

gulp.task('test', ['lint'], function() {
    return gulp.src('test/**/*.js')
        .pipe(mocha({ reporter: 'list' }))
        .on('error', handle);
});

gulp.task('tr-test', function() {
    return gulp.src('test/**/*.js')
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
