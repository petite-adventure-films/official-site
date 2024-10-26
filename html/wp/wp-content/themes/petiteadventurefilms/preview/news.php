<div class="flex">
  <div class="w-1/2 max-w-screen-sm min-h-dvh px-4 pt-8 pb-8 sm:px-16">
    <?php
    if ($query->have_posts()) {
      while ($query->have_posts()) {
        $query->the_post();
    ?>
        <h3><span class="font-bold"><?php the_title(); ?></span></h3>
        <div class="mt-2 [&amp;_p:has(iframe)]:aspect-video [&amp;_iframe]:w-full [&amp;_iframe]:h-full [&amp;_a]:link-text [&amp;_img]:mt-2"><? echo wpautop(html_entity_decode(get_the_content()), true) ?></div>
        <div><time class="block mt-2 text-xs text-gray-500" datetime="<?= get_the_date() ?>"><?= get_the_date() ?></time></div>

  </div>
<? }
    }
?>
</div>