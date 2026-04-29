<?
function verify_recaptcha(string $token): bool
{
  $response = wp_remote_post('https://www.google.com/recaptcha/api/siteverify', [
    'body' => [
      'secret'   => RECAPTCHA_SECRET_KEY,
      'response' => $token,
    ],
  ]);

  if (is_wp_error($response)) {
    return false;
  }

  $body = json_decode(wp_remote_retrieve_body($response), true);
  return !empty($body['success']) && $body['score'] >= 0.5;
}

function contact_ntfct($req)
{
  $recaptcha_token = $req['recaptchaToken'] ?? '';
  if (!verify_recaptcha($recaptcha_token)) {
    return new WP_REST_Response('reCAPTCHA verification failed', 400);
  }

  $email = $req['email'];
  $name = $req['name'];
  $message = $req['message'];

  // 置き換え用の配列を作成
  $replacements = [
    '{name}' => $name,
    '{message}' => $message,
    '{email}' => $email
  ];

  // テンプレートファイルを読み込んで置き換え
  $template_path = __DIR__ . '/../text/contact.txt';
  $signature = file_get_contents(__DIR__ . '/../text/signature.txt');
  $body = replace_text_for_mail($template_path, $replacements);
  $body .=  "\n\n" . $signature;

  if ($body === false) {
    return new WP_REST_Response('Failed to load email template', 500);
  }

  $subject = "【プチ・アドベンチャー・フィルムズ】お問い合わせ受付のお知らせ";

  wp_mail($email, $subject, $body, mail_header(get_bloginfo("admin_email")));
  wp_mail("petiteadventurefilms@gmail.com", $subject, $body, mail_header($email));

  return new WP_REST_Response(null, 200);
}

/**
 * ブログ記事一覧の詳細を取得
 */
add_action('rest_api_init', 'register_contact_api');
function register_contact_api()
{
  register_rest_route(
    'wp/v2',
    'contact',
    [
      'methods'  =>  'POST',
      'callback' => 'contact_ntfct'
    ],
    true
  );
}
