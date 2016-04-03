/**
 * @fileOverview [description]
 * @authors hunger (hunger@jirengu.com)
 * @date    2015-10-22
 */

var gulp = require('gulp');

// 引入组件
var minifycss = require('gulp-minify-css'), // CSS压缩
    autoprefixer = require('gulp-autoprefixer'),
    less = require('gulp-less');

console.log(less);


gulp.task('less', function(){
	gulp.src('less/*.less')
		.pipe(less())
		.pipe(autoprefixer({browsers: ['IE 6']}))
		//.pipe(minifycss())
		.pipe(gulp.dest('css/'));

})

gulp.task('css', function(argument) {

	gulp.src('css/origin.css')
    .pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: true
		}))
	//	.pipe(minifycss())
		.pipe(gulp.dest('css/'));
});
