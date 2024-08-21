<div class="flex">
  <div class="w-1/2 max-w-screen-sm min-h-dvh px-4 pt-8 pb-8 sm:px-16">
    <?php
    if ($query->have_posts()) {
      while ($query->have_posts()) {
        $query->the_post();

        $post_type = get_post_type($post);
        $post_type_obj = get_post_type_object($post_type);

        $filmtags = get_the_terms($post, 'filmtags');
        $eventtags = get_the_terms($post, 'eventtags');
    ?>
        <header>
          <nav aria-label="Breadcrumb" class="mb-2">
            <ul class="flex gap-1 flex-wrap text-xs text-gray-500 [&_li]:flex [&_li]:gap-1 [&_li]:items-center">
              <li><a href="/?op=skip" class="link-text">HOME</a><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                </svg></li>
              <li><a href="/<? echo $post_type_obj->name; ?>/" class="link-text"><? echo $post_type_obj->label; ?>
                </a><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                </svg></li>
            </ul>
          </nav>
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
            <span class="text-xs text-gray-500"> #000</span>
          </div>
          <h2 class="text-xl font-bold"><?php the_title(); ?></h2>
        </header>
        <div class="mt-8">
          <? if (get_post_meta(get_the_ID(), "events_info_09", TRUE)) { ?>
            <div>
              <dt>開催期間</dt>
              <dd>
                <div><?= get_post_meta(get_the_ID(), 'events_info_09', TRUE) ?></div>
              </dd>
            </div>
          <? } ?>

          <? if (get_post_meta(get_the_ID(), "events_info_09", TRUE)) { ?>
            <div class="mt-4">
              <dt>開催場所</dt>
              <dd>
                <div><?= get_post_meta(get_the_ID(), 'events_info_01', TRUE) ?></div>
                <div class="inline-block"><?= get_post_meta(get_the_ID(), 'events_info_02', TRUE) ?></div>
                <? if (get_post_meta(get_the_ID(), 'events_info_03', TRUE)) { ?>
                  <a href="<?= get_post_meta(get_the_ID(), 'events_info_03', TRUE) ?>" rel="noopener noreferrer" target="_blank" class="inline-flex items-center link-text ml-1">MAP</a>
                <? } ?>
                <div>
                  <p><?= get_post_meta(get_the_ID(), 'events_info_04', TRUE) ?></p>
                </div>
              </dd>
            </div>
          <? } ?>

          <? if (get_post_meta(get_the_ID(), "events_info_13", TRUE)) { ?>
            <div class="mt-4">
              <dt>入場料</dt>
              <dd>
                <p><?= get_post_meta(get_the_ID(), 'events_info_13', TRUE) ?></p>
              </dd>
            </div>
          <? } ?>

          <? if (get_post_meta(get_the_ID(), "events_info_14", TRUE)) { ?>
            <div class="mt-4">
              <dt>主催者</dt>
              <dd>
                <p><?= get_post_meta(get_the_ID(), 'events_info_14', TRUE) ?></p>
              </dd>
            </div>
          <? } ?>

          <? if (get_post_meta(get_the_ID(), "events_info_06", TRUE)) { ?>
            <div class="mt-4">
              <dt>備考</dt>
              <dd>
                <p><?= get_post_meta(get_the_ID(), 'events_info_06', TRUE) ?></p>
              </dd>
            </div>
          <? } ?>

          </dl>
        </div>

  </div>
  <div class="w-1/2 max-w-screen-sm px-4 pt-8 pb-8 sm:px-16">
    <div class="relative block border border-black sm:hover:bg-gray-100">
      <div class="p-4">
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
          </div><span class="text-xs text-gray-500"> #000</span>
        </div>
        <h3><span class="font-bold"><?php the_title(); ?></span></h3>
        <div class="flex flex-wrap gap-x-2 mt-2 text-xs">
          <span class="before:content-['#'] before:pr-[1px]"><?= format_date(get_post_meta(get_the_ID(), 'events_info_15', TRUE)); ?>
            <? if (get_post_meta(get_the_ID(), 'events_info_16', TRUE)) { ?>
              - <?= format_date(get_post_meta(get_the_ID(), 'events_info_16', TRUE)); ?>
            <? } ?>
          </span>
          <span class="before:content-['#'] before:pr-[1px]"><?= get_post_meta(get_the_ID(), 'events_info_01', TRUE); ?></span>
        </div>
      </div>
    </div>
  </div>
<? }
    }
?>
</div>