<?php
$disabled = is_page("confirm") ? " disabled" : "";
?>

<div class="form_contents required">
	<div class="form_title"><label for="contact_name">お名前</label></div>
	<ul class="form_elements">
		<li><input type="text" name="contact_name" id="contact_name" value="<?php echo ($contact_name) ? $contact_name : ""; ?>" placeholder="例）山田花子"<?php echo $disabled; ?> /></li>
	</ul>
</div>

<div class="p2_t">
<div class="form_contents required">
	<div class="form_title"><label for="contact_zipcode">郵便番号</label></div>
	<div class="form_elements">
		<input type="text" name="contact_zipcode" id="contact_zipcode" maxlength="8" onKeyUp="AjaxZip3.zip2addr(this,'','contact_address1','contact_address1');" placeholder="例）1000005" value="<?php echo ($contact_zipcode) ? $contact_zipcode : ""; ?>"<?php echo $disabled; ?> />
	</div>
</div>
<div class="form_contents required">
	<div class="form_title"><label for="contact_address1">都道府県・市区町村</label></div>
	<ul class="form_elements">
		<li><input type="text" name="contact_address1" id="contact_address1" placeholder="例）東京都千代田区丸の内" data-error="配送先の都道府県・市区町村を入力してください
		" value="<?php echo ($contact_address1) ? $contact_address1 : ""; ?>"<?php echo $disabled; ?> /></li>
	</ul>
</div>
<div class="form_contents required">
	<div class="form_title"><label for="contact_address2">番地・建物名</label></div>
	<ul class="form_elements">
		<li><input type="text" name="contact_address2" id="contact_address2" placeholder="例）1-9-1" value="<?php echo ($contact_address2) ? $contact_address2 : ""; ?>"<?php echo $disabled; ?> /></li>
	</ul>
</div>
</div>

<div class="p2_t">
<div class="form_contents required">
	<div class="form_title"><label for="contact_tel">電話番号</label></div>
	<div class="form_elements">
		<input type="text" name="contact_tel" id="contact_tel" placeholder="例）08012345678" value="<?php echo ($contact_tel) ? $contact_tel : ""; ?>"<?php echo $disabled; ?> />
	</div>
</div>
</div>

<div class="p2_t">
<div class="form_contents required">
	<div class="form_title"><label for="contact_email">メールアドレス</label></div>
	<div class="form_elements">
		<input type="email" name="contact_email" id="contact_email" placeholder="例）abc@example.com" value="<?php echo ($contact_email) ? $contact_email : ""; ?>"<?php echo $disabled; ?> />
	</div>
</div>
<div class="form_contents required" id="contact_email_confirm_form">
	<div class="form_title"><label for="contact_email_confirm">メールアドレス（再入力）</label></div>
	<div class="form_elements">
		<input type="email" name="contact_email_confirm" id="contact_email_confirm" placeholder="例）abc@example.com" onpaste="return false" value="<?php echo ($contact_email_confirm) ? $contact_email_confirm : ""; ?>"<?php echo $disabled; ?> />
	</div>
</div>
</div>

