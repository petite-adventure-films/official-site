<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<!--
CSS Design by Free CSS Templates
http://www.freecsstemplates.org
Released for free under a Creative Commons Attribution 2.5 License

Name       : Pollination  
Description: A two-column, fixed-width design with dark color scheme.
Version    : 1.0
Released   : 20100925
Modified by: Petite Adventure Films - 20110223
-->
<?php
	include('./php/functions/menu_bar.php');
	include('./php/functions/load_array.php');
	include('./php/functions/cookielive.php');
	include('./php/functions/parse_post.php');
	include('./php/functions/common_var.php');
	include('./php/functions/check_lang.php');
	include('./php/functions/parse_for_formatting.php');	
?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta name="keywords" content="" />
<meta name="description" content="" />
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<title>Petite Adventure Films</title>
<link href="style.css" rel="stylesheet" type="text/css" media="screen" />
<script type="text/javascript" src="jquery/jquery-1.4.2.min.js"></script>
<script type="text/javascript" src="jquery/jquery.gallerax-0.2.js"></script>
<style type="text/css">@import "gallery.css";</style>
</head>
<body>
<div id="wrapper">
	<div id="logo">
		<h1><a href="http://www.petiteadventurefilms.com">Petite Adventure Films </a></h1>
		<p class="patitle">プチ・アドベンチャー・フィルムズ</p>
        <?php
		CheckLang();
		if(strcmp($_COOKIE["lang"],'jp')!== 0)
		{
			header("Location: index.php?lang=en");
		}		
	?>		
	</div>
        <?php
		MenuBar('films',MAIN_MENU);
	?>
	<!-- end #menu -->
	<div id="header">
	</div>
	<!-- end #header -->
	<div id="page">
		<div id="page-bgtop">
			<div id="page-bgbtm">
				<div id="content">
					<?php
						parse_post('films');
					?>	
				</div>
				<!-- end #content -->
				<div id="sidebar">
					<?php
						parse_post('films_sidebar');
					?>
					<script type="text/javascript">
						$('#gallery').gallerax({
							outputSelector:     '.output',			// Output selector
							thumbnailsSelector: '.thumbnails li img',       // Thumbnails selector
							captionSelector:    '.caption'			// Caption selector
						});
					</script>
				</div>
				<!-- end #sidebar -->
				<div style="clear: both;">&nbsp;</div>
			</div>
		</div>
	</div>
	<!-- end #page -->
</div>

<div id="footer">
	<p>Copyright (c) 2011 petiteadventurefilms.com. All rights reserved. Design by: Petite Adventure Films with help from <a href="http://www.freecsstemplates.org/"> CSS Templates</a>.</p>
</div>
<!-- end #footer -->
</body>
</html>