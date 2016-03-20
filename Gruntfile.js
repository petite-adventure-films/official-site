"use strict";

module.exports = function(grunt){

 	var taskName;
	var pkg = grunt.file.readJSON("package.json");
	for(taskName in pkg.devDependencies) {
		if(taskName.substring(0, 6) == "grunt-") {
			grunt.loadNpmTasks(taskName);
		}
	}

	grunt.initConfig({

		//package.jason
		pkg: pkg,
		banner: '/*\n* Theme name: <%= pkg.name %>\n* Version: <%= pkg.version %>\n* Author: <%= pkg.author %>\n* Description: <%= pkg.description %>\n* Theme URI: <%= pkg.homepage %>\n* Update: <%= grunt.template.today("yyyy-mm-dd") %>\n*/\n',

		// watch for changes and trigger compass, jshint, uglify and livereload
		watch: {
			options: {
				spawn: true
			},
			html: {
				files: ["wp/wp-content/themes/petiteadventurefilms/**/*.{php,html}"],
				tasks: []
			},
			compass: {
				files: [
					"wp/wp-content/themes/petiteadventurefilms/_scss/**/*.scss",
					"wp/wp-content/themes/petiteadventurefilms/assets/css/**/*.css"
				],
				tasks: ["compassMultiple", "cssmin", "usebanner"]
			},
			js: {
				files: "wp/wp-content/themes/petiteadventurefilms/**/*.js",
				tasks: ["uglify"]
			}
		},

		// compass and scss
		compassMultiple: {
			options : {
				environment: "development",
				outputStyle: "nested",
				javascriptsDir: "wp/wp-content/themes/petiteadventurefilms/assets/js",
				imagesDir: "wp/wp-content/themes/petiteadventurefilms/assets/img",
				fontsDir: "wp/wp-content/themes/petiteadventurefilms/assets/fonts",
				time: true
			},
			common: {
				options: {
					sassDir: "wp/wp-content/themes/petiteadventurefilms/_scss",
					cssDir: "wp/wp-content/themes/petiteadventurefilms/assets/css"
				}
			}
		},

		//cssmin
		cssmin: {
			files: {
				src: "wp/wp-content/themes/petiteadventurefilms/assets/css/**/*.css",
				dest: "wp/wp-content/themes/petiteadventurefilms/style.css"
			}
		},

		usebanner: {
			dist: {
				options: {
					position: 'top',
					banner: '<%= banner %>'
				},
				files: {
					src: [ "wp/wp-content/themes/petiteadventurefilms/style.css"]
				}
			}
		},

		// combine-media-queries メディアクエリをまとめる
		// cmq: {
		// 	options: {
		// 		log: false
		// 	},
		// 	dev: {
		// 		files: {
		// 			"css/": ["css/*.css"]
		// 		}
		// 	}
		// },

		// csscomb CSSプロパティを整理
		// csscomb: {
		// 	dev: {
		// 		expand: true,
		// 		cwd: "",
		// 		src: ["style.css"],
		// 		dest: ""
		// 	}
		// },


		// clean 不要ファイルを削除
		// clean: {
			// 最初にreleaseディレクトリ内を削除
		// 	deleteReleaseDir: {
		// 		src: "www/"
		// 	}
		// },

		// uglify to concat, minify, and make source maps
		uglify: {
			main: {
				src: [
					"wp/wp-content/themes/petiteadventurefilms/assets/js/jquery-2.1.4.min.js",
					"wp/wp-content/themes/petiteadventurefilms/assets/js/ajaxzip3.js",
					"wp/wp-content/themes/petiteadventurefilms/assets/js/owl.carousel.js",
					"wp/wp-content/themes/petiteadventurefilms/assets/js/masonry.pkgd.js",
					"wp/wp-content/themes/petiteadventurefilms/assets/js/base.js"
				],
				dest: "wp/wp-content/themes/petiteadventurefilms/script.min.js"
			}
		},

	});

	// register task
	grunt.registerTask("default", ["watch", "usebanner"]);

	// register task
	//grunt.registerTask("release", ["wp/wp-content/themes/petiteadventurefilms/clean:deleteReleaseDir","copy"]);


};


