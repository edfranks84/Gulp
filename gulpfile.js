var notify = require("gulp-notify"),
	gulp = require("gulp"),
	concat = require("gulp-concat"),
	sass = require("gulp-sass"),
	autoprefixer = require("gulp-autoprefixer"),
	jshint = require('gulp-jshint'),
	del = require('del'),
	stylish = require('jshint-stylish'),
	imagemin = require('gulp-imagemin'),
	plumber = require("gulp-plumber"),
	browserSync = require("browser-sync"),
	svgSprite = require('gulp-svg-sprite'),
	uglify = require('gulp-uglify'),
	minifyCss = require('gulp-minify-css'),
	reload  = browserSync.reload,
	svgmin = require('gulp-svgmin'),
	rename = require('gulp-rename'),
	cheerio = require('gulp-cheerio'),
	svgo = require('gulp-svgo'),
	svgstore = require('gulp-svgstore');
 


gulp.task('clean', function(cb) {
  del(['assets/build'], cb);
});


// Combine svg files into a sprite and remove any fills

gulp.task('svgstore', function () {
    return gulp.src('assets/svg-sprite/*.svg')
    	.pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
            },
            parserOptions: { xmlMode: true }
        }))
        .pipe(svgstore())
        .pipe(gulp.dest('build/svg-sprite'))
        .pipe(notify({message: 'svgs sprited!'}));
});


// Minify SVG files that will be used as individual files

gulp.task('svgo', function() {
    return gulp.src('assets/svg/*.svg')
    	.pipe(plumber())
        .pipe(svgo())
        .pipe(gulp.dest('build/svgs'))
        .pipe(notify({message: 'svgs minified!'}));
});



// Minify and combine js files from main js folder(plugins)

gulp.task('scripts', function() {  
	return gulp.src('assets/js/*.js') 
		.pipe(plumber())
		//.pipe(uglify())  
    	.pipe(concat('scripts.js'))  
    	.pipe(gulp.dest('build/scripts'))   
    	.pipe(notify({message: 'JS processed!'}));
}); 


// Process SASS and autoprefix it

gulp.task('sass', function() {

	 var onError = function(err) {
        notify.onError({
                    title:    "Gulp",
                    subtitle: "Failure!",
                    message:  "Error: <%= error.message %>",
                    sound:    "Sosumi"
                })(err);

        this.emit('end');
    };

    function errorAlert(error){
		notify.onError({
			title: "SCSS Error", 
			message: "Check your terminal", 
			sound: "Sosumi"
		})(error); //Error Notification
		console.log(error.toString());//Prints Error to Console
		this.emit("end"); //End function
	};


    return gulp.src('assets/scss/**/*.scss')
    	.pipe(plumber({errorHandler: errorAlert}))
		.pipe(sass({style: 'expanded' }))
		.pipe(autoprefixer('last 2 version'))
		.pipe(gulp.dest('build/css'))
		.pipe(reload({stream: true}))
		.pipe(notify({message: 'SCSS processed!'}));
});


// Minify images and ouput them in dist

gulp.task('images', function() {
	return gulp.src('assets/images/*')
		.pipe(imagemin())
		.pipe(gulp.dest('build/images'));
//		.pipe(notify({message: 'images minified'}));
});


// Launch website in browser and refresh when any changes made to sass files 
// (syncs multiple browsers)

gulp.task('serve', ['sass'], function() {

    browserSync({
        server: "./"
    });
    gulp.watch('assets/scss/**/*.scss', ['sass']);
    gulp.watch('/.html').on('change', reload);
});


// Minify JS

gulp.task('uglify', function() {  
	return gulp.src('build/scripts/scripts.js')  
  		.pipe(uglify()) 
    	.pipe(gulp.dest('build/dev'))   
    	.pipe(notify({message: 'JS processed!'}));
}); 


// Minify CSS

gulp.task('minify', function() {  
	return gulp.src('build/css/*.css')  
  		.pipe(minifyCss()) 
    	.pipe(gulp.dest('build/dev'))   
    	.pipe(notify({message: 'JS processed!'}));
}); 


// Task to minify files once finished and read

gulp.task('min', ['uglify', 'minify']);


//Run on javascript file to check for errors

gulp.task('default', function () {
    return gulp.src(['assets/js/main.js'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});

// gulp.task('lint', function() {
//   return gulp.src('./www/js/*.js')
//     .pipe(jshint())
//     .pipe(jshint.reporter('jshint-stylish'));
// });


// Default task

gulp.task('default', ['clean', 'scripts', 'sass', 'images', 'svgo', 'svgstore', 'serve'], function () {
  // Watch .js files
  gulp.watch('assets/js/*.js', ['scripts']);
   // Watch .scss files
  gulp.watch('assets/scss/**/*.scss', ['sass']);
   // Watch image files
  gulp.watch('assets/images/**', ['images']);
   // Watch svg files
  gulp.watch('assets/svgs/**', ['svgo']);
   // Watch svg-sprite file
  gulp.watch('assets/svg-sprite/**', ['svgstore']);
});

