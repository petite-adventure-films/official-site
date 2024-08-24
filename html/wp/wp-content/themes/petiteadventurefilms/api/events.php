<?php

/**
 * 今年のイベント一覧
 */
add_action('rest_api_init', 'register_events_api');
function register_events_api()
{
    register_rest_route(
        'wp/v2',
        'events',
        [
            'methods'  =>  'GET',
            'callback' => 'get_values_events'
        ],
        true
    );
}
function get_values_events()
{
    $args = array(
        'post_type' => 'events',
        'posts_per_page' => -1,
        'meta_query' => array(
            'relation' => 'AND',
            array(
                'key' => 'events_info_15',
                'value' => date('Y/01/01'),
                // 'value' => date('2023/01/01'), // 開発用のためにコメントアウト残している
                'compare' => '>=',
                'type' => 'DATE'
            ),
        )
    );

    $query = new WP_Query($args);
    $query->get_posts();
    $data = array();
    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            array_push($data, [
                'id' => get_the_ID(),
                'title' => html_entity_decode(get_the_title()),
                'status' => get_post_meta(get_the_ID(), "events_info_18", TRUE),
                'date_from' => format_date(get_post_meta(get_the_ID(), 'events_info_15', TRUE)),
                'date_to' => format_date(get_post_meta(get_the_ID(), 'events_info_16', TRUE)),
                'place' => get_post_meta(get_the_ID(), "events_info_01", TRUE),
                'film_tags' => get_the_terms(get_the_ID(), 'filmtags'),
                'event_tags' => get_the_terms(get_the_ID(), 'eventtags'),
                'no' => get_post_number(get_post())
            ]);
        }
    }

    foreach ($data as $item) {
        $dateFrom = $item['date_from'];
        $dateFrom = formatDate($dateFrom);
        $dateTo = $item['date_to'];
        if ($dateTo) {
            $dateTo = formatDate($dateTo, true);
        } else {
            $dateTo = null;
        }

        $dateList = dateList($dateFrom, $dateTo);
        foreach ($dateList as $date) {
            $year = (int)$date->format('Y');
            $month = (int)$date->format('m');

            if (isset($result[$year][$month])) {
                $result[$year][$month][] = $item;
            } else {
                $result[$year][$month] = [$item];
            }
        }
    }

    return new WP_REST_Response(array('data' => $result), 200);
}
function dateList(DateTime $dateFrom, ?DateTime $dateTo): array
{
    if (empty($dateTo)) {
        return [
            $dateFrom,
        ];
    }

    $interval = DateInterval::createFromDateString('1 month');
    $period = new DatePeriod($dateFrom, $interval, $dateTo);

    $list = [];
    foreach ($period as $dt) {
        $list[] = $dt;
    }

    return $list;
}
function formatDate(string $date, bool $last = false): DateTime
{
    $dateTime = new DateTime($date);
    if ($last) {
        return $dateTime->modify('last day of this month');
    } else {
        return $dateTime->modify('first day of this month');
    }
}

/**
 * イベント詳細
 */
add_action('rest_api_init', 'register_events_detail_api');
function register_events_detail_api()
{
    register_rest_route(
        'wp/v2',
        'events_detail',
        [
            'methods'  =>  'GET',
            'callback' => 'get_values_events_detail'
        ],
        true
    );
}
function get_values_events_detail()
{
    $args = array(
        'post_type' => 'events',
        'p' => $_GET['pageId']
    );
    $get_data = fn() => [
        'id' => get_the_ID(),
        'title' => html_entity_decode(get_the_title()),
        'content' => wpautop(html_entity_decode(get_the_content()), true),
        'published' => get_the_date(),
        'updated' => get_the_modified_date(),
        'status' => get_post_meta(get_the_ID(), "events_info_18", TRUE),
        'no' => get_post_number(get_post()),
        'place' => get_post_meta(get_the_ID(), "events_info_01", TRUE),
        'address' => get_post_meta(get_the_ID(), "events_info_02", TRUE),
        'map' => get_post_meta(get_the_ID(), "events_info_03", TRUE),
        'dates_details' => wpautop(get_post_meta(get_the_ID(), "events_info_09", TRUE)),
        'access_details' => wpautop(get_post_meta(get_the_ID(), "events_info_04", TRUE)),
        'fee_details' => wpautop(get_post_meta(get_the_ID(), "events_info_13", TRUE)),
        'host_details' => wpautop(get_post_meta(get_the_ID(), "events_info_14", TRUE)),
        'appendix_contents' => wpautop(get_post_meta(get_the_ID(), "events_info_06", TRUE)),
        'film_tags' => get_the_terms(get_the_ID(), 'filmtags'),
        'event_tags' => get_the_terms(get_the_ID(), 'eventtags'),
    ];
    return get_detail($args, $get_data);
}

/**
 * イベントアーカイブ
 */
add_action('rest_api_init', 'register_events_archive_api');
function register_events_archive_api()
{
    register_rest_route(
        'wp/v2',
        'events_archive',
        [
            'methods'  =>  'GET',
            'callback' => 'get_values_events_archive'
        ],
        true
    );
}
function get_values_events_archive()
{
    $year = $_GET['year'];
    $startDate = new DateTime("$year-01-01");
    $endDate = new DateTime("$year-12-31");
    $args = array(
        'post_type' => 'events',
        'posts_per_page' => -1,
        'meta_query' => array(
            'relation' => 'AND',
            array(
                'key' => 'events_info_15',
                'value' => $startDate->format('Y/m/d'),
                'compare' => '>=',
                'type' => 'DATE'
            ),
            array(
                'key' => 'events_info_15',
                'value' => $endDate->format('Y/m/d'),
                'compare' => '<=',
                'type' => 'DATE'
            ),
        )
    );
    $get_data = fn() => [
        'id' => get_the_ID(),
        'title' => html_entity_decode(get_the_title()),
        'status' => get_post_meta(get_the_ID(), "events_info_18", TRUE),
        'date_from' => format_date(get_post_meta(get_the_ID(), 'events_info_15', TRUE)),
        'date_to' => format_date(get_post_meta(get_the_ID(), 'events_info_16', TRUE)),
        'place' => get_post_meta(get_the_ID(), "events_info_01", TRUE),
        'film_tags' => get_the_terms(get_the_ID(), 'filmtags'),
        'event_tags' => get_the_terms(get_the_ID(), 'eventtags'),
        'no' => get_post_number(get_post())
    ];
    return get_list($args, $get_data);
}

/**
 * イベント番号
 */
function get_post_number($post)
{
    global $wpdb;

    $where = $wpdb->prepare("WHERE p.post_date <= %s AND p.post_type = %s AND p.post_status = 'publish'", $post->post_date, $post->post_type);
    $sql = "SELECT COUNT(*) FROM $wpdb->posts AS p $where";
    $number = (int)$wpdb->get_var($sql);
    return $number;
}
