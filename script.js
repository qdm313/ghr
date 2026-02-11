// ============================================================
// 3. 핵심 기능 함수들
// ============================================================

// 모든 섹션 숨기기
function hideAll() {
  document.getElementById('cover-scene').style.display = 'none';
  document.getElementById('prologue-scene').style.display = 'none';
  document.getElementById('grid-scene').style.display = 'none';
  document.getElementById('detail-scene').style.display = 'none';
	// 👇 [추가] 뒤로가기 버튼 레이어도 숨김
  document.getElementById('detail-back-layer').style.display = 'none';
}

// 프롤로그 시작
function showPrologue() {
  hideAll();

  const scene = document.getElementById('prologue-scene');
  const contentBox = document.getElementById('prologue-content');
  const endBtn = document.getElementById('prologue-end-btn');

  scene.style.display = 'block';
  scene.scrollTop = 0;

  let fullHTML = "";

  prologueData.forEach(data => {
    fullHTML += `
      <div style="margin-bottom:50px;">
        <div class="prologue-section-tag">${data.tag}</div>
        <div style="margin-top:15px;">
          ${data.html}
        </div>
      </div>
    `;
  });

  fullHTML += `
    <div style="text-align:center; margin-top:60px; opacity:0.8;">
      ...그렇게 당신의 이야기가 시작된다.
    </div>
  `;

  contentBox.innerHTML = fullHTML;

  endBtn.style.display = 'block';
}


// ============================================================
// 강호 세력도(그리드)
// ============================================================

function showGrid() {
  const detailScene = document.getElementById('detail-scene');
  const gridScene = document.getElementById('grid-scene');

  if (detailScene) {
    detailScene.classList.remove('show');
  }

  hideAll();

  if (gridScene) {
    gridScene.scrollTop = 0;
    gridScene.style.display = 'block';
  }
}

// ============================================================
// 문파 상세 정보
// ============================================================

function showDetail(name) {
  const data = worldData[name];
  if (!data) return;

  const detailScene = document.getElementById('detail-scene');
  const backLayer = document.getElementById('detail-back-layer'); // 👇 [추가]

  glow.classList.remove('active');

  hideAll();
  
  // 화면 보이기
  detailScene.style.display = 'block';
  backLayer.style.display = 'block'; // 👇 [추가] 버튼 보이기

  detailScene.scrollTop = 0;
  detailScene.classList.remove('show');

  document.getElementById('detail-title').innerText = name;
  document.getElementById('detail-img').src = data.img;
  document.getElementById('detail-description').innerHTML = data.desc;
  document.getElementById('detail-status').innerText = data.status;

  requestAnimationFrame(() => {
    detailScene.classList.add('show');
    // 버튼은 별도 애니메이션 없이 그냥 보여도 무방하나, 원하시면 여기에 backLayer 클래스 추가 가능
  });
}

const detailScene = document.getElementById('detail-scene');
const glow = document.getElementById('scroll-glow');

detailScene.addEventListener('scroll', () => {
  const canScroll =
    detailScene.scrollHeight > detailScene.clientHeight + 5;

  if (!canScroll) return;

  const nearBottom =
    detailScene.scrollTop + detailScene.clientHeight >=
    detailScene.scrollHeight - 5;

  if (nearBottom) {
    glow.classList.remove('active');
    void glow.offsetWidth;
    glow.classList.add('active');
  }
});

// ============================================================
// 모바일 더블탭 확대 방지
// ============================================================

let lastTouchTime = 0;

document.addEventListener(
  'touchend',
  function (e) {
    const now = Date.now();
    if (now - lastTouchTime <= 300) {
      e.preventDefault();
    }
    lastTouchTime = now;
  },
  { passive: false }
);

// ============================================================
// 탭 전환 기능
// ============================================================

function switchGridTab(tabName) {
  // 1. 모든 탭 콘텐츠 숨기기
  const contents = document.querySelectorAll('.sub-tab-content');
  contents.forEach(c => c.classList.remove('active'));

  // 2. 모든 탭 버튼 비활성화
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(t => t.classList.remove('active'));

  // 3. 선택한 탭 콘텐츠 활성화
  document
    .getElementById(`sub-grid-${tabName}`)
    .classList.add('active');

  // 4. 버튼 활성화 (인덱스 기반)
  const btnIndex =
    tabName === 'map' ? 0 :
    tabName === 'episode' ? 1 : 2;

  tabs[btnIndex].classList.add('active');
	
	// === 여기 추가 ===
  if (tabName === 'episode') renderEpisode();
  if (tabName === 'rank') renderRank();

  // 5. 스크롤 초기화
  document.getElementById('grid-scene').scrollTop = 0;
}

// ============================================================
// onclick를 지우고 다음으로 변경됨
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  const root = document.querySelector('.game-window');

  root.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    const tab = e.target.dataset.tab;
    const name = e.target.dataset.name;

    if (action === 'open-grid') {
      e.stopPropagation();
      showGrid();
    }

    if (action === 'reload') location.reload();
    if (action === 'back-grid') showGrid();

    if (tab) switchGridTab(tab);
    if (name) showDetail(name);
  });

  // 🔥 이거 추가
  document
    .getElementById('cover-scene')
    .addEventListener('click', showPrologue);
});



// ============================================================
// 무력수준 호출
// ============================================================
function renderRank() {
  const container = document.getElementById('rank-container');
  container.innerHTML = '';

  if (!rankData || rankData.length === 0) {
    container.innerHTML = '<p>아직 공개된 공력 순위가 없습니다.</p>';
    return;
  }

  rankData
    .sort((a, b) => b.power - a.power)
    .forEach((item, index) => {

      const row = document.createElement('div');
      row.style.padding = '12px 0';
      row.style.borderBottom = '1px solid rgba(255,255,255,0.08)';

      const conditionalText = item.conditional
        ? ` ( ${item.conditional.condition} 시 ${item.conditional.power}년 )`
        : '';

      const traitText = item.trait
        ? ` <span style="opacity:0.6;">| ${item.trait}</span>`
        : '';

      row.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          
          <!-- 왼쪽 -->
          <div>
            <strong>${index + 1}. ${item.name}</strong>
            <div style="font-size:0.9em; opacity:0.85;">
              공력 ${item.power}년${conditionalText}
              ${traitText}
            </div>
          </div>

          <!-- 오른쪽 -->
          <div style="font-size:0.85em; opacity:0.6;">
            ${item.faction}
          </div>

        </div>
      `;

      container.appendChild(row);
    });
}

// ============================================================
// 배정EP 호출
// ============================================================

function renderEpisode() {
  const container = document.getElementById('episode-container');
  container.innerHTML = '';

  // ===== 메인 EP =====
  const mainTitle = document.createElement('h3');
  mainTitle.innerText = "메인 EP";
  container.appendChild(mainTitle);

  episodeData.main.forEach(ep => {
    container.appendChild(createEpRow(ep, true));
  });

  // ===== 풍문 =====
  const rumorTitle = document.createElement('h3');
  rumorTitle.innerText = "강호 풍문";
  rumorTitle.style.marginTop = "30px";
  container.appendChild(rumorTitle);

  episodeData.rumor.forEach(ep => {
    container.appendChild(createEpRow(ep, false));
  });
}

function createEpRow(ep, isMain) {
  const row = document.createElement('div');
  row.style.padding = "10px 0";
  row.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
  row.style.opacity = ep.status === "locked" ? "0.4" : "1";

  row.innerHTML = `
    <strong>${ep.title}</strong>
    <div style="font-size:0.9em; opacity:0.7;">
      ${ep.desc}
    </div>
  `;

  return row;
}
