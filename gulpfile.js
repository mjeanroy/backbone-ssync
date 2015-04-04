/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Mickael Jeanroy
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var taskListing = require('gulp-task-listing');
var rename = require('gulp-rename');
var wrap = require('gulp-wrap');
var strip = require('gulp-strip-comments');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var karma = require('karma').server;

var BUILD_FOLDER = 'dist';

var vendors = [
  'node_modules/jquery/dist/jquery.js',
  'node_modules/underscore/underscore.js',
  'node_modules/backbone/backbone.js',
  'node_modules/jasmine-ajax/lib/mock-ajax.js'
];

var srcFiles = [
  'src/backbone-ssync.js'
];

var distFiles = [
  BUILD_FOLDER + '/backbone-ssync.js'
];

var karmaFiles = vendors
  .concat(distFiles)
  .concat('test/**/*.js');

gulp.task('help', taskListing);

gulp.task('lint', function() {
  return gulp.src("src/**/*.js")
    .pipe(jshint())
    .pipe(jshint.reporter("default"));
});

gulp.task('minify', ['lint'], function(done) {
  return gulp.src(srcFiles)
    .pipe(concat('backbone-ssync.js'))
    .pipe(strip({ block: true }))
    .pipe(wrap({
      src: 'wrapper.js'
    }))
    .pipe(gulp.dest(BUILD_FOLDER))
    .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(rename('backbone-ssync.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(BUILD_FOLDER));
});

gulp.task('tdd', ['minify'], function(done) {
  var options = {
    configFile: __dirname + '/karma.conf.js',
    files: karmaFiles
  };

  karma.start(options, function() {
    done();
  });
});

gulp.task('test', ['minify'], function(done) {
  var options = {
    configFile: __dirname + '/karma.conf.js',
    files: karmaFiles,
    singleRun: true,
    browsers: ['PhantomJS']
  };

  karma.start(options, function() {
    done();
  });
});

gulp.task('build', ['lint', 'test', 'minify']);
gulp.task('default', ['build']);
