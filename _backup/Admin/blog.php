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
	include('../php/functions/db_func.php');
	$success = 0;
	$editArray = 0;
	if(isset($_POST['execute2']))
	{
		$queryYear = $_POST['dateQuery'];	
	}
	else
	{
		if(isset($_GET['queryyear']))
		{
			$queryYear = $_GET['queryyear'];
		}
		else
		{
			$queryYear = '2011';	
		}
	}
	if(isset($_POST['execute']) || isset($_GET['newsid']))
	{
		$userConnection = ConncetDB();
		if(isset($_GET['func']))
		{
			if(strcmp($_GET['func'],'edit') === 0)
			{
				$query = 'SELECT * from blog WHERE idnews = ' . $_GET['newsid'];
				$result = mysql_query($query);
				if(!$result)
				{
					print "Edit Query failed" . mysql_error();
					die;
				}
				$editArray = mysql_fetch_assoc($result);
			}
			if(strcmp($_GET['func'],'delete') === 0)
			{
				$query = 'UPDATE blog SET news_status = 0 WHERE idnews = ' . $_GET['newsid'];
				$result = mysql_query($query);
				if(!$result)
				{
					print "Edit Query failed" . mysql_error();
					die;
				}
				header("Location:blog.php?queryyear=" . $queryYear);
				exit;
			}
			if(strcmp($_GET['func'],'undelete') === 0)
			{
				$query = 'UPDATE blog SET news_status = 1 WHERE idnews = ' . $_GET['newsid'];
				$result = mysql_query($query);
				if(!$result)
				{
					print "Edit Query failed" . mysql_error();
					die;
				}
				header("Location:blog.php?queryyear=" . $queryYear);
				exit;
			}
		}
		else
		{
			if(strcmp($_POST['newsid'],'noid')===0)
			{
				$sqlInsert="INSERT INTO blog ";
				$fieldNames = '(news_posted_date, news_title, news_body, news_status, news_image, news_image_height, news_image_width, news_language )';
				$fieldValues = "('" .sqlClean($_POST['date_post']) . "','" .
						     sqlClean($_POST['title']) . "','" .
						     sqlClean($_POST['body']) . "','" .
						     sqlClean($_POST['status']) . "','" .
						     sqlClean($_POST['image']) . "','" .						     
						     sqlClean($_POST['image_height']) . "','" .						     
						     sqlClean($_POST['image_width']) . "','" .
						     sqlClean($_POST['language']) . "')";
				$sqlInsert = $sqlInsert . $fieldNames . ' VALUES ' . $fieldValues;
				if (!mysql_query($sqlInsert,$userConnection))
				{
				    die('Error in update database.<br/>' . mysql_error());
				}
				$success = ' ' . $_POST['title'] . ' ' . $_POST['date_post'];
			}
			else
			{
				$sqlUpdate = "UPDATE blog SET " .
				"news_posted_date='"   . sqlClean($_POST['date_post']) .
				"', news_title='" . sqlClean($_POST['title'])  .
				"', news_body='" . sqlClean($_POST['body'])  .
				"', news_language='" . sqlClean($_POST['language']) .
				"', news_status='" . sqlClean($_POST['status']) .				
				"', news_image='" . sqlClean($_POST['image']) .
				"', news_image_height='" . sqlClean($_POST['image_height']) .
				"', news_image_width='" . sqlClean($_POST['image_width']) .
				"' WHERE idnews = " . sqlClean($_POST['newsid']);
				if (!mysql_query($sqlUpdate,$userConnection))
				{
				    die('Error in update database.<br/>' . mysql_error());
				}				
				$success = ' ' . $_POST['title'] . ' ' . $_POST['date_post'];
			}
		}
		mysql_close($userConnection);
	}