<div class="p2_t">
<div class="form_contents required" id="pick_dvd">
	<div class="form_title">
		<label>ご希望の商品</label>
		<p>お求めになるDVDの種別と枚数をお選びください。</p>
	</div>
	<ul class="form_elements">
		<li id="movie_my_indian_diary_details_jp">
			<p class="bold">インド日記 〜ガジュマルの木の女たち〜</p>
			<label for="contact_film7_kind">種別</label>
			<select name="contact_film7_kind" class="contact_film_kind" id="contact_film7_kind"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film7_kind) ? " selected" : ""; ?>>-</option>
				<option value="4"<?php echo ($contact_film7_kind == 4) ? " selected" : ""; ?>>新作制作応援(DVD)</option>
				<option value="5"<?php echo ($contact_film7_kind == 5) ? " selected" : ""; ?>>新作制作応援(ブルーレイ)</option>
				<option value="1"<?php echo ($contact_film7_kind == 1) ? " selected" : "";?>>一般(DVDのみ)</option>
				<option value="2"<?php echo ($contact_film7_kind == 2) ? " selected" : "";?>>団体･ライブラリー(DVD)</option>
				<option value="3"<?php echo ($contact_film7_kind == 3) ? " selected" : "";?>>団体･ライブラリー(ブルーレイ)</option>
			</select><br />
			<label for="contact_film7_unit">枚数</label>
			<select name="contact_film7_unit" class="contact_film_unit" id="contact_film7_unit"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film7_unit) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film7_unit == 1) ? " selected" : "";?>>1</option>
				<option value="2"<?php echo ($contact_film7_unit == 2) ? " selected" : "";?>>2</option>
				<option value="3"<?php echo ($contact_film7_unit == 3) ? " selected" : "";?>>3</option>
				<option value="4"<?php echo ($contact_film7_unit == 4) ? " selected" : "";?>>4</option>
				<option value="5"<?php echo ($contact_film7_unit == 5) ? " selected" : "";?>>5</option>
				<option value="6"<?php echo ($contact_film7_unit == 6) ? " selected" : "";?>>6</option>
				<option value="7"<?php echo ($contact_film7_unit == 7) ? " selected" : "";?>>7</option>
				<option value="8"<?php echo ($contact_film7_unit == 8) ? " selected" : "";?>>8</option>
				<option value="9"<?php echo ($contact_film7_unit == 9) ? " selected" : "";?>>9</option>
				<option value="10"<?php echo ($contact_film7_unit == 10) ? " selected" : "";?>>10</option>
			</select>
		</li>
		<li>
			<p class="bold">踊る善福寺/ホームレスごっこ</p>
			<label for="contact_film1_kind">種別</label>
			<select name="contact_film1_kind" class="contact_film_kind" id="contact_film1_kind"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film1_kind) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film1_kind == 1) ? " selected" : ""; ?>>一般</option>
				<option value="2"<?php echo ($contact_film1_kind == 2) ? " selected" : "";?>>団体・ライブラリー</option>
			</select>
			<label for="contact_film1_unit">枚数</label>
			<select name="contact_film1_unit" class="contact_film_unit" id="contact_film1_unit"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film1_unit) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film1_unit == 1) ? " selected" : "";?>>1</option>
				<option value="2"<?php echo ($contact_film1_unit == 2) ? " selected" : "";?>>2</option>
				<option value="3"<?php echo ($contact_film1_unit == 3) ? " selected" : "";?>>3</option>
				<option value="4"<?php echo ($contact_film1_unit == 4) ? " selected" : "";?>>4</option>
				<option value="5"<?php echo ($contact_film1_unit == 5) ? " selected" : "";?>>5</option>
				<option value="6"<?php echo ($contact_film1_unit == 6) ? " selected" : "";?>>6</option>
				<option value="7"<?php echo ($contact_film1_unit == 7) ? " selected" : "";?>>7</option>
				<option value="8"<?php echo ($contact_film1_unit == 8) ? " selected" : "";?>>8</option>
				<option value="9"<?php echo ($contact_film1_unit == 9) ? " selected" : "";?>>9</option>
				<option value="10"<?php echo ($contact_film1_unit == 10) ? " selected" : "";?>>10</option>
			</select>

		</li>
		<li>
			<p class="bold">木田さんと原発、そして日本<br />- 日本語版</p>
			<label for="contact_film2_kind">種別</label>
			<select name="contact_film2_kind" class="contact_film_kind" id="contact_film2_kind"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film2_kind) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film2_kind == 1) ? " selected" : ""; ?>>一般</option>
				<option value="2"<?php echo ($contact_film2_kind == 2) ? " selected" : "";?>>団体・ライブラリー</option>
			</select>
			<label for="contact_film2_unit">枚数</label>
			<select name="contact_film2_unit" class="contact_film_unit" id="contact_film2_unit"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film2_unit) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film2_unit == 1) ? " selected" : "";?>>1</option>
				<option value="2"<?php echo ($contact_film2_unit == 2) ? " selected" : "";?>>2</option>
				<option value="3"<?php echo ($contact_film2_unit == 3) ? " selected" : "";?>>3</option>
				<option value="4"<?php echo ($contact_film2_unit == 4) ? " selected" : "";?>>4</option>
				<option value="5"<?php echo ($contact_film2_unit == 5) ? " selected" : "";?>>5</option>
				<option value="6"<?php echo ($contact_film2_unit == 6) ? " selected" : "";?>>6</option>
				<option value="7"<?php echo ($contact_film2_unit == 7) ? " selected" : "";?>>7</option>
				<option value="8"<?php echo ($contact_film2_unit == 8) ? " selected" : "";?>>8</option>
				<option value="9"<?php echo ($contact_film2_unit == 9) ? " selected" : "";?>>9</option>
				<option value="10"<?php echo ($contact_film2_unit == 10) ? " selected" : "";?>>10</option>
			</select>
		</li>
		<li>
			<p class="bold">木田さんと原発、そして日本<br />- 英語字幕版</p>
			<label for="contact_film3_kind">種別</label>
			<select name="contact_film3_kind" class="contact_film_kind" id="contact_film3_kind"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film3_kind) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film3_kind == 1) ? " selected" : ""; ?>>一般</option>
				<option value="2"<?php echo ($contact_film3_kind == 2) ? " selected" : "";?>>団体・ライブラリー</option>
			</select>
			<label for="contact_film3_unit">枚数</label>
			<select name="contact_film3_unit" class="contact_film_unit" id="contact_film3_unit"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film3_unit) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film3_unit == 1) ? " selected" : "";?>>1</option>
				<option value="2"<?php echo ($contact_film3_unit == 2) ? " selected" : "";?>>2</option>
				<option value="3"<?php echo ($contact_film3_unit == 3) ? " selected" : "";?>>3</option>
				<option value="4"<?php echo ($contact_film3_unit == 4) ? " selected" : "";?>>4</option>
				<option value="5"<?php echo ($contact_film3_unit == 5) ? " selected" : "";?>>5</option>
				<option value="6"<?php echo ($contact_film3_unit == 6) ? " selected" : "";?>>6</option>
				<option value="7"<?php echo ($contact_film3_unit == 7) ? " selected" : "";?>>7</option>
				<option value="8"<?php echo ($contact_film3_unit == 8) ? " selected" : "";?>>8</option>
				<option value="9"<?php echo ($contact_film3_unit == 9) ? " selected" : "";?>>9</option>
				<option value="10"<?php echo ($contact_film3_unit == 10) ? " selected" : "";?>>10</option>
			</select>
		</li>
		<li>
			<p class="bold">乙女ハウス</p>
			<label for="contact_film4_kind">種別</label>
			<select name="contact_film4_kind" class="contact_film_kind" id="contact_film4_kind"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film4_kind) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film4_kind == 1) ? " selected" : ""; ?>>一般</option>
				<option value="2"<?php echo ($contact_film4_kind == 2) ? " selected" : "";?>>団体・ライブラリー</option>
			</select>
			<label for="contact_film4_unit">枚数</label>
			<select name="contact_film4_unit" class="contact_film_unit" id="contact_film4_unit"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film4_unit) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film4_unit == 1) ? " selected" : "";?>>1</option>
				<option value="2"<?php echo ($contact_film4_unit == 2) ? " selected" : "";?>>2</option>
				<option value="3"<?php echo ($contact_film4_unit == 3) ? " selected" : "";?>>3</option>
				<option value="4"<?php echo ($contact_film4_unit == 4) ? " selected" : "";?>>4</option>
				<option value="5"<?php echo ($contact_film4_unit == 5) ? " selected" : "";?>>5</option>
				<option value="6"<?php echo ($contact_film4_unit == 6) ? " selected" : "";?>>6</option>
				<option value="7"<?php echo ($contact_film4_unit == 7) ? " selected" : "";?>>7</option>
				<option value="8"<?php echo ($contact_film4_unit == 8) ? " selected" : "";?>>8</option>
				<option value="9"<?php echo ($contact_film4_unit == 9) ? " selected" : "";?>>9</option>
				<option value="10"<?php echo ($contact_film4_unit == 10) ? " selected" : "";?>>10</option>
			</select>
		</li>
		<li>
			<p class="bold">さようならUR</p>
			<label for="contact_film5_kind">種別</label>
			<select name="contact_film5_kind" class="contact_film_kind" id="contact_film5_kind"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film5_kind) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film5_kind == 1) ? " selected" : ""; ?>>一般</option>
				<option value="2"<?php echo ($contact_film5_kind == 2) ? " selected" : "";?>>団体・ライブラリー</option>
			</select>
			<label for="contact_film5_unit">枚数</label>
			<select name="contact_film5_unit" class="contact_film_unit" id="contact_film5_unit"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film5_unit) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film5_unit == 1) ? " selected" : "";?>>1</option>
				<option value="2"<?php echo ($contact_film5_unit == 2) ? " selected" : "";?>>2</option>
				<option value="3"<?php echo ($contact_film5_unit == 3) ? " selected" : "";?>>3</option>
				<option value="4"<?php echo ($contact_film5_unit == 4) ? " selected" : "";?>>4</option>
				<option value="5"<?php echo ($contact_film5_unit == 5) ? " selected" : "";?>>5</option>
				<option value="6"<?php echo ($contact_film5_unit == 6) ? " selected" : "";?>>6</option>
				<option value="7"<?php echo ($contact_film5_unit == 7) ? " selected" : "";?>>7</option>
				<option value="8"<?php echo ($contact_film5_unit == 8) ? " selected" : "";?>>8</option>
				<option value="9"<?php echo ($contact_film5_unit == 9) ? " selected" : "";?>>9</option>
				<option value="10"<?php echo ($contact_film5_unit == 10) ? " selected" : "";?>>10</option>
			</select>
		</li>
		<li>
			<p class="bold">ブライアンと仲間たち</p>
			<label for="contact_film6_kind">種別</label>
			<select name="contact_film6_kind" class="contact_film_kind" id="contact_film6_kind"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film6_kind) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film6_kind == 1) ? " selected" : ""; ?>>一般</option>
				<option value="2"<?php echo ($contact_film6_kind == 2) ? " selected" : "";?>>団体・ライブラリー</option>
			</select>
			<label for="contact_film6_unit">枚数</label>
			<select name="contact_film6_unit" class="contact_film_unit" id="contact_film6_unit"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film6_unit) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film6_unit == 1) ? " selected" : "";?>>1</option>
				<option value="2"<?php echo ($contact_film6_unit == 2) ? " selected" : "";?>>2</option>
				<option value="3"<?php echo ($contact_film6_unit == 3) ? " selected" : "";?>>3</option>
				<option value="4"<?php echo ($contact_film6_unit == 4) ? " selected" : "";?>>4</option>
				<option value="5"<?php echo ($contact_film6_unit == 5) ? " selected" : "";?>>5</option>
				<option value="6"<?php echo ($contact_film6_unit == 6) ? " selected" : "";?>>6</option>
				<option value="7"<?php echo ($contact_film6_unit == 7) ? " selected" : "";?>>7</option>
				<option value="8"<?php echo ($contact_film6_unit == 8) ? " selected" : "";?>>8</option>
				<option value="9"<?php echo ($contact_film6_unit == 9) ? " selected" : "";?>>9</option>
				<option value="10"<?php echo ($contact_film6_unit == 10) ? " selected" : "";?>>10</option>
			</select>
		</li>
	</ul>
