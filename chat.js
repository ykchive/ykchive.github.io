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
  const counter = document.getElementById('photoCounter');

  let currentIndex = 0;
  let startX = 0;

  // 사진 클릭 → 뷰어 열기
  photos.forEach((photo, index) => {
    photo.addEventListener('click', () => {
      currentIndex = index;
      openViewer();
    });
  });

  function openViewer() {
    viewerImg.src = photos[currentIndex].src;
    counter.textContent = `${currentIndex + 1} / ${photos.length}`;
    viewer.classList.add('show');
  }

  function closeViewer() {
    viewer.classList.remove('show');
  }

  // 이전 / 다음 버튼
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

  // 👉 스와이프 시작
  viewer.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });

  // 👉 스와이프 끝
  viewer.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < photos.length - 1) {
        currentIndex++; // 왼쪽으로 밀기 → 다음
      } else if (diff < 0 && currentIndex > 0) {
        currentIndex--; // 오른쪽으로 밀기 → 이전
      }
      openViewer();
    }
  });

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
   5. 채팅 검색 (A안 최종)
================================================== */
const topBar      = document.querySelector('.top-bar');
const searchBtn   = document.querySelector('.search-btn');
const searchInput = document.getElementById('searchInput');

const nav      = document.getElementById('searchNav');
const countEl  = document.getElementById('searchCount');
const prevBtn  = document.getElementById('prevBtn');
const nextBtn  = document.getElementById('nextBtn');

const bubbles = [...document.querySelectorAll('.bubble')];

let results = [];
let current = -1;

/* 검색 열기 */
searchBtn.addEventListener('click', () => {
  topBar.classList.add('search-active');
  searchInput.value = '';
  searchInput.focus();
});

/* 취소 */
document.getElementById('searchCancel').addEventListener('click', () => {
  topBar.classList.remove('search-active');
  nav.classList.remove('show');

  searchInput.value = '';
  results = [];
  current = -1;
  clearBold();
});

/* 입력 중: 아무 것도 안 함 (스크롤 ❌) */
searchInput.addEventListener('input', () => {
  nav.classList.remove('show');
  clearBold();
});

/* Enter → 검색 확정 */
searchInput.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;

  const keyword = searchInput.value.trim();
  if (!keyword) return;

  // 최근 메시지부터
  results = bubbles
    .slice()
    .reverse()
    .filter(b => b.textContent.includes(keyword));

  if (!results.length) {
    countEl.textContent = '0 / 0';
    return;
  }

  // 볼드 적용
  results.forEach(bubble => {
    bubble.innerHTML = bubble.textContent.replace(
      new RegExp(`(${keyword})`, 'gi'),
      '<strong>$1</strong>'
    );
  });

  current = 0;
  updateNav();
  nav.classList.add('show');

  searchInput.blur(); // 키보드 내림
  scrollToCurrent();
});

/* 위 / 아래 */
prevBtn.addEventListener('click', () => move(-1));
nextBtn.addEventListener('click', () => move(1));

function move(step) {
  if (!results.length) return;
  current = Math.min(
    Math.max(current + step, 0),
    results.length - 1
  );
  updateNav();
  scrollToCurrent();
}

function scrollToCurrent() {
  results[current].scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
}

function updateNav() {
  countEl.textContent = `${current + 1} / ${results.length}`;
}

/* 볼드 제거 */
function clearBold() {
  bubbles.forEach(bubble => {
    bubble.innerHTML = bubble.textContent;
  });
}
