<?php
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();
define('STRIPE_SECRET_KEY', $_ENV['STRIPE_SECRET_KEY']);
define('IS_DEV', $_ENV['IS_DEV']);
define('BASE_URL', $_ENV['BASE_URL']);

// CORS対策
if (IS_DEV) {
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
  header('Content-Type: application/json');

  if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
  }
}

try {

  \Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);
  header('Content-Type: application/json');

  $jsonStr = file_get_contents('php://input');
  $jsonObj = json_decode($jsonStr, true);

  $stripe = new \Stripe\StripeClient(STRIPE_SECRET_KEY);
  $customer = $stripe->customers->create();

  $checkout_session = \Stripe\Checkout\Session::create([
    'customer' => $customer->id,
    'billing_address_collection' => 'required',
    'shipping_address_collection' => ['allowed_countries' => ['JP']],
    'shipping_options' => [
      [
        'shipping_rate_data' => [
          'type' => 'fixed_amount',
          'fixed_amount' => [
            'amount' =>  $jsonObj['shipping_fee'],
            'currency' => 'jpy',
          ],
          'display_name' => 'クリックポスト等',
        ],
      ],
    ],
    'line_items' => $jsonObj['items'],
    'mode' => 'payment',
    'payment_method_types' => [
      'card',
      // 'customer_balance',
      // 'konbini'
    ],
    // 'payment_method_options' => [
    //   'customer_balance' => [
    //     'funding_type' => 'bank_transfer',
    //     'bank_transfer' => [
    //       'type' => 'jp_bank_transfer'
    //     ],
    //   ],
    //   'konbini' => [
    //     'expires_after_days' => 3
    //   ],
    // ],
    'success_url' => BASE_URL . 'pafshop/thanks/',
    'cancel_url' => BASE_URL . 'pafshop/cancel/',
  ]);
  http_response_code(200);
  echo json_encode(['url' => $checkout_session->url]);
} catch (Exception $e) {
  $errorData = [
    'file' => $e->getFile(),
    'line' => $e->getLine(),
    'message' => $e->getMessage(),
    'trace' => $e->getTraceAsString(),
  ];
  error_log(json_encode($errorData));
  http_response_code(500);
  echo json_encode(['error' => $e->getMessage(), 'details' => $errorData]);
}
