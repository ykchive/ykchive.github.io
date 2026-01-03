document.addEventListener('DOMContentLoaded', () => {

  /* ===================== */
  /* 1. 날짜 + 요일 자동 생성 */
  /* ===================== */
  document.querySelectorAll('.date').forEach(el => {
    const raw = el.dataset.date;
    if (!raw) return;

    const [y, m, d] = raw.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const week = ['일','월','화','수','목','금','토'];

    el.textContent = `${y}년 ${m}월 ${d}일 ${week[date.getDay()]}요일`;
  });


  /* ===================== */
  /* 2. 사진 전체보기 (스와이프 지원) */
  /* ===================== */
  const viewer = document.getElementById('photoViewer');
  const viewerImg = document.getElementById('photoViewerImg');
  const photos = document.querySelectorAll('.photo');

  if (viewer && viewerImg && photos.length > 0) {
    let currentIndex = 0;
    let startX = 0;

    photos.forEach((img, i) => {
      img.addEventListener('click', () => {
        currentIndex = i;
        viewerImg.src = img.src;
        viewer.classList.add('show');
        document.body.style.overflow = 'hidden';
      });
    });

    viewer.addEventListener('click', e => {
      if (e.target === viewer || e.target === viewerImg) {
        viewer.classList.remove('show');
        document.body.style.overflow = '';
      }
    });

    viewerImg.addEventListener('touchstart', e => { startX = e.touches[0].clientX; });
    viewerImg.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) < 50) return;

      if (diff > 0 && currentIndex < photos.length - 1) currentIndex++;
      else if (diff < 0 && currentIndex > 0) currentIndex--;

      viewerImg.style.opacity = '0';
      setTimeout(() => {
        viewerImg.src = photos[currentIndex].src;
        viewerImg.style.opacity = '1';
      }, 100);
    });
  }


  /* ===================== */
  /* 3. 음성 메시지 제어 */
  /* ===================== */
  document.querySelectorAll('.voice-bubble').forEach(bubble => {
    const audio = bubble.querySelector('audio');
    const btn   = bubble.querySelector('.voice-btn');
    const bar   = bubble.querySelector('.voice-bar');
    const cur   = bubble.querySelector('.voice-current');
    const total = bubble.querySelector('.voice-total');

    const format = s => {
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const setMetadata = () => {
      bar.max = audio.duration;
      total.textContent = format(audio.duration);
    };

    if (audio.readyState >= 1) setMetadata();
    else audio.addEventListener('loadedmetadata', setMetadata);

    btn.addEventListener('click', () => {
      document.querySelectorAll('audio').forEach(a => {
        if (a !== audio) {
          a.pause();
          const otherBtn = a.closest('.voice-bubble').querySelector('.voice-btn');
          if(otherBtn) otherBtn.classList.remove('playing');
        }
      });

      if (audio.paused) {
        audio.play();
        btn.classList.add('playing');
      } else {
        audio.pause();
        btn.classList.remove('playing');
      }
    });

    audio.addEventListener('timeupdate', () => {
      bar.value = audio.currentTime;
      cur.textContent = format(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      btn.classList.remove('playing');
      bar.value = 0;
      cur.textContent = '0:00';
    });

    bar.addEventListener('input', () => {
      audio.currentTime = bar.value;
    });
  });


  /* ===================== */
  /* 4. 메시지 검색 기능 */
  /* ===================== */
  const searchOpenBtn = document.getElementById('searchOpenBtn');
  const searchBar = document.getElementById('searchBar');
  const searchInput = document.getElementById('searchInput');
  const searchCloseBtn = document.getElementById('searchCloseBtn');
  const bubbles = document.querySelectorAll('.bubble');

  // 검색 결과 초기화 함수
  const resetSearch = () => {
    bubbles.forEach(bubble => {
      // data-original 속성이 있으면 그것으로 복구, 없으면 현재 텍스트 저장
      if (bubble.dataset.original) {
        bubble.innerHTML = bubble.dataset.original;
      } else {
        bubble.dataset.original = bubble.innerHTML;
      }
    });
  };

  if (searchOpenBtn && searchBar) {
    searchOpenBtn.addEventListener('click', () => {
      searchBar.style.display = 'flex';
      searchInput.focus();
    });

    searchCloseBtn.addEventListener('click', () => {
      searchBar.style.display = 'none';
      searchInput.value = '';
      resetSearch();
    });

    searchInput.addEventListener('input', (e) => {
      const keyword = e.target.value.trim();
      resetSearch();

      if (keyword.length < 1) return;

      bubbles.forEach(bubble => {
        const text = bubble.textContent;
        if (text.includes(keyword)) {
          const regex = new RegExp(`(${keyword})`, 'gi');
          bubble.innerHTML = text.replace(regex, `<span class="highlight">$1</span>`);
        }
      });
    });
  }

});
