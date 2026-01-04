document.addEventListener('DOMContentLoaded', () => {

  /* ===================== */
  /* 날짜 + 요일 자동 생성 */
  /* ===================== */
  document.querySelectorAll('.date').forEach(el => {
    const raw = el.dataset.date;
    if (!raw) return;

    const [y, m, d] = raw.split('-').map(Number);
    const date = new Date(y, m - 1, d); // 월 -1 필수
    const week = ['일','월','화','수','목','금','토'];

    el.textContent = `${y}년 ${m}월 ${d}일 ${week[date.getDay()]}요일`;
  });


  /* ===================== */
  /* 사진 전체보기 (있을 때만) */
  /* ===================== */
  const viewer = document.getElementById('photoViewer');
  const viewerImg = document.getElementById('photoViewerImg');
  const photos = document.querySelectorAll('.photo');

  let currentIndex = 0;
  let startX = 0;

  if (viewer && viewerImg && photos.length > 0) {

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
  /* 음성 메시지 (있을 때만) */
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

});

function toggleMenu() {
  document.getElementById('sideMenu').classList.toggle('open');
  document.getElementById('dim').classList.toggle('show');
  document.querySelector('.menu-btn').classList.toggle('hide');
  document.getElementById('searchBox').style.display = 'none';
}

function toggleMonth(el) {
  const list = el.nextElementSibling;
  const isOpen = list.classList.contains('open');

  list.classList.toggle('open', !isOpen);
  el.classList.toggle('open', !isOpen);
}

function toggleSearch() {
  const box = document.getElementById('searchBox');
  const input = box.querySelector('input');

  if (box.style.display === 'block') {
    box.style.display = 'none';
    input.value = '';
    filterDates('');
  } else {
    box.style.display = 'block';
    input.focus();
  }
}

function filterDates(keyword) {
  const months = document.querySelectorAll('.month');

  months.forEach(month => {
    const title = month.querySelector('.month-title');
    const list = month.querySelector('.date-list');
    const items = list.querySelectorAll('li');

    let hasMatch = false;

    items.forEach(li => {
      if (li.textContent.includes(keyword)) {
        li.style.display = 'block';
        hasMatch = true;
      } else {
        li.style.display = 'none';
      }
    });

    if (keyword) {
      if (hasMatch) {
        month.style.display = 'block';
        list.classList.add('open');
        title.classList.add('open');
      } else {
        month.style.display = 'none';
      }
    } else {
      month.style.display = 'block';
      items.forEach(li => li.style.display = 'block');
      list.classList.remove('open');
      title.classList.remove('open');
    }
  });
}
