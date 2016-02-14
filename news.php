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
</head>
<body>
<div id="wrapper">
	<div id="logo">
		<h1><a href="http://www.brianandco.co.uk/paf/index.php">Petite Adventure Films </a></h1>
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
		MenuBar('news',MAIN_MENU);
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
						parse_post('news');
					?>	
				</div>
				<!-- end #content -->
				<div id="sidebar">
					<ul>
						<li>
							<h1>2011</h1>
						</li>
						<li>
							<ul>
								<li><a href="#">January</a></li>
								<li><a href="#">February</a></li>
								<li><a href="#">March</a></li>
								<li><a href="#">April</a></li>
								<li><a href="#">May</a></li>
							</ul>
						</li>
					</ul>
										<ul>
						<li>
							<h1>2010</h1>
						</li>
						<li>
							<ul>
								<li><a href="#">January</a></li>
								<li><a href="#">February</a></li>
								<li><a href="#">March</a></li>
								<li><a href="#">April</a></li>
								<li><a href="#">May</a></li>
							</ul>
						</li>
					</ul>
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
