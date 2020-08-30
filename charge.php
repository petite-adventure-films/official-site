<?php
require_once(__DIR__ . '/stripe-php/init.php');

define('API_KEY', 'sk_test_51H8OJOKluK1zP0j9wWm49GVBmqnK8hC3jV5t7FTrvYPSaFrle6LoYZYqimZKNtJFedfCOQsiblO6iasmKOqJZIly007h5ogvGf');

\Stripe\Stripe::setApiKey(API_KEY);

$data=json_decode(file_get_contents('php://input'),1);

file_put_contents('abc.txt', print_r($_POST, true), FILE_APPEND);

try {
    $charge = \Stripe\Charge::create([
        'amount' => $data['amount'],
        'currency' => 'jpy',
        'source' => $data['token'],
        'metadata' => ['orderID' => $data['orderID']],
    ]);

    echo 'success';
} catch (\Stripe\Exception\RateLimitException $e) {
    // Too many requests made to the API too quickly
    handleException($e);
} catch (\Stripe\Exception\InvalidRequestException $e) {
    // Invalid parameters were supplied to Stripe's API
    handleException($e);
} catch (\Stripe\Exception\AuthenticationException $e) {
    // Authentication with Stripe's API failed
    // (maybe you changed API keys recently)
    handleException($e);
} catch (\Stripe\Exception\ApiConnectionException $e) {
    // Network communication with Stripe failed
    handleException($e);
} catch (\Stripe\Exception\ApiErrorException $e) {
    // Display a very generic error to the user, and maybe send
    // yourself an email
    handleException($e);
} catch (Exception $e) {
    // Something else happened, completely unrelated to Stripe
    throw $e;
}

function handleException($e)
{
    $error = 'Status is:' . $e->getHttpStatus();
    $error .= ', Type is:' . $e->getError()->type;
    $error .= ', Code is:' . $e->getError()->code;
    $error .= ', Param is:' . $e->getError()->param;
    $error .= ', Message is:' . $e->getError()->message;
    error_log($error);

    http_response_code($e->getHttpStatus());
    echo 'error';
}
