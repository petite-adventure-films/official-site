<?php

$data=json_decode(file_get_contents('php://input'), 1);

global $wpdb, $user_ID;

if($data){

    $post_type =  'dvdorder';

    $insert_arg = array(
          'post_status' => 'pending'
        , 'post_title' => $data['orderID']
        , 'comment_status' => 'closed'
        , 'post_type' => $post_type
    );
    $insert_id = wp_insert_post($insert_arg);

    if($insert_id){

        order_ntfct2($data);
        
        add_post_meta($insert_id, 'order_info_21', $data['deliveryFee']);
        add_post_meta($insert_id, 'order_info_19', $data['subtotal']);
        add_post_meta($insert_id, 'order_info_20', $data['total']);
        add_post_meta($insert_id, 'order_info_13', $data['paymentMethod']);
        add_post_meta($insert_id, 'order_info_14', $data['receipt']);
        add_post_meta($insert_id, 'order_info_15', $data['receiptName']);
        add_post_meta($insert_id, 'order_info_16', $data['receiptDescription']);
        
        $data['paymentMethod'] = ($data['paymentMethod'] == 1) ? '銀行振込' : 'クレジットカード';
        
        foreach($data['order'] as $order){
            add_post_meta($insert_id, 'order_info_22', $order);
        }
        
    }
    
}

header("Content-Type: application/json; charset=utf-8");
