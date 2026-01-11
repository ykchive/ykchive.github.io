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


  /* ===================== */
  /* 사진 전체보기 */
  /* ===================== */
  const viewer    = document.getElementById('photoViewer');
  const viewerImg = document.getElementById('photoViewerImg');
  const photos    = document.querySelectorAll('.photo');

  let currentIndex = 0;
  let startX = 0;

  if (viewer && viewerImg && photos.length) {

    photos.forEach((img, i) => {
      img.addEventListener('click', () => {
        currentIndex = i;
        viewerImg.src = img.src;
        viewer.classList.add('show');
        document.body.style.overflow = 'hidden';
      });
    });

    viewer.addEventListener('click', e => {
      if (e.target !== viewer) return;
      viewer.classList.remove('show');
      viewerImg.src = '';
      document.body.style.overflow = '';
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

    const format = sec => {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

    audio.addEventListener('loadedmetadata', () => {
      bar.max = audio.duration;
      total.textContent = format(audio.duration);
    });

    btn.addEventListener('click', () => {
      document.querySelectorAll('audio').forEach(a => a !== audio && a.pause());
      document.querySelectorAll('.voice-btn').forEach(b => b !== btn && b.classList.remove('playing'));

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

});


/* ===================== */
/* 사이드 메뉴 */
 /* ===================== */
function toggleMenu() {
  document.getElementById('sideMenu')?.classList.toggle('open');
  document.getElementById('dim')?.classList.toggle('show');
}


/* ===================== */
/* 월 / 날짜 토글 */
 /* ===================== */
function toggleMonth(el) {
  const list = el.nextElementSibling;
  const isOpen = list.classList.contains('open');

  list.classList.toggle('open', !isOpen);
  el.classList.toggle('open', !isOpen);
}


/* ===================== */
/* 검색 */
 /* ===================== */
function toggleSearch() {
  const box = document.getElementById('searchBox');
  if (!box) return;

  const input = box.querySelector('input');

  const open = box.style.display === 'block';
  box.style.display = open ? 'none' : 'block';

  if (open) {
    input.value = '';
    filterDates('');
  } else {
    input.focus();
  }
}

function filterDates(keyword) {
  document.querySelectorAll('.month').forEach(month => {
    const title = month.querySelector('.month-title');
    const list  = month.querySelector('.date-list');
    const items = list.querySelectorAll('li');

    let hasMatch = false;

    items.forEach(li => {
      const match = li.textContent.includes(keyword);
      li.style.display = match ? 'block' : 'none';
      if (match) hasMatch = true;
    });

    if (!keyword) {
      month.style.display = 'block';
      list.classList.remove('open');
      title.classList.remove('open');
      items.forEach(li => li.style.display = 'block');
      return;
    }

    month.style.display = hasMatch ? 'block' : 'none';
    list.classList.toggle('open', hasMatch);
    title.classList.toggle('open', hasMatch);
  });
}
