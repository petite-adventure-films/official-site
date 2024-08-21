<div class="flex">
  <div class="w-1/2 max-w-screen-sm min-h-dvh px-4 pt-8 pb-8 sm:px-16">
    <?php
    if ($query->have_posts()) {
      while ($query->have_posts()) {
        $query->the_post();

        $post_type = get_post_type($post);
        $post_type_obj = get_post_type_object($post_type);

        $categories = get_the_terms($post, 'category');
        $filmtags = get_the_terms($post, 'filmtags');
        $eventtags = get_the_terms($post, 'eventtags');
    ?>
        <header>
          <nav aria-label="Breadcrumb" class="mb-2">
            <ul class="flex gap-1 flex-wrap text-xs text-gray-500 [&amp;_li]:flex [&amp;_li]:gap-1 [&amp;_li]:items-center">
              <li><a href="/?op=skip" class="link-text">HOME</a><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                </svg></li>
              <li><a href="/<? echo $post_type_obj->name; ?>/" class="link-text"><? echo $post_type_obj->label; ?>
                </a><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                </svg></li>
            </ul>
          </nav>

          <!-- 'id' => get_the_ID(),
    'title' => get_the_title(),
    'name' => get_post_field('post_name', get_the_ID()),
    'published' => get_the_date(),
    'updated' => get_the_modified_date(),
    'recommended' => get_post_meta(get_the_ID(), 'recommend', true),
    'film_tags' => get_the_terms(get_the_ID(), 'filmtags'),
    'event_tags' => get_the_terms(get_the_ID(), 'eventtags'),
    'categories' => get_the_terms(get_the_ID(), 'category'),
    'thumbnail' => get_the_post_thumbnail_url(get_the_ID()),
     -->
          <? if (get_post_meta(get_the_ID(), 'recommend', true)) { ?>
            <span class="mb-1">⭐️</span>
          <? } ?>
          <? if (!empty($filmtags) || !empty($eventtags)) { ?>
            <div class="flex justify-between items-center gap-2 mb-1">
              <div class="flex flex-wrap gap-2">
                <? if (!empty($filmtags)) { ?>
                  <div class="flex flex-wrap gap-2">
                    <? foreach ($filmtags as $filmtag) { ?>
                      <span class="bg-purple-100 text-purple-600 text-xs px-1.5 py-0.5"><?= $filmtag->name ?></span>
                    <? } ?>
                  </div>
                <? } ?>
                <? if (!empty($eventtags)) { ?>
                  <div class="flex flex-wrap gap-2">
                    <? foreach ($eventtags as $eventtag) { ?>
                      <span class="bg-cyan-100 text-cyan-600 text-xs px-1.5 py-0.5"><?= $eventtag->name ?></span>
                    <? } ?>
                  </div>
                <? } ?>
              </div>
            </div>
          <? } ?>
          <h2 class="text-xl font-bold"><?php the_title(); ?></h2>
        </header>
        <div class="mt-8">
          <? if (get_post_meta(get_the_ID(), "media_info_04", TRUE)) { ?>
            <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/<?= get_post_meta(get_the_ID(), "media_info_04", TRUE) ?>" frameborder="0" allowfullscreen></iframe>
          <? } ?>
          <div class="flex flex-wrap gap-x-2 mt-2 text-xs">
            <? foreach ($categories as $category) { ?>
              <span class="before:content-['#'] before:pr-[1px]"><?= $category->name ?></span>
            <? } ?>
          </div>
          <div class="mt-8 [&amp;_p:has(iframe)]:aspect-video [&amp;_iframe]:w-full [&amp;_iframe]:h-full [&amp;_a]:link-text [&amp;_img]:mt-2">
            <? the_content(); ?>
          </div>
          <div class="mt-8">
            <time class="block mt-2 text-xs text-gray-500"><?= get_the_date() ?></time>
          </div>
        </div>
  </div>
  <div class="w-1/2 max-w-screen-sm px-4 pt-8 pb-8 sm:px-16">
    <div href="#" class="relative block border border-black sm:hover:bg-gray-100">
      <? if (get_the_post_thumbnail_url(get_the_ID())) { ?>
        <div class="bg-white border-b border-black">
          <img src="<?= get_the_post_thumbnail_url(get_the_ID()) ?>" alt="">
        </div>
      <? } ?>
      <div class="p-4">
        <? if (get_post_meta(get_the_ID(), 'recommend', true)) { ?>
          <span class="mb-1">⭐️</span>
        <? } ?>
        <? if (!empty($filmtags) || !empty($eventtags)) { ?>
          <div class="flex justify-between items-center gap-2 mb-1">
            <div class="flex flex-wrap gap-2">
              <? if (!empty($filmtags)) { ?>
                <div class="flex flex-wrap gap-2">
                  <? foreach ($filmtags as $filmtag) { ?>
                    <span class="bg-purple-100 text-purple-600 text-xs px-1.5 py-0.5"><?= $filmtag->name ?></span>
                  <? } ?>
                </div>
              <? } ?>
              <? if (!empty($eventtags)) { ?>
                <div class="flex flex-wrap gap-2">
                  <? foreach ($eventtags as $eventtag) { ?>
                    <span class="bg-cyan-100 text-cyan-600 text-xs px-1.5 py-0.5"><?= $eventtag->name ?></span>
                  <? } ?>
                </div>
              <? } ?>
            </div>
          </div>
        <? } ?>
        <h3><span class="font-bold"><?php the_title(); ?></span><!----></h3><!---->
        <div class="flex flex-wrap gap-x-2 mt-2 text-xs">
          <? foreach ($categories as $category) { ?>
            <span class="before:content-['#'] before:pr-[1px]"><?= $category->name ?></span>
          <? } ?>
        </div>
        <div class="mt-2 text-xs text-gray-500"><time date-time="<?= get_the_date() ?>"><?= get_the_date() ?></time></div>
      </div>
    </div>
  </div>
<? }
    }
?>
</div>