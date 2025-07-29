// === Глобальный объект для плагина ===
window.HotelRooms = (function () {
    // === Переменные ===
    let roomSlideIndex = 1;
    const dataUrl = window.roomDataUrl || '/assets/data/rooms.json';

    // === Глобальный массив всех фото ===
    let allImages = [];

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

            let galleryHtml = '';
            if (room.images && room.images.length > 0) {
                const firstImage = room.images[0];
                const otherImages = room.images.slice(1);

                galleryHtml = `
                    <div class="room-gallery">
                        <img src="${firstImage}" alt="${escapeHtml(room.title)}" loading="lazy" class="gallery-main">
                        <div class="zoom-overlay">🔍</div>
                        ${otherImages.length > 0 ? `
                        <div class="gallery-thumbs">
                            ${otherImages.map((img, idx) => `
                                <img src="${img}" alt="Фото ${idx + 2}" class="thumb">
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

            const mainImg = card.querySelector('.gallery-main');
            if (mainImg) {
                mainImg.style.cursor = 'pointer';
                mainImg.onclick = function (e) {
                    e.stopPropagation();
                    const src = this.src;
                    const index = allImages.findIndex(img => img.src === src);
                    if (index !== -1) openGlobalLightbox(index);
                };
            }

            const thumbs = card.querySelectorAll('.thumb');
            thumbs.forEach((thumb, idx) => {
                thumb.style.cursor = 'pointer';
                thumb.onclick = function (e) {
                    e.stopPropagation();
                    const src = this.src;
                    const index = allImages.findIndex(img => img.src === src);
                    if (index !== -1) openGlobalLightbox(index);
                };
            });

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
                        <img src="${firstImage}" alt="${escapeHtml(room.title)}" loading="lazy" class="gallery-main">
                        <div class="zoom-overlay">🔍</div>
                        ${otherImages.length > 0 ? `
                        <div class="gallery-thumbs">
                            ${otherImages.map((img, idx) => `
                                <img src="${img}" alt="Фото ${idx + 2}" class="thumb">
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

            const mainImg = slide.querySelector('.gallery-main');
            if (mainImg) {
                mainImg.style.cursor = 'pointer';
                mainImg.onclick = function (e) {
                    e.stopPropagation();
                    const src = this.src;
                    const index = allImages.findIndex(img => img.src === src);
                    if (index !== -1) openGlobalLightbox(index);
                };
            }

            const thumbs = slide.querySelectorAll('.thumb');
            thumbs.forEach((thumb, idx) => {
                thumb.style.cursor = 'pointer';
                thumb.onclick = function (e) {
                    e.stopPropagation();
                    const src = this.src;
                    const index = allImages.findIndex(img => img.src === src);
                    if (index !== -1) openGlobalLightbox(index);
                };
            });

            inner.appendChild(slide);

            const dot = document.createElement('span');
            dot.className = index === 0 ? 'dot active' : 'dot';
            dot.onclick = () => currentSlide(index + 1);
            dots.appendChild(dot);
        });
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

    // === Глобальный попап по всем фото ===
    function openGlobalLightbox(startIndex) {
        let currentIndex = startIndex;

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
        `;

        const fullImg = document.createElement('img');
        fullImg.src = allImages[currentIndex].src;
        fullImg.alt = allImages[currentIndex].title;
        fullImg.style.cssText = `
            max-width: 90vw;
            max-height: 75vh;
            border-radius: 12px;
            object-fit: contain;
            margin-bottom: 10px;
        `;

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

        const roomTitle = document.createElement('div');
        roomTitle.textContent = allImages[currentIndex].title;
        roomTitle.style.cssText = `
            color: white;
            font-size: 18px;
            position: absolute;
            top: 20px;
            right: 70px;
            z-index: 10;
        `;

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
            z-index: 10;
        `;
        closeBtn.onclick = () => document.body.removeChild(modal);

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
        `;
        prevBtn.onclick = (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex - 1 + allImages.length) % allImages.length;
            fullImg.src = allImages[currentIndex].src;
            counter.textContent = `${currentIndex + 1} / ${allImages.length}`;
            roomTitle.textContent = allImages[currentIndex].title;
        };

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
        `;
        nextBtn.onclick = (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex + 1) % allImages.length;
            fullImg.src = allImages[currentIndex].src;
            counter.textContent = `${currentIndex + 1} / ${allImages.length}`;
            roomTitle.textContent = allImages[currentIndex].title;
        };

        modal.appendChild(closeBtn);
        modal.appendChild(counter);
        modal.appendChild(roomTitle);
        modal.appendChild(prevBtn);
        modal.appendChild(nextBtn);
        modal.appendChild(fullImg);
        document.body.appendChild(modal);
    }

    // === Экспорт функций в глобальную область ===
    return {
        renderGrid: renderGrid,
        renderCarousel: renderCarousel,
        showSlides: showSlides,
        openGlobalLightbox: openGlobalLightbox,
        changeSlide: function (n) { showSlides((window.roomSlideIndex = (window.roomSlideIndex || 1) + n)); },
        currentSlide: function (n) { showSlides((window.roomSlideIndex = n)); },
        collectAllImages: function (data) {
            allImages = [];
            data.forEach(room => {
                (room.images || []).forEach(src => {
                    allImages.push({ src: src, title: room.title });
                });
            });
        }
    };

})();