</div>
</div>

<div class="p2_t">
<div class="form_contents required">
	<div class="form_title">お支払方法</div>
	<ul class="form_elements">
		<li><input type="radio" name="contact_pay_way" id="contact_pay_way1" value="1" <?php echo ($contact_pay_way == 1) ? " checked" : ""; ?><?php echo $disabled; ?> /><label for="contact_pay_way1">銀行振込</label></li>
		<li><input type="radio" name="contact_pay_way" id="contact_pay_way2" value="2" <?php echo ($contact_pay_way == 2) ? " checked" : ""; ?><?php echo $disabled; ?> /><label for="contact_pay_way2">クレジットカード</label></li>
	</ul>
</div>
</div>

<div class="p2_t">
<div class="form_contents">
	<div class="form_title">
		<p>領収書が必要な方はチェックの上、<br />お宛名と但し書きを入力ください。</p>
	</div>
	<ul class="form_elements">
		<li><input type="checkbox" name="contact_receipt" id="contact_receipt" value="1"<?php echo ($contact_receipt) ? " checked" : ""; ?><?php echo $disabled; ?> /><label for="contact_receipt">領収書必要</label></li>
		<li><input type="text" name="contact_receipt_name" id="contact_receipt_name" placeholder="お宛名" value="<?php echo $contact_receipt_name;?>"<?php echo $disabled; ?> /></li>
		<li><input type="text" name="contact_receipt_proviso" id="contact_receipt_proviso" placeholder="但し書き" value="<?php echo $contact_receipt_proviso; ?>"<?php echo $disabled; ?> /></li>
	</ul>
</div>
</div>

