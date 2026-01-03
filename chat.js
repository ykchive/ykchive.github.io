document.addEventListener('DOMContentLoaded', () => {

  /* ===================== */
  /* 날짜 + 요일 자동 생성 */
  /* ===================== */
  document.querySelectorAll('.date').forEach(el => {
    const raw = el.dataset.date;
    if (!raw) return;

    const [y, m, d] = raw.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const week = ['일','월','화','수','목','금','토'];

    el.textContent = `${y}년 ${m}월 ${d}일 ${week[date.getDay()]}요일`;
  });
});

  /* ===================== */
  /* 사진 전체보기 */
  /* ===================== */
  const viewer = document.querySelector('.photo-viewer');
  const viewerImg = viewer?.querySelector('img');
  const photos = document.querySelectorAll('.photo');

  let currentIndex = 0;
  let startX = 0;

  if (viewer && viewerImg) {

    photos.forEach((img, i) => {
      img.addEventListener('click', () => {
        currentIndex = i;
        viewerImg.src = img.src;
        viewer.classList.add('show');
        document.body.style.overflow = 'hidden';
      });
    });

    viewer.addEventListener('click', e => {
      if (e.target === viewer) {
        viewer.classList.remove('show');
        document.body.style.overflow = '';
        viewerImg.src = '';
      }
    });

    viewerImg.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    });

    viewerImg.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) < 50) return;

      if (diff > 0 && currentIndex < photos.length - 1) currentIndex++;
      if (diff < 0 && currentIndex > 0) currentIndex--;

      viewerImg.src = photos[currentIndex].src;
    });
  }


  /* ===================== */
  /* 음성 메시지 */
  /* ===================== */
  document.querySelectorAll('.voice-bubble').forEach(bubble => {
    const audio = bubble.querySelector('audio');
    const btn   = bubble.querySelector('.voice-btn');
    const bar   = bubble.querySelector('.voice-bar');
    const cur   = bubble.querySelector('.voice-current');
    const total = bubble.querySelector('.voice-total');

    if (!audio || !btn || !bar) return;

    const format = s => {
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    audio.addEventListener('loadedmetadata', () => {
      bar.max = audio.duration;
      total.textContent = format(audio.duration);
    });

    btn.addEventListener('click', () => {
      document.querySelectorAll('audio').forEach(a => {
        if (a !== audio) a.pause();
      });
      document.querySelectorAll('.voice-btn').forEach(b => {
        if (b !== btn) b.classList.remove('playing');
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
  });


  /* ===================== */
  /* 채팅 검색 (개선 버전) */
  /* ===================== */
  const topBar      = document.querySelector('.top-bar');
  const searchBtn   = document.querySelector('.search-btn');
  const searchInput = document.querySelector('.search-bar input');
  const cancelBtn   = document.querySelector('.cancel-btn');
  const bubbles     = [...document.querySelectorAll('.bubble')];

  let results = [];
  let current = -1;

  // 🔹 bubble 원본 HTML 저장
  const originalHTML = new Map();
  bubbles.forEach(b => {
    originalHTML.set(b, b.innerHTML);
  });

  /* 검색 열기 */
  searchBtn.addEventListener('click', () => {
    topBar.classList.add('search-active');
    searchInput.value = '';
    searchInput.focus();
    restoreOriginal();
  });

  /* 검색 닫기 */
  cancelBtn.addEventListener('click', () => {
    topBar.classList.remove('search-active');
    searchInput.value = '';
    results = [];
    current = -1;
    restoreOriginal();
  });

  /* Enter → 검색 */
  searchInput.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;

    const keyword = searchInput.value.trim();
    if (!keyword) return;

    restoreOriginal();

    results = bubbles.filter(b =>
      b.textContent.includes(keyword)
    );

    if (!results.length) return;

    results.forEach(b => {
      const html = originalHTML.get(b);
      b.innerHTML = html.replace(
        new RegExp(`(${escapeReg(keyword)})`, 'gi'),
        '<strong>$1</strong>'
      );
    });

    current = 0;
    scrollToCurrent();
  });

  function scrollToCurrent() {
    if (current < 0 || current >= results.length) return;
    results[current].scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }

  /* 🔹 원본 복원 */
  function restoreOriginal() {
    bubbles.forEach(b => {
      b.innerHTML = originalHTML.get(b);
    });
  }

  /* 🔹 정규식 안전 처리 */
  function escapeReg(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