?>
<div id="wrapper">
	<div id="logo">
		<h1><a href="#">Petite Adventure Films </a></h1>
		<p>プチ・アドベンチャー・フィルムズ</p>
	</div>
	<div id="menu">
		<ul>
			<li class="current_page_item"><span>Blog</span></li>
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
					<h4>Petite Admin (add news)</h4>
					<?php
						if($success)
						{
							print "<b>Database update:</b> $success";
						}
					?>
					<form accept-charset="UTF-8,ISO-8859-1" class="standardform" action=<?php echo '"blog.php?queryyear=' . $queryYear . '"';?> method="post">
					<table>
						<tr>
							<td>Language</td>
							<td>
								<select name="language" id="language">
									<option value="jp"
									<?php if($editArray)
										{
										   if(strcmp($editArray['news_language'],'jp')===0)
										   {
										      print ' SELECTED ';
										   }
										}
									?>
									>Japanese</option>
									<option value="en"
									<?php if($editArray)
										{
										   if(strcmp($editArray['news_language'],'en')===0)
										   {
										      print ' SELECTED ';
										   }
										}
									?>								
									>English</option>
								</select>
							</td>
						</tr>
						<tr>
							<td>Status</td>
							<td>
								<select name="status" id="status">
									<option value="1"
									<?php if($editArray)
										{
										   if($editArray['news_status'] == 1)
										   {
										      print ' SELECTED ';
										   }
										}
									?>									
									>Front Page</option>
									<option value="2"
									<?php if($editArray)
										{
										   if($editArray['news_status'] == 2)
										   {
										      print ' SELECTED ';
										   }
										}
									?>									
									>Archive</option>
									<option value="0"
									<?php if($editArray)
										{
										   if($editArray['news_status'] == 0)
										   {
										      print ' SELECTED ';
										   }
										}
									?>									
									>Deleted</option>
								</select>								
							</td>
						</tr>
						<tr>
								<td>Date Posted</td>
								<td><input <?php if($editArray){print 'value ="'.$editArray['news_posted_date'].'" ';}else{print 'value ="'.date("Y-m-d").'" ';}?> type="text" name="date_post" id="date_post" maxlength="10" size="10" /> yyyy-mm-dd</td>
						</tr>
						<tr>
								<td>
									Special Notes
								</td>
								<td>
									The fields below can contain html to allow formatting of text. You can for example do the following<br/><br/>
									&#060;br/&#062; - insert new line<br/>
									&#060;b&#062;<b>your text here</b>&#060;/b&#062; - <b>bold</b><br/>
									&#060;u&#062;<u>your text here</u>&#060;/u&#062; - <u>underline</u><br/>
									&#060;i&#062;<i>your text here</i>&#060;/i&#062; - <i>italic</i>
								</td>
						</tr>										
						<tr>
								<td>Title</td>
								<td><textarea maxlength=150 cols="50" rows="3" name="title" id="title"><?php if($editArray){print $editArray['news_title'];}?></textarea></td>
						</tr>
						<tr>
								<td>Body Text</td>
								<td><textarea maxlength=500 cols="50" rows="10" name="body" id="body"><?php if($editArray){print $editArray['news_body'];}?></textarea></td>
						</tr>
						<tr>
							<td>Add Image</td>
							<td>
								<select name="image" id="image">
									<option value="No Image"
									<?php
										if($editArray)
										{
										   if(strcmp($editArray['news_image'],'')===0)
										   {
										      print ' SELECTED ';
										   }
										}
									?>
									>No Image</option>
									<?php
										if ($handle = opendir('../images/news_pics/'))
										{
										    while (false !== ($file = readdir($handle)))
										    {
											if ($file != "." && $file != "..")
											{
												echo '<option value=' . $file;
												if($editArray)
												{
												   if(strcmp($editArray['news_image'],$file)===0)
												   {
												      print ' SELECTED ';
												   }
												}								
												echo '>' . $file . '</option>';
											}
										    }
										    closedir($handle);
										}
									?>							
								</select>
							</td>
						</tr>
						<tr>
							<td colspan="2"><small>Leave the following fields blank to use original picture dimensions.</small></td>
						</tr>
						<tr>
								<td>Image Height</td>
								<td><input <?php if($editArray){print 'value ="'.$editArray['news_image_height'].'" ';}?> type="text" name="image_height" id="image_height" maxlength="5" size="5" /></td>
						</tr>
						<tr>
								<td>Image Width</td>
								<td><input <?php if($editArray){print 'value ="'.$editArray['news_image_width'].'" ';}?> type="text" name="image_width" id="image_width" maxlength="5" size="5" /></td>
						</tr>
					</table>
					<p class="hiddenpara">
					<input type="hidden" name="execute" id="execute" value="OK" /></p>
					<p class="hiddenpara">
					<input type="hidden" name="newsid" id="newsid" value=<?php if(isset($_GET['newsid'])){ echo '"' . $_GET['newsid'] . '"';}else{echo'"noid"';}?> /></p>
					<p class="hiddenpara">
					<input type="submit" class="stdformbtn" value=<?php if(isset($_GET['newsid'])){ echo '"Submit EDIT"';}else{echo'"Submit news"';}?> /></p>
					</form>
				</div>
				<!-- end #content -->
				<div id="sidebar">
				<?php
					echo '<h1>Edit - ' . $queryYear . '</h1>';
					$userConnection = ConncetDB();
					$query = 'SELECT * FROM `blog` WHERE EXTRACT(YEAR FROM `news_posted_date`) = ' . $queryYear . ' ORDER BY `news_posted_date` DESC';
					$result = mysql_query($query);
					if (!$result)
					{
						print "Query failed" . mysql_error();
						die;
					}
					echo '<hr/>';
					while($row = mysql_fetch_assoc($result))
					{
					    echo $row['news_title'] . ' - ';
					    echo $row['news_posted_date'] . '<br>';
					    if($row['news_status'] == 0)
					    {
						echo 'news deleted: <a href="blog.php?queryyear=' . $queryYear . '&func=undelete&newsid=' . $row['idnews'] . '">undelete</a>'; 	
					    }
					    else
					    {
						echo '<a href="blog.php?queryyear=' . $queryYear . '&func=edit&newsid=' . $row['idnews'] . '">edit</a>' . ' - ';
						echo '<a href="blog.php?queryyear=' . $queryYear . '&func=delete&newsid=' . $row['idnews'] . '">delete</a>'; 
					    }
					    echo '<hr/>';
					}
					mysql_close($userConnection);
					if(isset($_GET['newsid']))
					{
						echo 'To cancel edit click <a href="blog.php?queryyear=' . $queryYear . '">*here*</a>'; 
						echo '<hr/>';
					}
				?>
					<form accept-charset="UTF-8,ISO-8859-1" class="standardform" action="blog.php" method="post">
						<select name="dateQuery" id="dateQuery">
							<?php
								$result = 0;
							/*	$userConnection = GetNewsYears($result);
								while($row = mysql_fetch_row($result))
								{
									echo '<option value="' . $row[0] . '" ';
									if($queryYear == $row[0])
									{
										echo 'SELECTED';
									}
									echo ' >' . $row[0] . '</option>';
								}*/
								echo '<option value="' . '2013' . '" ';
								echo 'SELECTED';
								echo ' >' . '2013' . '</option>';
							?>
						</select>
						<p class="hiddenpara">
						<input type="hidden" name="execute2" id="execute2" value="OK" /></p>
						<p class="hiddenpara">
						<input type="submit" class="stdformbtn" value="Query Edit Date" /></p>					
					</form>	
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
