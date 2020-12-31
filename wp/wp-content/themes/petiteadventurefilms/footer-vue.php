    <!--article--></article>
<!--.container--></div>

<footer id="site_footer">
    <div class="container">
        <div class="single">
            <div class="col col_9 last">
                <ul>
                    <li><a href="<?php echo get_permalink(get_page_by_path("specified-commercial-transaction-law")); ?>">特定商取引法に基づく表記</a></li>
                    <li><a href="<?php echo get_permalink(get_page_by_path("copyrights-disclaimers")); ?>">サイトのご利用について</a></li>
                    <li><a href="<?php echo get_permalink(get_page_by_path("gathering-the-personal-information")); ?>">個人情報の扱いについて</a></li>
                    <li><a href="<?php echo get_permalink(get_page_by_path("privacy-policy")); ?>">プライバシーポリシー</a></li>
                    <li><a href="<?php echo get_permalink(get_page_by_path("system-requirements")); ?>">推奨環境</a></li>
                </ul>
                <p>Copyright © <?php echo date("Y"); ?> <?php echo get_bloginfo("site_name"); ?>. All rights reserved.</p>
            </div>
            <div class="clear"></div>
        </div>
    </div>
<!--footer--></footer>


<?php
$current_uri = $_SERVER['REQUEST_URI'];
if(preg_match('/^\/cashier\//', $current_uri)): ?>

<? elseif(preg_match('/^\/pafshop\//', $current_uri)): ?>
    
    <div id="additional_2">
        <div class="icon_btn" id="home"><a href="<?php echo get_bloginfo("url"); ?>"><span class="icon-home"></span></a></div>
        <div class="icon_btn" id="contact"><a href="<?php echo get_permalink(get_page_by_path("contact_jp")); ?>"><span class="icon-mail mail"></span></a></div>
        <div class="icon_btn" id="go_top"><a href="#site_header"><span class="inline_block icon-keyboard-arrow-up"></span></a></div>
    </div>

<?php else:?>

    <div id="additional_2">
        <div class="icon_btn" id="en_btn"><a href="http://en.petiteadventurefilms.com/">EN</a></div>
        <div class="icon_btn" id="twitter"><a href="https://twitter.com/brianandco?lang=ja" target="_blank"><span class="icon-twitter twitter"></span></a></div>
        <div class="icon_btn" id="facebook"><a href="https://www.facebook.com/Petite-Adventure-Films-156815051365447/" target="_blank"><span class="icon-facebook facebook"></span></a></div>
        <div class="icon_btn" id="contact"><a href="<?php echo get_permalink(get_page_by_path("contact_jp")); ?>"><span class="icon-mail mail"></span></a></div>
        <div class="icon_btn" id="go_top"><a href="#site_header"><span class="inline_block icon-keyboard-arrow-up"></span></a></div>
    </div>

<? endif; ?>

