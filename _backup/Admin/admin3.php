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
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta name="keywords" content="" />
<meta name="description" content="" />
<meta http-equiv="content-type" content="text/html; charset=utf-8" />
<title>Petite Adventure Films</title>
<link href="../style.css" rel="stylesheet" type="text/css" media="screen" />
</head>
<body>
<?php
	error_reporting(E_ALL);
	ini_set('display_errors', '1');
	include('../php/functions/upload_file.php');
?>
<div id="wrapper">
	<div id="logo">
		<h1><a href="#">Petite Adventure Films </a></h1>
		<p>プチ・アドベンチャー・フィルムズ</p>
	</div>
	<div id="menu">
		<ul>
			<li><span><a href="admin.php">Add Screening</a></span></li>
			<li><span><a href="admin2.php">Add News</a></span></li>
			<li class="current_page_item"><span><a href="#">File Manager</a></span></li>
		</ul>
	</div>

	<!-- end #menu -->
	<div id="header">
	</div>
	<!-- end #header -->
	<div id="page">
		<div id="page-bgtop">
			<div id="page-bgbtm">
				<div id="content">
					<h4>Petite Admin (file manager)</h4>
					<table>
						<tr>
							<td>
								<form action="admin3.php" method="post"
									enctype="multipart/form-data">
									<label for="file"><b>Images For News Posts</b><br/></label>
									<small>File Types: png,jpg,gif<br/>Max File Size: 5Mb</small>
									<input type="file" name="news_pic" id="news_pic" />
									<br />
									<input type="submit" name="submit" value="Upload" />
								</form>
							</td>
							<td width="100%">
								<b>Uploaded Images<br></b>
								<?php
									if ($handle = opendir('../images/news_pics/')) {
									    while (false !== ($file = readdir($handle))) {
										if ($file != "." && $file != "..") {
										    echo "$file<br/>";
										}
									    }
									    closedir($handle);
									}
								?>
							</td>
						</tr>
						<tr>
							<td colspan="2">
								<b>Upload Report<br></b>
								<?php
									if(isset($_POST['submit']))
									{
										UploadFile();
									}
								?>
							</td>
						</tr>
					</table>
				</div>
				<!-- end #content -->
				<div id="sidebar">

				</div>
				<br>
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
