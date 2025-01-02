<!DOCTYPE html>
<html lang="ja">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/yakuhanjp@4.1.1/dist/css/yakuhanjp.css">
  <meta name="robots" content="noindex, nofollow">
  <title>静的化</title>
</head>

<body style="font-family: YakuHanJP, sans-serif;">
  <div class="max-w-md mx-auto mt-10 pt-6 bg-white">
    <h1 class="text-2xl font-bold mb-4">データ取得ツール</h1>
    <p class="text-gray-700 mb-4">指定の投稿タイプのデータを取得し、JSONファイルとしてダウンロードします。</p>
  </div>
  <form id="fetchForm" class="max-w-md mx-auto mt-4 bg-white">
    <div class="mb-4">
      <label for="type" class="block text-gray-700 text-sm font-bold mb-2">投稿タイプ</label>
      <select id="type" name="type" class="appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
        <option value="news">お知らせ</option>
      </select>
    </div>
    <div class="flex items-center justify-between">
      <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 focus:outline-none focus:shadow-outline">データを取得</button>
    </div>
  </form>
  <div id="message" class="max-w-md mx-auto mt-4 bg-white text-green-700"></div>

  <script>
    document.getElementById('fetchForm').addEventListener('submit', async function(event) {
      event.preventDefault();
      const type = document.getElementById('type').value;
      const messageDiv = document.getElementById('message');
      if (type) {
        const response = await fetch(`/wp/wp-json/wp/v2/${type}?archive=true&per_page=-1`);
        const postData = await response.json();

        const blob = new Blob([JSON.stringify(postData, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}.json`;
        a.click();
        URL.revokeObjectURL(url);
        messageDiv.textContent = `${type}.jsonが正常にダウンロードされました。`;
      }
    });
  </script>
</body>

</html>