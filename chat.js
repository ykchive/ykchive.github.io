document.addEventListener('DOMContentLoaded', () => {

  /* ===================== */
  /* 날짜 + 요일 */
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
  const viewer = document.getElementById('photoViewer');
  const viewerImg = document.getElementById('photoViewerImg');

  document.querySelectorAll('.photo').forEach(img => {
    img.addEventListener('click', () => {
      viewerImg.src = img.src;
      viewer.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  });

  viewer.addEventListener('click', e => {
    if (e.target === viewer) {
      viewer.classList.remove('show');
      viewerImg.src = '';
      document.body.style.overflow = '';
    }
  });

  /* ===================== */
  /* 음성 메시지 */
  /* ===================== */
  document.querySelectorAll('.voice-bubble').forEach(bubble => {
    const audio = bubble.querySelector('audio');
    const btn   = bubble.querySelector('.voice-btn');
    const bar   = bubble.querySelector('.voice-bar');
    const cur   = bubble.querySelector('.voice-current');
    const total = bubble.querySelector('.voice-total');
    if (!audio) return;

    const format = s =>
      `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2,'0')}`;

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

  /* ===================== */
  /* 검색 */
  /* ===================== */
  const topBar = document.querySelector('.top-bar');
  const searchBtn = document.getElementById('searchBtn');
  const searchCancel = document.getElementById('searchCancel');
  const searchInput = document.getElementById('searchInput');
  const searchNav = document.getElementById('searchNav');
  const searchCount = document.getElementById('searchCount');
  const prevBtn = document.getElementById('prevResult');
  const nextBtn = document.getElementById('nextResult');

  let results = [];
  let index = 0;

  searchBtn.addEventListener('click', () => {
    topBar.classList.add('searching');
    searchInput.focus();
    clear();
  });

  searchCancel.addEventListener('click', () => {
    topBar.classList.remove('searching');
    searchInput.value = '';
    clear();
  });

  searchInput.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    clear();

    const word = searchInput.value.toLowerCase();
    document.querySelectorAll('.bubble').forEach(b => {
      if (!b.textContent.toLowerCase().includes(word)) return;
      b.innerHTML = b.textContent.replace(
        new RegExp(word, 'gi'),
        `<span class="highlight">$&</span>`
      );
      results.push(b.closest('.message'));
    });

    if (!results.length) return alert('검색 결과가 없습니다.');
    searchNav.style.display = 'flex';
    move(0);
  });

  function move(i) {
    index = i;
    results[i].scrollIntoView({ behavior:'smooth', block:'center' });
    searchCount.textContent = `${i+1} / ${results.length}`;
  }

  prevBtn.onclick = () => index > 0 && move(index - 1);
  nextBtn.onclick = () => index < results.length - 1 && move(index + 1);

  function clear() {
    results = [];
    index = 0;
    searchNav.style.display = 'none';
    document.querySelectorAll('.highlight').forEach(h => h.outerHTML = h.textContent);
  }

  /* ===================== */
  /* 사이드 메뉴 */
  /* ===================== */
  const menuBtn = document.getElementById('menuBtn');
  const sideMenu = document.getElementById('sideMenu');

  menuBtn.onclick = () => {
    sideMenu.classList.add('show');
    document.body.style.overflow = 'hidden';
  };

  sideMenu.onclick = e => {
    if (e.target === sideMenu) {
      sideMenu.classList.remove('show');
      document.body.style.overflow = '';
    }
  };

/* 날짜별 보기 */
const dateToggle = document.querySelector('.date-toggle');
const dateTitle  = document.querySelector('.date-toggle-title');
const dateList   = document.querySelector('.date-list');

dateTitle.onclick = () => dateToggle.classList.toggle('open');

dateList.innerHTML = '';
document.querySelectorAll('.date').forEach(d => {
  const li = document.createElement('li');
  li.textContent = d.textContent;

  li.onclick = () => {
    sideMenu.classList.remove('show');
    document.body.style.overflow = '';

    setTimeout(() => {
      const topBarHeight = topBar ? topBar.offsetHeight : 0;
      const y = d.offsetTop - topBarHeight;

      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }, 200);
  };

  dateList.appendChild(li);
});

});
