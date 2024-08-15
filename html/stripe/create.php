<?php
require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();
define('STRIPE_SECRET_KEY', $_ENV['STRIPE_SECRET_KEY']);
define('IS_DEV', $_ENV['IS_DEV']);

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
  $stripe = new \Stripe\StripeClient(STRIPE_SECRET_KEY);

  $jsonStr = file_get_contents('php://input');
  $jsonObj = json_decode($jsonStr);

  // Create a PaymentIntent with amount and currency
  $paymentIntent = $stripe->paymentIntents->create([
    'amount' => $jsonObj->amount,
    'currency' => 'jpy',
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    'automatic_payment_methods' => [
      'enabled' => true,
    ],
  ]);

  $output = [
    'clientSecret' => $paymentIntent->client_secret,
  ];

  echo json_encode($output);
} catch (Error $e) {
  $message = $e->getFile() . ' ' . $e->getLine() . ' ' . $e->getMessage();
  error_log($message);
  http_response_code(500);
  echo json_encode(['error' => $e->getMessage()]);
}
