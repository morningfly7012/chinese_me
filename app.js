/* 渲染儀表板：資料來自 data.js 的 ESSAYS / COMMON_ISSUES / ACTION_PLAN / DIMENSIONS */

const affEssays = ESSAYS.filter(e => e.type === '情意');
const cogEssays = ESSAYS.filter(e => e.type === '知性');
const avg = arr => arr.length ? (arr.reduce((s, x) => s + x, 0) / arr.length) : 0;
const fmt = n => (Math.round(n * 10) / 10).toFixed(1);
const pct = e => e.score / e.maxScore * 100;

/* ---- 統計卡片 ---- */
const best = ESSAYS.reduce((a, b) => (pct(b) > pct(a) ? b : a));
document.getElementById('statCards').innerHTML = [
  { num: ESSAYS.length, lbl: '已分析篇數' },
  { num: fmt(avg(ESSAYS.map(pct))) + '%', lbl: '平均得分率' },
  { num: fmt(avg(cogEssays.map(pct))) + '%', lbl: '知性平均（5 篇）' },
  { num: fmt(avg(affEssays.map(pct))) + '%', lbl: '情意平均（4 篇）' },
  { num: best.score + '/' + best.maxScore, lbl: '最高分（' + best.shortTitle + '）' },
].map(s => `<div class="stat"><div class="num">${s.num}</div><div class="lbl">${s.lbl}</div></div>`).join('');

/* ---- 圖表 ---- */
Chart.defaults.font.family = '"Noto Serif TC", serif';
const AFF = '#b3432b', COG = '#2b6cb0';
const ordered = [...cogEssays, ...affEssays];

new Chart(document.getElementById('barChart'), {
  type: 'bar',
  data: {
    labels: ordered.map(e => e.shortTitle),
    datasets: [{
      data: ordered.map(pct),
      backgroundColor: ordered.map(e => e.type === '情意' ? AFF : COG),
      borderRadius: 6,
    }]
  },
  options: {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: c => {
        const e = ordered[c.dataIndex];
        return `${e.grade}｜${e.score} / ${e.maxScore}（得分率 ${fmt(pct(e))}%）`;
      } } }
    },
    scales: { y: { min: 0, max: 100, ticks: { stepSize: 20, callback: v => v + '%' } } }
  }
});

new Chart(document.getElementById('lineChart'), {
  type: 'line',
  data: {
    labels: ['第1篇', '第2篇', '第3篇', '第4篇', '第5篇'],
    datasets: [
      { label: '知性', borderColor: COG, backgroundColor: COG, tension: .3, data: cogEssays.map(pct) },
      { label: '情意', borderColor: AFF, backgroundColor: AFF, tension: .3, data: affEssays.map(pct) },
    ]
  },
  options: {
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { callbacks: { label: c => {
        const e = (c.datasetIndex === 0 ? cogEssays : affEssays)[c.dataIndex];
        return `${e.shortTitle}：${e.score} / ${e.maxScore}（${fmt(pct(e))}%）`;
      } } }
    },
    scales: { y: { min: 0, max: 100, ticks: { stepSize: 20, callback: v => v + '%' } } }
  }
});

const dimKeys = Object.keys(DIMENSIONS.labels);
new Chart(document.getElementById('radarChart'), {
  type: 'radar',
  data: {
    labels: dimKeys.map(k => DIMENSIONS.labels[k]),
    datasets: [
      { label: '知性', borderColor: COG, backgroundColor: 'rgba(43,108,176,.15)', data: dimKeys.map(k => avg(cogEssays.map(e => e.dims[k]))) },
      { label: '情意', borderColor: AFF, backgroundColor: 'rgba(179,67,43,.15)', data: dimKeys.map(k => avg(affEssays.map(e => e.dims[k]))) },
    ]
  },
  options: {
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { r: { min: 0, max: 5, ticks: { stepSize: 1 } } }
  }
});

document.getElementById('radarSummary').innerHTML =
  `<h4 style="margin-bottom:10px;letter-spacing:.08em">解讀</h4>` + DIMENSIONS.summary;

/* ---- 常犯問題 ---- */
document.getElementById('issueList').innerHTML = COMMON_ISSUES.map((iss, i) => `
  <div class="card issue">
    <h3>${i + 1}. ${iss.title}</h3>
    <div class="freq">出現於：${iss.affected.map(id => {
      const e = ESSAYS.find(x => x.id === id);
      return `<span class="tag ${e.type === '情意' ? 'aff' : 'cog'}">${e.shortTitle}</span>`;
    }).join(' ')}</div>
    <p>${iss.desc}</p>
    ${iss.example ? `<div class="example">📌 實例：${iss.example}</div>` : ''}
    <div class="fix"><b>✦ 改進方法：</b>${iss.fix}</div>
  </div>`).join('');

/* ---- 逐篇詳解 ---- */
document.getElementById('essayList').innerHTML = ordered.map(e => `
  <div class="card essay ${e.type === '知性' ? 'cog' : ''}">
    <div class="essay-head">
      <span class="tag ${e.type === '情意' ? 'aff' : 'cog'}">${e.type}</span>
      <h3>${e.title}</h3>
      <span class="score-pill">${e.grade}｜${e.score} / ${e.maxScore}</span>
    </div>
    <div class="meta">${e.source}${e.subScores ? '｜' + e.subScores : ''}</div>
    <div class="prompt-box"><b>題目要求：</b>${e.prompt}</div>
    <p>${e.review}</p>
    <div class="cols">
      <div class="pane good"><h4>✓ 做得好的地方</h4><ul>${e.strengths.map(s => `<li>${s}</li>`).join('')}</ul></div>
      <div class="pane weak"><h4>✗ 待改進的地方</h4><ul>${e.weaknesses.map(s => `<li>${s}</li>`).join('')}</ul></div>
      <div class="pane teacher"><h4>📝 老師批改重點</h4><ul>${e.teacher.map(s => `<li>${s}</li>`).join('')}</ul></div>
      <div class="pane advice"><h4>🎯 下次怎麼寫會更好</h4><ul>${e.advice.map(s => `<li>${s}</li>`).join('')}</ul></div>
    </div>
    ${(e.rewrites || []).map(r => `
      <div class="rewrite">
        <div class="row">
          <div class="orig"><b>原句：</b>${r.orig}</div>
          <div class="better"><b>改寫示範：</b>${r.better}</div>
        </div>
        <div class="why">💡 ${r.why}</div>
      </div>`).join('')}
    <details class="scans">
      <summary>📄 作文全文謄錄</summary>
      <div class="fulltext">${e.fullText.map(p => `<p>${p}</p>`).join('')}</div>
    </details>
    <details class="scans">
      <summary>🖼 查看原稿掃描（${e.images.length} 頁）</summary>
      <div class="scan-thumbs">${e.images.map(src => `<img src="${src}" loading="lazy" alt="${e.shortTitle} 原稿">`).join('')}</div>
    </details>
  </div>`).join('');

/* ---- 行動計畫 ---- */
document.getElementById('planList').innerHTML = ACTION_PLAN.map(p => `<li><b>${p.title}</b>—${p.desc}</li>`).join('');

/* ---- Lightbox ---- */
const lb = document.getElementById('lightbox');
document.querySelectorAll('.scan-thumbs img').forEach(img => {
  img.addEventListener('click', () => { lb.querySelector('img').src = img.src; lb.classList.add('open'); });
});
lb.addEventListener('click', () => lb.classList.remove('open'));
