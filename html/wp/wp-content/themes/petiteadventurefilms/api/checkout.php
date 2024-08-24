<?
function checkout_ntfct($req)
{

  $basket = $req['basket'];
  $subtotal = $req['subTotal'];
  $shipping_fee = $req['shippingFee'];
  $customer_info = $req['customerInfo'];
  $email = $customer_info['email'];

  // アイテムのリストを作成
  $template_path_item = __DIR__ . '/../text/checkout_item.txt';
  $items = '';
  foreach ($basket as $item) {
    $replacements = [
      '{title}' => $item['title'],
      '{type}' => $item['type'],
      '{disc}' => $item['disc'],
      '{amount}' => number_format($item['amount']),
      '{unit}' => $item['unit'],
    ];
    if ($items !== '') {
      $items .= "\n";
    }
    $items .= replace_text_for_mail($template_path_item, $replacements);
  }

  // お支払い方法を作成
  $payment = '';
  if ($customer_info['paymentMethod'] === 'bank_transfer') {
    $payment = '銀行振込';
    $payment .= file_get_contents(__DIR__ . '/../text/checkout_bank_info.txt');
  } else {
    $payment = 'クレジットカード';
  }

  // 顧客のレシート必要かどうかを作成
  $receipt = '';
  $template_path_receipt = __DIR__ . '/../text/checkout_receipt.txt';
  if ($customer_info['receipt']) {
    $replacements = [
      '{receiptName}' => $customer_info['receiptName'] ? $customer_info['receiptName'] : '（入力なし）',
      '{receiptDescription}' => $customer_info['receiptDescription'] ? $customer_info['receiptDescription'] : '（入力なし）',
    ];
    $receipt = '必要';
    $receipt .= "\n" . replace_text_for_mail($template_path_receipt, $replacements);
  } else {
    $receipt = '不要';
  }

  // 置き換え用の配列を作成
  $replacements = [
    '{items}' => $items,
    '{subtotal}' => number_format($subtotal),
    '{shippingFee}' => $shipping_fee,
    '{total}' => number_format($subtotal + $shipping_fee),
    '{receipt}' => $receipt,
    '{payment}' => $payment,
    '{name}' => $customer_info['name'],
    '{zipcode}' => $customer_info['zipcode'],
    '{address1}' => $customer_info['address1'],
    '{address2}' => $customer_info['address2'],
    '{tel}' => $customer_info['tel'],
  ];

  // テンプレートファイルを読み込んで置き換え
  $template_path = __DIR__ . '/../text/checkout.txt';
  $signature = file_get_contents(__DIR__ . '/../text/signature.txt');
  $body = replace_text_for_mail($template_path, $replacements);
  $body .= "\n\n" . $signature;

  if ($body === false) {
    return new WP_REST_Response('Failed to load email template', 500);
  }

  $subject = "【プチ・アドベンチャー・フィルムズ】ご注文内容の確認";

  // $admin_mail_result = false;
  $admin_mail_result = wp_mail($email, $subject, $body, mail_header(get_bloginfo("admin_email")));
  // $mail_result = true;
  $mail_result = wp_mail("petiteadventurefilms@gmail.com", $subject, $body, mail_header($email));
  $code = 200;
  if (!$admin_mail_result || !$mail_result) {
    $code = 500;
  }
  return new WP_REST_Response(null, $code);
}

/**
 * ブログ記事一覧の詳細を取得
 */
add_action('rest_api_init', 'register_checkout_api');
function register_checkout_api()
{
  register_rest_route(
    'wp/v2',
    'checkout',
    [
      'methods'  =>  'POST',
      'callback' => 'checkout_ntfct'
    ],
    true
  );
}
