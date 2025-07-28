<?php
/**
 * Plugin Name:       Гостиница: Номера и бронирование
 * Plugin URI:        https://yourwebsite.com/hotel-rooms
 * Description:       Адаптивный слайдер и сетка номеров с WhatsApp-бронированием. Удобно для отелей, гостиниц, баз отдыха.
 * Version:           1.0.0
 * Requires at least: 5.0
 * Requires PHP:      7.0
 * Author:            Твой Бренд
 * Author URI:        https://yourwebsite.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       hotel-rooms
 */

// Запрет прямого доступа
if (!defined('ABSPATH')) {
    exit;
}

// Основной класс плагина
class HotelRoomsPlugin {

    public function __construct() {
        // Регистрируем шорткод
        add_shortcode('room_slider', [$this, 'room_slider_shortcode']);

        // Подключаем стили и скрипты
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);

        // Добавляем пункт в меню админки (опционально)
        add_action('admin_menu', [$this, 'add_admin_menu']);
    }

    // === ШОРТКОД ===
    public function room_slider_shortcode() {
        ob_start(); ?>
        <div class="rooms-container" id="roomsContainer">
            <div class="carousel" id="mobileCarousel">
                <div class="carousel-inner"></div>
                <a class="carousel-control prev" onclick="changeSlide(-1)">&#10095;</a>
                <a class="carousel-control next" onclick="changeSlide(1)">&#10094;</a>
                <div class="carousel-dots"></div>
            </div>
            <div class="rooms-grid" id="roomsGrid"></div>
        </div>

        <script>
        (function() {
            if (window.roomSliderLoaded) return;
            window.roomSliderLoaded = true;
            window.roomDataUrl = '<?php echo esc_url(plugins_url('/assets/data/rooms.json', __FILE__)); ?>';

            const script = document.createElement('script');
            script.src = '<?php echo esc_url(plugins_url('/assets/js/room-slider.js', __FILE__)); ?>';
            script.onload = () => console.log('Hotel Rooms: room-slider.js загружен');
            document.body.appendChild(script);
        })();
        </script>
        <?php
        return ob_get_clean();
    }

    // === ПОДКЛЮЧЕНИЕ CSS/JS ===
    public function enqueue_assets() {
        if ($this->has_shortcode_on_page('room_slider')) {
            wp_enqueue_style(
                'hotel-rooms-style',
                plugins_url('/assets/css/room-slider.css', __FILE__),
                [],
                '1.0.0'
            );
        }
    }

    // Проверка, есть ли шорткод на странице
    private function has_shortcode_on_page($shortcode) {
        global $post;
        return is_a($post, 'WP_Post') && has_shortcode($post->post_content, $shortcode);
    }
//     // === ОБЁРТКА ШОРТКОДА В DIV — ЧЕРЕЗ ФИЛЬТР ===
// add_filter('the_content', function ($content) {
//     if (has_shortcode($content, 'room_slider')) {
//         $content = str_replace(
//             '[room_slider]',
//             '<div id="hotel-rooms-wrapper">[room_slider]</div>',
//             $content
//         );
//     }
//     return $content;
// });
    // === АДМИН-МЕНЮ (для будущих настроек) ===
    public function add_admin_menu() {
        add_options_page(
            'Настройки номеров',
            'Номера отеля',
            'manage_options',
            'hotel-rooms-settings',
            [$this, 'settings_page']
        );
    }

    public function settings_page() {
        echo '<div class="wrap"><h1>Настройки номеров</h1>';
        echo '<p>Здесь в будущем можно будет редактировать номера, цены, фото и настройки WhatsApp.</p>';
        echo '<p><em>Пока редактируйте файл: <code>/wp-content/plugins/hotel-rooms/assets/data/rooms.json</code></em></p>';
        echo '</div>';
    }
}

// Запускаем плагин
new HotelRoomsPlugin();