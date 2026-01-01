/* ===================== */
/* 사진 전체보기 */
/* ===================== */
const viewer = document.getElementById('photoViewer');
const viewerImg = document.getElementById('photoViewerImg');
const photos = Array.from(document.querySelectorAll('.chat .photo'));

let currentIndex = 0;
let startX = 0;

/* 사진 클릭 → 열기 */
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
  }, 150);
}

/* 배경 클릭 → 닫기 */
viewer.addEventListener('click', e => {
  if (e.target === viewer) closeViewer();
});

/* 이미지 클릭 시 닫히지 않게 */
viewerImg.addEventListener('click', e => {
  e.stopPropagation();
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
  diff > 0 ? nextPhoto() : prevPhoto();
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

/* ===================== */
/* 음성 메시지 */
/* ===================== */
document.querySelectorAll('.voice-bubble').forEach(bubble => {
  const audio = bubble.querySelector('audio');
  if (!audio) return;

  const btn   = bubble.querySelector('.voice-btn');
  const bar   = bubble.querySelector('.voice-bar');
  const cur   = bubble.querySelector('.voice-current');
  const total = bubble.querySelector('.voice-total');

  let wasPlaying = false;

  /* 시간 포맷 */
  const format = s => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  /* 메타데이터 */
  audio.addEventListener('loadedmetadata', () => {
    bar.min = 0;
    bar.max = audio.duration;
    bar.value = 0;
    cur.textContent = '0:00';
    total.textContent = format(audio.duration);
  });

  /* 재생 / 일시정지 */
  btn.addEventListener('click', () => {
    // 다른 음성 전부 정지
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

  /* 재생 중 */
  audio.addEventListener('timeupdate', () => {
    bar.value = audio.currentTime;
    cur.textContent = format(audio.currentTime);
  });

  /* 드래그 UX */
  const pauseForDrag = () => {
    wasPlaying = !audio.paused;
    audio.pause();
  };

  bar.addEventListener('mousedown', pauseForDrag);
  bar.addEventListener('touchstart', pauseForDrag);

  bar.addEventListener('input', () => {
    audio.currentTime = bar.value;
    cur.textContent = format(bar.value);
  });

  const resumeAfterDrag = () => {
    if (wasPlaying) audio.play();
  };

  bar.addEventListener('mouseup', resumeAfterDrag);
  bar.addEventListener('touchend', resumeAfterDrag);

  /* 종료 */
  audio.addEventListener('ended', () => {
    btn.classList.remove('playing');
    bar.value = 0;
    cur.textContent = '0:00';
  });
});
