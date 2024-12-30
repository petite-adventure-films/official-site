<?php
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();
define('STRIPE_SECRET_KEY', $_ENV['STRIPE_SECRET_KEY']);
define('STRIPE_WEBHOOK_SECRET', $_ENV['STRIPE_WEBHOOK_SECRET']);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SERVER['HTTP_STRIPE_SIGNATURE'])) {
  $payload = @file_get_contents('php://input');
  $sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'];
  $event = null;

  try {
    $event = \Stripe\Webhook::constructEvent(
      $payload,
      $sig_header,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (\UnexpectedValueException $e) {
    http_response_code(400);
    exit();
  } catch (\Stripe\Exception\SignatureVerificationException $e) {
    http_response_code(400);
    exit();
  }

  if ($event->type === 'payment_intent.succeeded') {
    $paymentIntent = $event->data->object;

    // Send email notification formatted like Stripe receipt
    $to = $paymentIntent->charges->data[0]->billing_details->email;
    $subject = '支払い確認';
    $admin_email = 'info@petiteadventurefilms.com';
    $headers = 'From: ' . $admin_email . "\r\n" .
      'Reply-To: ' . $admin_email . "\r\n" .
      'Content-Type: text/html; charset=UTF-8' . "\r\n" .
      'X-Mailer: PHP/' . phpversion();

    $message = '
    <html>
    <head>
      <title>支払い確認</title>
    </head>
    <body>
      <h1>支払い確認</h1>
      <p>お支払いありがとうございます。詳細は以下の通りです：</p>
      <table>
      <tr>
        <th>金額</th><td>' . number_format($paymentIntent->amount_received / 100, 2) . ' ' . strtoupper($paymentIntent->currency) . '</td>
      </tr>
      <tr>
        <th>説明</th><td>' . $paymentIntent->description . '</td>
      </tr>
      <tr>
        <th>支払い方法</th><td>' . $paymentIntent->charges->data[0]->payment_method_details->type . '</td>
      </tr>
      <tr>
        <th>領収書URL</th><td><a href="' . $paymentIntent->charges->data[0]->receipt_url . '">領収書を見る</a></td>
      </tr>
      </table>
    </body>
    </html>';

    mail($to, $subject, $message, $headers);
  }

  http_response_code(200);
  exit();
}
