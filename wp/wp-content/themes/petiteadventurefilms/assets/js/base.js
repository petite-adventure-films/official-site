$(function(){

	//vars
	var windowWidth = $(window).width();
	var windowHeight = $(window).height();

	//control float div clear
	$(".last, .list_definition").after('<div class="clear"></div>');

	//
	$("body").append('<div class="overlay"></div>');

	//move within page
	$('a[href*=#]:not([href=#])').click(function() {
		if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
			if (target.length) {
					$('html,body').animate({
						scrollTop: target.offset().top
					}, 300);
					return false;
			}
		}
	});

	//when scrolling
	$("#go_top").hide();
	$(window).scroll(function(){
		if ($(this).scrollTop() > 100) {
			$("#go_top").fadeIn();
		} else {
			$("#go_top").fadeOut();
		}
	});


	//
	$(".floating_grids").masonry({
		itemSelector: ".grid_item",
		isFitWidth: true
	});

	$(".overlay").bind("click", function(){
		$(this).fadeOut("fast");
	});

	$(".lightbox img").click(function(){

		var url = $(this).attr("src");

		var wMargin = ($(this).width()/2);
		var tMargin = ($(this).height()/2);

		$(".overlay").empty().attr("id", "lightbox").append('<div id="show"><div id="contents"><img src="' + url + '" /></div></div>').fadeIn('fast');

	});

	// fixed header
	if(windowWidth < 961){
		$(window).on("load scroll", function(){
			closeSiteMenu($("#icon_site_menu"));
			var scrollPos = $(window).scrollTop();
			if(scrollPos > windowHeight){
				$("#site_header").removeClass("relative").addClass("fixed");
			}else{
				$("#site_header").removeClass("fixed").addClass("relative");
			}
		});
	}

	// control header menu
	var clone = $(".site_menu").clone();
	clone.attr("id", "site_menu_smaller").appendTo("#site_header .show_smaller");
	if(windowWidth < 961){
		$("#icon_site_menu").click(function(){
			if($("#site_menu_smaller").css("display") == "block"){
				closeSiteMenu($(this));
			}else{
				openSiteMenu($(this));
			}
		});
	}

	function closeSiteMenu(target){
		$("#site_menu_smaller").slideUp();
		target.removeClass("close_site_menu");
		target.removeClass("icon-close").addClass("icon-menu");
	};

	function openSiteMenu(target){
		$("#site_menu_smaller").slideDown();
		target.addClass("close_site_menu");
		target.removeClass("icon-menu").addClass("icon-close");
	};

});