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

        const dot = document.createElement('span');
        dot.className = index === 0 ? 'dot active' : 'dot';
        dot.onclick = () => currentSlide(index + 1);
        dots.appendChild(dot);
    });
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