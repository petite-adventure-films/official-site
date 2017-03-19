<?php get_header(); ?>

<form>

<div id="input_film">
<label>映画名</label><br />
<select>
	<option>-</option>
	<option value="1">映画1</option>
	<option value="2">映画2</option>
	<option value="3">映画3</option>
</select>
<br /><br />

<label>種類</label><br />
<select>
	<option>-</option>
	<option value="1">種類1</option>
	<option value="2">種類2</option>
	<option value="3">種類3</option>
</select>
<br /><br />

<label>個数</label><br />
<select>
	<option>-</option>
	<option value="1">1</option>
	<option value="2">2</option>
	<option value="3">3</option>
</select>
</div>

<br />


<p id="add_film">ADD</p>

<script>

$(function(){
	$("#add_film").click(function(){

		var count = 0;
		var infoList = [];
		$("#input_film select").each(function(){
			if($(this).val()){
				infoList[count] = $(this).val();
				count++;
			}
		});

		var addedFilmInfo =

		console.log(infoList);


		if(count == 3){

		}
	});

});


</script>


<?php get_footer(); ?>

