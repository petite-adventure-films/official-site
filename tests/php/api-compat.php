<?php
// Offline regression checks. No WordPress database, mail, or payment calls.
error_reporting(E_ALL);
set_error_handler(function ($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});
function add_action(...$args) {}
function get_option($name) { return 10; }
function get_post($id) { return null; }
function wp_remote_post(...$args) { return []; }
function is_wp_error($response) { return false; }
function wp_remote_retrieve_body($response) { return '{"success":true}'; }
define('RECAPTCHA_SECRET_KEY', 'offline-placeholder');
class WP_REST_Response {
    public $data;
    public $status;
    function __construct($data, $status) { $this->data = $data; $this->status = $status; }
}
class WP_Query {
    static $lastArgs;
    function __construct($args) { self::$lastArgs = $args; }
    function get_posts() { return []; }
    function have_posts() { return false; }
}
$theme = __DIR__ . '/../../html/wp/wp-content/themes/petiteadventurefilms';
require $theme . '/lib/get_data.php';
require $theme . '/lib/format_date.php';
foreach (glob($theme . '/api/*.php') as $file) { require $file; }
$checks = 0;
function check($condition, $label) {
    global $checks;
    if (!$condition) { throw new RuntimeException($label); }
    $checks++;
}
$_GET = [];
foreach (['get_values_blog', 'get_values_channel', 'get_values_media', 'get_values_news'] as $fn) {
    check($fn()->status === 404, $fn . ' empty response');
    check(WP_Query::$lastArgs['posts_per_page'] === 10, $fn . ' default page size');
}
foreach (['get_values_blog_detail', 'get_values_dvd_detail', 'get_values_channel_detail', 'get_values_media_detail', 'get_values_events_detail'] as $fn) {
    check($fn()->status === 400, $fn . ' missing identifier');
}
$_GET = ['pageId' => [], 'pageName' => []];
foreach (['get_values_blog_detail', 'get_values_dvd_detail', 'get_values_channel_detail', 'get_values_media_detail', 'get_values_events_detail'] as $fn) {
    check($fn()->status === 400, $fn . ' array identifier');
}
$_GET = ['page' => '2', 'per_page' => '25', 'tag' => 'film', 'post__not_in' => '123'];
get_values_blog();
check(WP_Query::$lastArgs['paged'] === '2', 'explicit page preserved');
check(WP_Query::$lastArgs['posts_per_page'] === '25', 'explicit page size preserved');
check(WP_Query::$lastArgs['tag'] === 'film', 'explicit tag preserved');
check(WP_Query::$lastArgs['post__not_in'] === ['123'], 'excluded post preserved');
$_GET = [];
check(get_values_events()->data === ['data' => []], 'no events');
check(get_values_events_archive()->status === 404, 'default archive year');
$_GET = ['year' => []];
check(get_values_events_archive()->status === 400, 'array archive year');
$_GET = ['year' => 'not-a-year'];
check(get_values_events_archive()->status === 400, 'invalid archive year');
check(catch_that_image(999) === false, 'missing post thumbnail');
$GLOBALS['post'] = (object) ['post_content' => 'No image'];
check(catch_that_image() === false, 'no inline image');
$GLOBALS['post'] = (object) ['post_content' => '<img src="sample.jpg">'];
check(catch_that_image() === 'sample.jpg', 'inline image');
check(verify_recaptcha('offline-token') === false, 'missing recaptcha score');
check(format_date('20261021') === '2026/10/21', 'date formatting');
echo "PASS: $checks checks on PHP " . PHP_VERSION . "\n";
