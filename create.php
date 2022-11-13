<?php

require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

require_once(__DIR__ . '/stripe-php/init.php');

define('API_KEY', $_ENV['STRIPE_SECRET_KEY']);

\Stripe\Stripe::setApiKey(API_KEY);

header('Content-Type: application/json');

try {
    // retrieve JSON from POST body
    $jsonStr = file_get_contents('php://input');
    $jsonObj = json_decode($jsonStr);

    $customer = \Stripe\Customer::create(); 

    // Create a PaymentIntent with amount and currency
    $paymentIntent = \Stripe\PaymentIntent::create([
        'customer' => $customer->id,
        'amount' => $jsonObj->amount,
        'currency' => 'jpy',
        'payment_method_types' => ['card'],
        'receipt_email' => $jsonObj->receipt_email,
        'metadata' => ['order_id' => $jsonObj->order_id]
    ]);

    $output = [
        'clientSecret' => $paymentIntent->client_secret,
    ];

    echo json_encode($output);
} catch (Error $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}