<?php
/*
Plugin Name: Bulk Registration Terms
Plugin URI: http://www.560designs.com/memo/bulk-registration-terms.html
Description: タームを一括登録します。
Version: 1.0
Author: Yuya Hoshino
Author URI: http://560designs.com/
License: GPL2
*/

/*  Copyright 2012 Yuya Hoshino (email : y.hoshinox@gmail.com)

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License, version 2, as
	published by the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/


function bulk_registration_terms_admin() {
	global $wpdb;
	if ( $_POST['mode'] == 'add' ) {
		$error = '';
		$updated = '';

		if ( empty ( $_POST['taxonomy'] ) )
			$error .= '<p>タクソノミー名が選択されていません。</p>';

		if ( empty ( $_POST['term'] ) ) {
			$error .= '<p>追加するタームが入力されていません。</p>';
		} else {
			$flag = false;
			$add_terms = array ();
			$term_arr = explode ( "\n", $_POST['term'] );

			if ( !is_array ( $term_arr ) )
				$term_arr[] = $_POST['term'];

			foreach ( $term_arr as $row ) {
				$row = trim ( $row );
				if ( preg_match ( '/^[^ \n\t]+\t[^ \n\t]+/', $row ) ) {
					$add_terms[] = explode ( "\t", $row );
					$flag = true;
				}
			}

			if ( !$flag )
				$error .= '<p>追加するタームのフォーマットが正しくありません。</p>';
		}

		if ( !$error ) {
			if ( count ( $add_terms ) > 0 ) {
				$i = 1;
				foreach ( $add_terms as $add_term ) {
					$args = array (
						'slug' => $add_term[0]
					);

					if ( $_POST['parent'] )
						$args['parent'] = $_POST['parent'];

					$result = wp_insert_term( $add_term[1], $_POST['taxonomy'], $args );

					if ( !is_object( $result ) && !empty ( $_POST['menu_order'] ) ) {
						$term_id = $result['term_id'];
						$wpdb->query( $wpdb->prepare( "UPDATE $wpdb->terms SET menu_order = %d WHERE term_id = %d", $i, $term_id ) );
					}
					$i++;
				}
			}
		}

		if ( $result )
			$updated = '<p>追加しました。</p>';
	}
?>
<div class="wrap">
<div id="icon-themes" class="icon32">&nbsp;</div><h2>ターム一括登録</h2>
<?php
	if ( $error )
		echo '<div class="error">'  . $error . '</div>';
	if ( $updated )
		echo '<div class="updated">'  . $updated . '</div>';
?>
<h3>タームを一括登録します。</h3>
<form method="post" action="?page=bulk_registration_terms">
<table class="form-table">
<tr valign="top">
<th scope="row"><label for="fTaxonomy">タクソノミー名</label></th>
<td>
<select name="taxonomy" id="fTaxonomy">
<option value=""></option>
<?php
	$args = array (
		'public' => true
	);
	$taxonomies = get_taxonomies( $args );

	$taxonomy_arr = array ();
	foreach ( $taxonomies as $taxonomy ) {
		$taxonomy_arr[] = $taxonomy;
		echo '<option value="' . $taxonomy . '">' . $taxonomy . "</option>\n";
	}
?>
</select>
</td>
</tr>
<tr valign="top">
<th scope="row"><label for="fParent">親ターム名</label></th>
<td>
<script type="text/javascript">
jQuery(function($) {
	$('select[name="taxonomy"]').change(function() {

		console.log("works");
<?php
	$args = array (
		'get' => 'all',
		'hide_empty' => false,
		'orderby' => 'menu_order',
	);



	foreach ( $taxonomy_arr as $taxonomy ) {
		echo "var " . $taxonomy . " = '';\n";
		$terms = get_terms( $taxonomy, $args );
		foreach ( $terms as $term ) {
			echo $taxonomy . " += '<option value=\"" . $term->term_id . "\">" . $term->name . "</option>';\n";
		}
?>
		if ($(this).attr('value') == '<?php echo $taxonomy; ?>') {
			$('select[name="parent"]').html('<option value=""></option>');
			$('select[name="parent"]').append(<?php echo $taxonomy; ?>);
		}
<?php
	}
?>
	});
});
</script>
<select name="parent" id="fParent">
<option value=""></option>
</select>
</td>
</tr>
<tr valign="top">
<th scope="row"><label for="fTerm">追加するターム</label></th>
<td>
<textarea name="term" cols="50" rows="20" type="text" id="fTerm"></textarea><br />
<span class="description">「term_slug」と「term_name」をタブで区切って改行</span>
</td>
</tr>
<tr valign="top">
<th scope="row">× Term Menu Order</th>
<td>
<input type="checkbox" name="menu_order" value="1" id="fMenu_order" />
<label for="fMenu_order">「Term Menu Order」を使っている</label><br />
<span class="description">「追加するターム」の順番が適用されます。</span>
</td>
</tr>
</table>
<p class="submit"><input type="submit" value="登録する" class="button-primary"></p>
<input type="hidden" name="mode" value="add" />
</form>
<!-- .wrap --></div>
<?php
}


function bulk_registration_terms_menu() {
	add_menu_page( 'Bulk Registration Terms', 'Bulk Registration Terms', 10, 'bulk_registration_terms', 'bulk_registration_terms_admin', '' );
}
add_action( 'admin_menu', 'bulk_registration_terms_menu' );
?>
