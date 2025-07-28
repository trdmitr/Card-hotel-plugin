(function () {
    // === 1. СНАЧАЛА — переменные ===
    let roomSlideIndex = 1;
    const dataUrl = window.roomDataUrl || '/wp-content/plugins/hotel-rooms/assets/data/rooms.json';

    // === 2. СНАЧАЛА — ВСЕ ФУНКЦИИ ===
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

function renderGrid(data) {
    const grid = document.getElementById('roomsGrid');
    if (!grid) return;

    data.forEach(room => {
        const card = document.createElement('div');
        card.className = 'room-card';

        // Галерея
        let galleryHtml = '';
        if (room.images && room.images.length > 0) {
            const firstImage = room.images[0];
            const otherImages = room.images.slice(1);

            galleryHtml = `
                <div class="room-gallery">
                    <!-- Основное фото -->
                    <img src="${firstImage}" alt="${escapeHtml(room.title)}" class="gallery-main">
                    <div class="zoom-overlay">🔍</div>
                    <!-- Миниатюры (если есть) -->
                    ${otherImages.length > 0 ? `
                    <div class="gallery-thumbs">
                        ${otherImages.map((img, idx) => `
                            <img src="${img}" alt="Фото ${idx + 2}" 
                                 onclick="this.parentElement.previousElementSibling.src = '${img}'"
                                 class="thumb">
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
            `;
        }

        card.innerHTML = `
            ${galleryHtml}
            <h3>${escapeHtml(room.title)}</h3>
            <p><strong>Описание:</strong> ${escapeHtml(room.desc)}</p>
            <p><strong>Номер комнаты:</strong> ${escapeHtml(room.number)}</p>
            <p><strong>Количество:</strong> ${escapeHtml(room.count)}</p>
            <p class="price"><strong>Стоимость:</strong> ${escapeHtml(room.price)}</p>
        `;
        grid.appendChild(card);
        const img = card.querySelector('.gallery-main');
        if (img) {
            img.loading = "lazy"; // ← так работает надёжнее
        }
    });
}

function renderCarousel(data) {
    const inner = document.querySelector('#mobileCarousel .carousel-inner');
    const dots = document.querySelector('#mobileCarousel .carousel-dots');
    if (!inner || !dots) return;

    data.forEach((room, index) => {
        const slide = document.createElement('div');
        slide.className = index === 0 ? 'carousel-item active' : 'carousel-item';

        let galleryHtml = '';
        if (room.images && room.images.length > 0) {
            const firstImage = room.images[0];
            const otherImages = room.images.slice(1);

            galleryHtml = `
                <div class="room-gallery">
                    <img src="${firstImage}" alt="${escapeHtml(room.title)}" class="gallery-main">
                    ${otherImages.length > 0 ? `
                    <div class="gallery-thumbs">
                        ${otherImages.map((img, idx) => `
                            <img src="${img}" alt="Фото ${idx + 2}" 
                                 onclick="this.parentElement.previousElementSibling.src = '${img}'"
                                 class="thumb">
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
            `;
        }

        slide.innerHTML = `
            <div class="room-card">
                ${galleryHtml}
                <h3>${escapeHtml(room.title)}</h3>
                <p><strong>Описание:</strong> ${escapeHtml(room.desc)}</p>
                <p><strong>Номер комнаты:</strong> ${escapeHtml(room.number)}</p>
                <p><strong>Количество:</strong> ${escapeHtml(room.count)}</p>
                <p class="price"><strong>Стоимость:</strong> ${escapeHtml(room.price)}</p>
            </div>
        `;
        inner.appendChild(slide);
        const img = slide.querySelector('.gallery-main');
        if (img) {
            img.loading = "lazy";
        }
        const dot = document.createElement('span');
        dot.className = index === 0 ? 'dot active' : 'dot';
        dot.onclick = () => currentSlide(index + 1);
        dots.appendChild(dot);
    });
}
function initGallerySwipe() {
    setTimeout(() => {
        const thumbsList = document.querySelectorAll('.gallery-thumbs');
        console.log('🔄 initGallerySwipe: найдено .gallery-thumbs:', thumbsList.length);

        thumbsList.forEach(thumbs => {
            let startX = 0;
            let startY = 0;
            let scrollLeft = 0;

            if (!thumbs || !thumbs.addEventListener) return;

            thumbs.addEventListener('touchstart', e => {
                if (e.touches.length !== 1) return;
                const touch = e.touches[0];
                startX = touch.pageX;
                startY = touch.pageY;
                scrollLeft = thumbs.scrollLeft;
                thumbs.style.scrollBehavior = 'auto';
                // Не вызываем preventDefault здесь — дадим шанс другим жестам
            }, { passive: true }); // ← можно вернуть passive: true

            thumbs.addEventListener('touchmove', e => {
                if (e.touches.length !== 1) return;
                const touch = e.touches[0];
                const dx = startX - touch.pageX;
                const dy = startY - touch.pageY;

                // Только если движение горизонтальное
                if (Math.abs(dx) > Math.abs(dy)) {
                    e.preventDefault(); // Блокируем скролл страницы
                    thumbs.scrollLeft = scrollLeft + dx;
                }
            }, { passive: false });

            thumbs.addEventListener('touchend', () => {
                thumbs.style.scrollBehavior = 'smooth';
            });
        });
    }, 100);
}
function initLightbox() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createLightboxListeners);
    } else {
        createLightboxListeners();
    }

    function createLightboxListeners() {
        document.querySelectorAll('.gallery-main').forEach(img => {
            img.style.cursor = 'pointer';

            img.onclick = function (e) {
                e.stopPropagation();

                const roomCard = this.closest('.room-card') || this.closest('.carousel-item');
                const thumbs = roomCard ? Array.from(roomCard.querySelectorAll('.thumb')) : [];
                const allImages = [this, ...thumbs.map(t => ({ src: t.src, alt: t.alt }))];
                let currentIndex = 0;

                // Найдём, какое фото открыли
                if (this.classList.contains('thumb')) {
                    currentIndex = thumbs.indexOf(this) + 1;
                } else {
                    currentIndex = 0;
                }

                const modal = document.createElement('div');
                modal.style.cssText = `
                    position: fixed;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: rgba(0, 0, 0, 0.95);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    cursor: zoom-out;
                    animation: fadeIn 0.3s ease;
                `;

                const fullImg = document.createElement('img');
                fullImg.src = allImages[currentIndex].src;
                fullImg.alt = allImages[currentIndex].alt || 'Фото номера';
                fullImg.style.cssText = `
                    max-width: 90vw;
                    max-height: 75vh;
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                    object-fit: contain;
                    margin-bottom: 10px;
                `;

                // Индикатор: 1/4
                const counter = document.createElement('div');
                counter.textContent = `${currentIndex + 1} / ${allImages.length}`;
                counter.style.cssText = `
                    color: white;
                    font-size: 14px;
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    z-index: 10;
                `;

                // Кнопка закрытия
                const closeBtn = document.createElement('div');
                closeBtn.innerHTML = '✕';
                closeBtn.style.cssText = `
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    width: 40px;
                    height: 40px;
                    background: #fff;
                    color: #000;
                    font-size: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    z-index: 10;
                `;
                closeBtn.onclick = () => {
                    modal.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => document.body.removeChild(modal), 300);
                };

                // Стрелка "Назад"
                const prevBtn = document.createElement('div');
                prevBtn.innerHTML = '‹';
                prevBtn.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 20px;
                    transform: translateY(-50%);
                    width: 50px;
                    height: 50px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    font-size: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 10;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                `;
                prevBtn.onclick = (e) => {
                    e.stopPropagation();
                    currentIndex = (currentIndex - 1 + allImages.length) % allImages.length;
                    fullImg.src = allImages[currentIndex].src;
                    fullImg.alt = allImages[currentIndex].alt || 'Фото номера';
                    counter.textContent = `${currentIndex + 1} / ${allImages.length}`;
                };

                // Стрелка "Вперёд"
                const nextBtn = document.createElement('div');
                nextBtn.innerHTML = '›';
                nextBtn.style.cssText = `
                    position: absolute;
                    top: 50%;
                    right: 20px;
                    transform: translateY(-50%);
                    width: 50px;
                    height: 50px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    font-size: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 10;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                `;
                nextBtn.onclick = (e) => {
                    e.stopPropagation();
                    currentIndex = (currentIndex + 1) % allImages.length;
                    fullImg.src = allImages[currentIndex].src;
                    fullImg.alt = allImages[currentIndex].alt || 'Фото номера';
                    counter.textContent = `${currentIndex + 1} / ${allImages.length}`;
                };

                modal.appendChild(closeBtn);
                modal.appendChild(counter);
                modal.appendChild(prevBtn);
                modal.appendChild(nextBtn);
                modal.appendChild(fullImg);
                document.body.appendChild(modal);
            };
        });
    }
}
    function changeSlide(n) {
        showSlides(roomSlideIndex += n);
    }

    function currentSlide(n) {
        showSlides(roomSlideIndex = n);
    }

    function showSlides(n) {
        const slides = document.querySelectorAll('.carousel-item');
        const dots = document.querySelectorAll('.dot');

        if (slides.length === 0) return;

        if (n > slides.length) roomSlideIndex = 1;
        if (n < 1) roomSlideIndex = slides.length;

        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));

        slides[roomSlideIndex - 1].classList.add('active');
        dots[roomSlideIndex - 1].classList.add('active');
    }

    // === 3. ПОТОМ — fetch ===
    fetch(dataUrl)
        .then(response => {
            console.log('✅ Ответ получен:', response);
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return response.json();
        })
        .then(data => {
            console.log('✅ Данные распарсены:', data);

            if (typeof renderGrid === 'function') {
                renderGrid(data);
            } else {
                console.error('❌ renderGrid НЕ функция:', typeof renderGrid);
            }

            if (typeof renderCarousel === 'function') {
                renderCarousel(data);
            }

    showSlides(1);

    // ✅ Теперь DOM обновлён — можно инициализировать
    if (typeof initGallerySwipe === 'function') {
        initGallerySwipe();
    }

    if (typeof initLightbox === 'function') {
        initLightbox();
    }
})
        .catch(err => {
            console.error('🔴 Ошибка:', err);
            const container = document.getElementById('roomsContainer');
            if (container) {
                container.innerHTML = `<p style="color:red">Ошибка: ${err.message}</p>`;
            }
        });

    // === 4. Экспорт в window ===
    window.changeSlide = changeSlide;
    window.currentSlide = currentSlide;

})();