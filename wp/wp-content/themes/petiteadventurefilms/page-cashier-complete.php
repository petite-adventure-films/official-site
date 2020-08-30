<?php
/*
Template Name: Cashier complete
*/

$data=json_decode(file_get_contents('php://input'),1);

file_put_contents('abc.txt', print_r($data, true), FILE_APPEND);

global $wpdb, $user_ID;

if($data){

    date_default_timezone_set('Asia/Tokyo');

    $post_type =  'dvdorder';

    $submit_date = date('mdH', time()); //送信タイム
    $post_title = cms_title($post_type, $submit_date, 'J');

    $insert_arg = array(
          'post_status' => 'pending'
        , 'post_title' => $post_title
        , 'comment_status' => 'closed'
        , 'post_type' => $post_type
    );
    $insert_id = wp_insert_post($insert_arg);
    file_put_contents('abc.txt', print_r($insert_id, true), FILE_APPEND);

    if($insert_id){

        foreach($data['order'] as $order){
            add_post_meta($insert_id, 'order_info_17', $order);
        }
        add_post_meta($insert_id, 'order_info_18', $data['total']);
        add_post_meta($insert_id, 'order_info_13', $data['paymentMethod']);
        add_post_meta($insert_id, 'order_info_14', $data['receipt']);
        add_post_meta($insert_id, 'order_info_15', $data['receiptName']);
        add_post_meta($insert_id, 'order_info_16', $data['receiptDescription']);

        $data['id'] = $post_title;
        
		order_ntfct2($data);
        
    }
    
}

header("Content-Type: application/json; charset=utf-8");
