/* ==================================================
   1. 공통 유틸
================================================== */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ==================================================
   2. 사진 전체보기
================================================== */

  const photos = Array.from(document.querySelectorAll('.photo'));
  const viewer = document.getElementById('photoViewer');
  const viewerImg = document.getElementById('viewerImg');
  let currentIndex = 0;

  // 사진 클릭
  photos.forEach((photo, index) => {
    photo.addEventListener('click', () => {
      currentIndex = index;
      openViewer();
    });
  });

  function openViewer() {
    viewerImg.src = photos[currentIndex].src;
    viewer.classList.add('show');
  }

  function closeViewer() {
    viewer.classList.remove('show');
  }

  // 이전 / 다음
  document.querySelector('.photo-nav.prev').onclick = () => {
    if (currentIndex > 0) {
      currentIndex--;
      openViewer();
    }
  };

  document.querySelector('.photo-nav.next').onclick = () => {
    if (currentIndex < photos.length - 1) {
      currentIndex++;
      openViewer();
    }
  };

  // 바깥 클릭 시 닫기
  viewer.addEventListener('click', (e) => {
    if (e.target === viewer) closeViewer();
  });

/* ==================================================
   3. 음성 메시지
================================================== */
document.querySelectorAll('.voice-bubble').forEach(bubble => {
  const audio = bubble.querySelector('audio');
  const btn   = bubble.querySelector('.voice-btn');
  const bar   = bubble.querySelector('.voice-bar');
  const cur   = bubble.querySelector('.voice-current');
  const total = bubble.querySelector('.voice-total');

  let wasPlaying = false;

  /* 메타데이터 로드 */
  audio.addEventListener('loadedmetadata', () => {
    bar.min = 0;
    bar.max = audio.duration;
    bar.value = 0;
    cur.textContent = '0:00';
    total.textContent = formatTime(audio.duration);
  });

  /* 재생 / 일시정지 */
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

  /* 재생 진행 */
  audio.addEventListener('timeupdate', () => {
    bar.value = audio.currentTime;
    cur.textContent = formatTime(audio.currentTime);
  });

  /* 드래그 시작 */
  ['mousedown', 'touchstart'].forEach(evt =>
    bar.addEventListener(evt, () => {
      wasPlaying = !audio.paused;
      audio.pause();
    })
  );

  /* 드래그 중 */
  bar.addEventListener('input', () => {
    audio.currentTime = bar.value;
    cur.textContent = formatTime(bar.value);
  });

  /* 드래그 종료 */
  ['mouseup', 'touchend'].forEach(evt =>
    bar.addEventListener(evt, () => {
      if (wasPlaying) audio.play();
    })
  );

  /* 재생 종료 */
  audio.addEventListener('ended', () => {
    btn.classList.remove('playing');
    bar.value = 0;
    cur.textContent = '0:00';
  });
});

/* ==================================================
   4. 날짜 자동 출력
================================================== */
document.querySelectorAll('.date').forEach(el => {
  const raw = el.dataset.date;
  if (!raw) return;

  const d = new Date(raw);
  const week = ['일','월','화','수','목','금','토'];

  el.textContent =
    `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${week[d.getDay()]}요일`;
});

/* ==================================================
   5. 채팅 검색 (정리본)
================================================== */
const topBar      = document.querySelector('.top-bar');
const searchTop   = document.querySelector('.search-top');
const searchBtn   = document.querySelector('.search-btn');
const searchInput = document.getElementById('searchInput');
const searchClose = document.getElementById('searchClose');
const searchPrev  = document.getElementById('searchPrev');
const searchNext  = document.getElementById('searchNext');
const searchClear = document.getElementById('searchClear');
const countEl     = document.getElementById('searchCount');
const bubbles     = [...document.querySelectorAll('.bubble')];

let results = [];
let current = 0;

/* 검색 열기 */
searchBtn.addEventListener('click', () => {
  topBar.style.display = 'none';
  searchTop.classList.add('show');
  searchInput.focus();
});

/* 검색 닫기 */
searchClose.addEventListener('click', () => {
  searchTop.classList.remove('show');
  topBar.style.display = 'flex';

  searchInput.value = '';
  searchClear.style.display = 'none';

  results = [];
  current = 0;
  countEl.textContent = '';
  clearHighlight();
});

/* 🔍 검색 입력 (하나만 존재해야 함) */
searchInput.addEventListener('input', () => {
  const keyword = searchInput.value.trim();

  searchClear.style.display = keyword ? 'block' : 'none';

  clearHighlight();
  results = [];
  current = 0;

  if (!keyword) {
    countEl.textContent = '';
    return;
  }

  bubbles.forEach(bubble => {
    const text = bubble.textContent;
    if (text.includes(keyword)) {
      bubble.innerHTML = text.replace(
        new RegExp(keyword, 'gi'),
        `<strong>$&</strong>`
      );
      results.push(bubble);
    }
  });

  results.length
    ? moveToResult(0)
    : (countEl.textContent = '0 / 0');
});

/* 이전 / 다음 */
searchPrev.addEventListener('click', () => move(-1));
searchNext.addEventListener('click', () => move(1));

function move(step) {
  if (!results.length) return;
  current = (current + step + results.length) % results.length;
  moveToResult(current);
}

function moveToResult(index) {
  results[index].scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
  countEl.textContent = `${index + 1} / ${results.length}`;
}

/* 입력 지우기 */
searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchInput.focus();
  searchClear.style.display = 'none';

  results = [];
  current = 0;
  countEl.textContent = '';
  clearHighlight();
});

/* 강조 제거 */
function clearHighlight() {
  bubbles.forEach(bubble => {
    bubble.innerHTML = bubble.textContent;
  });
}
