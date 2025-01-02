<?php

function save_static_json(WP_REST_Request $request)
{
  // リクエストからデータを取得
  $data = $request->get_body();
  // リクエストからタイプを取得
  $type = $request->get_param('type');
  // プロジェクトディレクトリのパスを設定
  $project_dir = __DIR__ . '/../../../../../';
  // 保存先ディレクトリのパスを設定
  $dir_path = $project_dir . 'src/constants/static';
  // 保存するファイルのパスを設定
  $file_path = $dir_path . '/' . $type . '.json';

  // ディレクトリが存在しない場合は作成
  if (!file_exists($dir_path)) {
    if (!mkdir($dir_path, 0755, true)) {
      error_log('Failed to create directory: ' . $dir_path);
      return new WP_REST_Response('Failed to create directory', 500);
    }
  }

  // JSONデータが有効かどうかをチェック
  if (json_last_error() !== JSON_ERROR_NONE) {
    error_log('Invalid JSON data: ' . json_last_error_msg());
    return new WP_REST_Response('Invalid JSON data', 400);
  }

  // デバッグ用にファイルパスとデータをログに記録
  error_log('File path: ' . $file_path);
  error_log('Data: ' . $data);

  // ファイルにデータを書き込む
  if (file_put_contents($file_path, $data)) {
    return new WP_REST_Response('File saved successfully', 200);
  } else {
    error_log('Failed to save file at: ' . $file_path);
    return new WP_REST_Response('Failed to save file', 500);
  }
}
