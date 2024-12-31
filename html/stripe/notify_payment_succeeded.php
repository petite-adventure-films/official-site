<?php
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();
define('STRIPE_SECRET_KEY', $_ENV['STRIPE_SECRET_KEY']);
define('STRIPE_WEBHOOK_SECRET', $_ENV['STRIPE_WEBHOOK_SECRET']);

function logError($e)
{
  $errorData = [
    'file' => $e->getFile(),
    'line' => $e->getLine(),
    'message' => $e->getMessage(),
    'trace' => $e->getTraceAsString(),
  ];
  error_log(json_encode($errorData));
  return $errorData;
}

function sendPaymentConfirmationEmail()
{
  $to = 'info@petiteadventurefilms.com';
  $subject = '支払い完了のお知らせ';
  $admin_email = 'info@petiteadventurefilms.com';
  $headers = 'From: ' . $admin_email . "\r\n" .
    'Content-Type: text/html; charset=UTF-8' . "\r\n" .
    'X-Mailer: PHP/' . phpversion();

  $message = '銀行振込のお支払いが完了しています。詳細を確認して配送を手配してください。';
  mail($to, $subject, $message, $headers);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SERVER['HTTP_STRIPE_SIGNATURE'])) {
  $payload = @file_get_contents('php://input');
  $sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'];
  $event = null;

  // Log payload and signature for debugging
  error_log('Payload: ' . $payload);
  error_log('Signature: ' . $sig_header);

  try {
    $event = \Stripe\Webhook::constructEvent(
      $payload,
      $sig_header,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (\UnexpectedValueException $e) {
    $errorData = logError($e);
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage(), 'details' => $errorData]);
    exit();
  } catch (\Stripe\Exception\SignatureVerificationException $e) {
    $errorData = logError($e);
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage(), 'details' => $errorData]);
    exit();
  }

  if ($event->type === 'checkout.session.completed') {
    sendPaymentConfirmationEmail();
    http_response_code(200);
    exit();
  }

  http_response_code(200);
  echo json_encode(['status' => 'success']);
  exit();
} else {
  $errorData = [
    'message' => 'Invalid request method or missing signature',
  ];
  error_log(json_encode($errorData));
  http_response_code(400);
  echo json_encode(['error' => 'Invalid request method or missing signature', 'details' => $errorData]);
  exit();
}
