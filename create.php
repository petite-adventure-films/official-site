<?php

require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

require_once(__DIR__ . '/stripe-php/init.php');

// This is your test secret API key.
\Stripe\Stripe::setApiKey('sk_test_51H8OJOKluK1zP0j9wWm49GVBmqnK8hC3jV5t7FTrvYPSaFrle6LoYZYqimZKNtJFedfCOQsiblO6iasmKOqJZIly007h5ogvGf');

function calculateOrderAmount(): int {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return 1400;
}

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
        'automatic_payment_methods' => [
            'enabled' => true,
        ],
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