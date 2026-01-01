const viewer = document.getElementById('viewer');
const viewerImg = document.getElementById('viewerImg');
const viewerDate = document.getElementById('viewerDate');
const viewerLink = document.getElementById('viewerLink');

document.querySelectorAll('.album img').forEach(img => {
  img.onclick = () => {
    viewerImg.src = img.src;
    viewerDate.textContent = img.dataset.date;
    viewerLink.href = img.dataset.link;
    viewer.classList.add('show');
  };
});

// 사진 바깥 클릭하면 닫기
viewer.onclick = (e) => {
  if (e.target === viewer) {
    viewer.classList.remove('show');
  }
};
