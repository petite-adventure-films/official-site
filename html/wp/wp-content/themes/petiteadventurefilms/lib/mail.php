<?

function mail_header($from = NULL)
{
  $headers = "";
  $headers .= "X-Mailer: myphpMail" . phpversion() . "\n";
  if ($from) {
    $headers .= "From: " . $from . "\r\n";
    $headers .= "Reply-To: " . $from . "\r\n";
    $headers .= "Return-Path: " . $from . "\r\n";
  }
  return $headers;
}

function replace_text_for_mail($file_path, $replacements)
{

  // ファイルの内容を読み込む
  $template = file_get_contents($file_path);
  if ($template === false) {
    return false; // ファイルが読み込めなかった場合
  }

  // プレースホルダーを置き換える
  foreach ($replacements as $placeholder => $value) {
    $template = str_replace($placeholder, $value, $template);
  }

  return $template;
}
