/* ===================== */
/* 사진 전체보기 */
/* ===================== */
const viewer = document.getElementById('photoViewer');
const viewerImg = document.getElementById('photoViewerImg');
const photos = Array.from(document.querySelectorAll('.photo'));

let currentIndex = 0;
let startX = 0;

/* 열기 */
photos.forEach((img, i) => {
  img.addEventListener('click', () => {
    currentIndex = i;
    openViewer(img.src);
  });
});

function openViewer(src) {
  viewerImg.src = src;
  viewer.classList.add('show');
  document.body.style.overflow = 'hidden';
}

/* 닫기 */
function closeViewer() {
  viewer.classList.remove('show');
  document.body.style.overflow = '';

  setTimeout(() => {
    viewerImg.src = '';
  }, 200);
}

/* 배경 클릭 → 닫기 */
viewer.addEventListener('click', e => {
  if (e.target === viewer) {
    closeViewer();
  }
});

/* ===================== */
/* 좌우 스와이프 */
/* ===================== */
viewerImg.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
});

viewerImg.addEventListener('touchend', e => {
  const endX = e.changedTouches[0].clientX;
  const diff = startX - endX;

  if (Math.abs(diff) < 50) return;

  if (diff > 0) nextPhoto();
  else prevPhoto();
});

function nextPhoto() {
  if (currentIndex < photos.length - 1) {
    currentIndex++;
    viewerImg.src = photos[currentIndex].src;
  }
}

function prevPhoto() {
  if (currentIndex > 0) {
    currentIndex--;
    viewerImg.src = photos[currentIndex].src;
  }
}


document.querySelectorAll('.voice-bubble').forEach(bubble => {
  /* ===== 요소 연결 ===== */
  const audio = bubble.querySelector('audio');
  const btn   = bubble.querySelector('.voice-btn');
  const bar   = bubble.querySelector('.voice-bar');
  const cur   = bubble.querySelector('.voice-current');
  const total = bubble.querySelector('.voice-total');

  let wasPlaying = false; // 드래그 전 재생 상태 기억

  /* ===== 시간 포맷 ===== */
  const format = s => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  /* ===== 메타데이터 로드 ===== */
  audio.addEventListener('loadedmetadata', () => {
    bar.min = 0;
    bar.max = audio.duration;
    bar.value = 0;
    cur.textContent = '0:00';
    total.textContent = format(audio.duration);
  });

  /* ===== 재생 / 일시정지 ===== */
  btn.addEventListener('click', () => {
    // 다른 음성 멈추기
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

  /* ===== 재생 중 시간 업데이트 ===== */
  audio.addEventListener('timeupdate', () => {
    bar.value = audio.currentTime;
    cur.textContent = format(audio.currentTime);
  });

  /* ===== 재생바 드래그 UX ===== */
  bar.addEventListener('mousedown', () => {
    wasPlaying = !audio.paused;
    audio.pause();
  });

  bar.addEventListener('touchstart', () => {
    wasPlaying = !audio.paused;
    audio.pause();
  });

  bar.addEventListener('input', () => {
    audio.currentTime = bar.value;
    cur.textContent = format(bar.value);
  });

  bar.addEventListener('mouseup', () => {
    if (wasPlaying) audio.play();
  });

  bar.addEventListener('touchend', () => {
    if (wasPlaying) audio.play();
  });

  /* ===== 재생 종료 ===== */
  audio.addEventListener('ended', () => {
    btn.classList.remove('playing');
    bar.value = 0;
    cur.textContent = '0:00';
  });
});

/* ===== 날짜 자동 생성 ===== */
document.querySelectorAll('.date').forEach(el => {
  const raw = el.dataset.date;
  if (!raw) return;

  const d = new Date(raw);
  const week = ['일','월','화','수','목','금','토'];

  el.textContent =
    `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${week[d.getDay()]}요일`;
});
