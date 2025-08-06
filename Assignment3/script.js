// Life Rhythm App - Apple-style Health Monitoring
const app = document.getElementById('app');
let userName = '';
let currentTab = 'main';
let healthData = {};
let healthTimer = null;
let abnormalMetrics = [];

const metrics = [
  { key: 'heartRate', label: 'Heart Rate', icon: '❤️', min: 55, max: 100, unit: 'bpm', abnormal: v => v < 55 || v > 100 },
  { key: 'bloodPressure', label: 'Blood Pressure', icon: '🩸', min: 90, max: 130, unit: 'mmHg', abnormal: v => v < 90 || v > 130 },
  { key: 'oxygen', label: 'Oxygen Saturation', icon: '🫁', min: 95, max: 100, unit: '%', abnormal: v => v < 95 },
  { key: 'temperature', label: 'Body Temp', icon: '🌡️', min: 36.1, max: 37.8, unit: '°C', abnormal: v => v < 36.1 || v > 37.8 },
  { key: 'glucose', label: 'Glucose Level', icon: '🧬', min: 70, max: 140, unit: 'mg/dL', abnormal: v => v < 70 || v > 140 },
  { key: 'stress', label: 'Stress Index', icon: '😌', min: 0, max: 60, unit: '', abnormal: v => v > 60 },
  { key: 'respiratory', label: 'Respiratory Rate', icon: '💨', min: 12, max: 20, unit: 'rpm', abnormal: v => v < 12 || v > 20 },
  { key: 'sleep', label: 'Sleep Quality', icon: '🛌', min: 70, max: 100, unit: '%', abnormal: v => v < 70 },
];

function renderLogin() {
  app.innerHTML = `
    <div class="lr-login lr-fade">
      <div class="lr-login-title">Life Rhythm App</div>
      <form class="lr-login-form" autocomplete="off">
        <input class="lr-input" type="text" placeholder="User Name" id="lr-username" required autofocus>
        <input class="lr-input" type="password" value="••••••" disabled>
        <button class="lr-login-btn" type="submit">Login</button>
      </form>
    </div>
  `;
  document.querySelector('.lr-login-form').onsubmit = e => {
    e.preventDefault();
    const name = document.getElementById('lr-username').value.trim();
    if (name) {
      userName = name;
      renderVideo();
    }
  };
}

function renderVideo() {
  app.innerHTML = `
    <div class="lr-video-wrap lr-fade" id="lr-video-wrap">
      <video class="lr-video" id="lr-video" src="Videos/Opening.mp4" autoplay playsinline></video>
    </div>
  `;
  const video = document.getElementById('lr-video');
  video.onended = () => {
    const wrap = document.getElementById('lr-video-wrap');
    wrap.classList.add('swipe-out');
    setTimeout(() => {
      renderDashboard();
    }, 700);
  };
}

function renderNavbar() {
  return `
    <nav class="lr-navbar">
      <button class="lr-nav-btn${currentTab==='main'?' selected':''}" onclick="window.lrTab('main')">Main${currentTab==='main'?'<span class="lr-pill"></span>':''}</button>
      <button class="lr-nav-btn${currentTab==='appointment'?' selected':''}" onclick="window.lrTab('appointment')">Quick Appointment${currentTab==='appointment'?'<span class="lr-pill"></span>':''}</button>
      <button class="lr-nav-btn${currentTab==='contact'?' selected':''}" onclick="window.lrTab('contact')">Contact Us${currentTab==='contact'?'<span class="lr-pill"></span>':''}</button>
      <button class="lr-nav-btn" id="lr-learn-btn" onclick="window.location.href='learn.html'">Learn More</button>
    </nav>
  `;
}

// Add hover/active styling for nav buttons if not present
if (!document.getElementById('lr-navbar-style')) {
  const style = document.createElement('style');
  style.id = 'lr-navbar-style';
  style.innerHTML = `
    .lr-navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fff;
      padding: 0.7rem 1.2rem;
      box-shadow: 0 2px 12px rgba(28,28,30,0.07);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .lr-nav-btn {
      background: none;
      border: none;
      font-family: inherit;
      font-size: 1.13rem;
      font-weight: 600;
      color: #1C1C1E;
      padding: 0.6rem 1.3rem;
      border-radius: 22px;
      margin: 0 0.2rem;
      cursor: pointer;
      transition: background 0.18s, color 0.18s;
      position: relative;
    }
    .lr-nav-btn.selected, .lr-nav-btn:hover {
      background: #F2F2F7;
      color: #007AFF;
    }
    .lr-pill {
      display: inline-block;
      background: #007AFF;
      border-radius: 12px;
      width: 32px;
      height: 6px;
      position: absolute;
      left: 50%;
      bottom: 6px;
      transform: translateX(-50%);
    }
    @media (max-width: 600px) {
      .lr-navbar { padding: 0.5rem 0.3rem; }
      .lr-nav-btn { font-size: 1rem; padding: 0.5rem 0.7rem; }
    }
  `;
  document.head.appendChild(style);
}

function randomMetric(m) {
  if (m.key === 'temperature') return +(Math.random()*(m.max-m.min)+m.min).toFixed(1);
  if (m.key === 'sleep') return Math.floor(Math.random()*(m.max-m.min+1)+m.min);
  if (m.key === 'oxygen') return Math.floor(Math.random()*(m.max-m.min+1)+m.min);
  if (m.key === 'stress') return Math.floor(Math.random()*80);
  return Math.floor(Math.random()*(m.max-m.min+1)+m.min);
}

function updateHealthData() {
  healthData = {};
  abnormalMetrics = [];
  metrics.forEach(m => {
    const v = randomMetric(m);
    healthData[m.key] = v;
    if (m.abnormal(v)) abnormalMetrics.push(m.key);
  });
}

function renderMetrics() {
  return `<div class="lr-metrics">
    ${metrics.map(m => {
      const v = healthData[m.key];
      const abnormal = m.abnormal(v);
      return `<div class="lr-card">
        <div class="lr-card-icon">${m.icon}</div>
        <div class="lr-card-label">${m.label}</div>
        <div class="lr-card-value${abnormal?' abnormal':''}">${v} ${m.unit}</div>
      </div>`;
    }).join('')}
  </div>`;
}

function renderRiskBanner() {
  if (abnormalMetrics.length === 0) {
    return `<div class="lr-risk-banner healthy lr-fade">You are completely healthy.</div>`;
  }
  // Show first abnormal metric risk
  const m = metrics.find(x => abnormalMetrics.includes(x.key));
  let msg = '';
  switch(m.key) {
    case 'bloodPressure': msg = 'Elevated blood pressure – risk of hypertension.'; break;
    case 'heartRate': msg = 'Abnormal heart rate – risk of arrhythmia.'; break;
    case 'oxygen': msg = 'Low oxygen saturation – risk of hypoxemia.'; break;
    case 'temperature': msg = 'Abnormal body temperature – possible fever or hypothermia.'; break;
    case 'glucose': msg = 'Abnormal glucose – risk of diabetes.'; break;
    case 'stress': msg = 'High stress index – risk of anxiety.'; break;
    case 'respiratory': msg = 'Abnormal respiratory rate – possible respiratory issue.'; break;
    case 'sleep': msg = 'Poor sleep quality – risk of fatigue.'; break;
    default: msg = 'Health risk detected.';
  }
  return `<div class="lr-risk-banner warning lr-fade">${msg}</div>`;
}

function renderFooter() {
  return `<footer class="lr-footer">© 2090 Life Rhythm Medical Systems. All rights reserved.<br>support@liferhythm.ai</footer>`;
}

function renderDashboard() {
  currentTab = 'main';
  updateHealthData();
  app.innerHTML = `
    ${renderNavbar()}
    <main class="lr-dashboard lr-slide">
      ${renderMetrics()}
      ${renderRiskBanner()}
    </main>
    ${renderFooter()}
  `;
  startHealthUpdates();
  window.lrTab = switchTab;
}

function startHealthUpdates() {
  if (healthTimer) clearInterval(healthTimer);
  healthTimer = setInterval(() => {
    updateHealthData();
    const metricsDiv = document.querySelector('.lr-metrics');
    if (metricsDiv) {
      metricsDiv.innerHTML = metrics.map(m => {
        const v = healthData[m.key];
        const abnormal = m.abnormal(v);
        return `<div class=\"lr-card\">
          <div class=\"lr-card-icon\">${m.icon}</div>
          <div class=\"lr-card-label\">${m.label}</div>
          <div class=\"lr-card-value${abnormal?' abnormal':''}\">${v} ${m.unit}</div>
        </div>`;
      }).join('');
    }
    const riskDiv = document.querySelector('.lr-risk-banner');
    if (riskDiv) {
      riskDiv.outerHTML = renderRiskBanner();
    }
  }, Math.floor(Math.random()*15000)+15000);
}

function switchTab(tab) {
  currentTab = tab;
  if (healthTimer) clearInterval(healthTimer);
  if (tab === 'main') {
    renderDashboard();
    return;
  }
  if (tab === 'appointment') {
    renderAppointment();
    return;
  }
  if (tab === 'contact') {
    renderContact();
    return;
  }
}

function renderAppointment() {
  app.innerHTML = `
    ${renderNavbar()}
    <section class="lr-appointment lr-slide">
      <button class="lr-appointment-btn" ${abnormalMetrics.length===0?'disabled title="You are completely healthy!"':''} onclick="window.lrBookAppointment()">Book Quick Appointment</button>
      <div id="lr-appointment-warning"></div>
      <div class="lr-medical-records">
        <div class="lr-medical-records-title">Medical Records</div>
        <div class="lr-medical-records-list">
          <div class="lr-medical-record">
            <span class="lr-medical-label">${userName}</span>
            <span class="lr-medical-label">Fever</span>
            <span class="lr-medical-status">Recovered</span>
            <span class="lr-medical-date">2093-11-02</span>
          </div>
          <div class="lr-medical-record">
            <span class="lr-medical-label">${userName}</span>
            <span class="lr-medical-label">Seasonal Flu</span>
            <span class="lr-medical-status">Recovered</span>
            <span class="lr-medical-date">2093-03-15</span>
          </div>
          <div class="lr-medical-record">
            <span class="lr-medical-label">${userName}</span>
            <span class="lr-medical-label">Minor Injury</span>
            <span class="lr-medical-status">Recovered</span>
            <span class="lr-medical-date">2092-07-22</span>
          </div>
          <div class="lr-medical-record">
            <span class="lr-medical-label">${userName}</span>
            <span class="lr-medical-label">Headache</span>
            <span class="lr-medical-status">Recovered</span>
            <span class="lr-medical-date">2092-02-10</span>
          </div>
          <div class="lr-medical-record">
            <span class="lr-medical-label">${userName}</span>
            <span class="lr-medical-label">Cough</span>
            <span class="lr-medical-status">Recovered</span>
            <span class="lr-medical-date">2091-12-05</span>
          </div>
           <div class="lr-medical-record">
            <span class="lr-medical-label">${userName}</span>
            <span class="lr-medical-label">Fabry disease</span>
            <span class="lr-medical-status" style="color:#FF3B30;font-weight:600;">In treatment</span>
            <span class="lr-medical-date">2090-12-05</span>
          </div>
        </div>
      </div>
    </section>
    ${renderFooter()}
  `;
  window.lrTab = switchTab;
  window.lrBookAppointment = () => {
    if (abnormalMetrics.length > 0) {
      document.getElementById('lr-appointment-warning').innerHTML = '<div class="lr-appointment-warning">No attached medical area found.</div>';
      // Play error sound
      let audio = document.getElementById('lr-error-audio');
      if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'lr-error-audio';
        audio.src = 'sounds/error.MP4';
        audio.style.display = 'none';
        document.body.appendChild(audio);
      }
      audio.currentTime = 0;
      audio.play();
    }
  };
}

function renderContact() {
  app.innerHTML = `
    ${renderNavbar()}
    <section class="lr-chat lr-slide" id="lr-chat-section">
      <div id="lr-chat-messages">${renderChatMsgs()}</div>
    </section>
    <form id="lr-chat-input-wrap" class="lr-chat-input-wrap" autocomplete="off" onsubmit="return false;">
      <input id="lr-chat-input" class="lr-chat-input" type="text" placeholder="Type a message..." maxlength="300" />
      <button id="lr-chat-send" class="lr-chat-send" type="button">Send</button>
    </form>
    ${renderFooter()}
  `;
  window.lrTab = switchTab;
  // Sliding animation for chat (WeChat style)
  const chatSection = document.getElementById('lr-chat-section');
  chatSection.classList.add('lr-slide-chat');
  // Input field logic
  const input = document.getElementById('lr-chat-input');
  const sendBtn = document.getElementById('lr-chat-send');
  sendBtn.onclick = () => {
    const val = input.value.trim();
    if (val) {
      addUserMessage(val);
      input.value = '';
    }
  };
  input.onkeydown = e => {
    if (e.key === 'Enter') sendBtn.onclick();
  };
  function addUserMessage(text) {
    const messages = document.getElementById('lr-chat-messages');
    const now = new Date();
    // Current time for user-sent messages
    const ts = now.getFullYear() + '-' +
      String(now.getMonth()+1).padStart(2,'0') + '-' +
      String(now.getDate()).padStart(2,'0') + ' ' +
      now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    messages.innerHTML += `
      <div class="lr-chat-msg user lr-slide-chat">
        <div class="lr-chat-bubble">${text}</div>
        <div class="lr-chat-timestamp">${ts}</div>
        <div class="lr-chat-network">Not connected to 10G network</div>
      </div>
    `;
    messages.scrollTop = messages.scrollHeight;
  }
  // Inject WeChat style chat CSS if not present
  if (!document.getElementById('lr-chat-style')) {
    const style = document.createElement('style');
    style.id = 'lr-chat-style';
    style.innerHTML = `
    .lr-slide-chat {
      animation: lr-slide-chat-in 0.5s cubic-bezier(.6,.2,.2,1);
    }
    @keyframes lr-slide-chat-in {
      from { transform: translateY(40px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .lr-chat-input-wrap {
      position: fixed;
      left: 0; right: 0; bottom: 0;
      background: #fff;
      display: flex;
      align-items: center;
      padding: 0.7rem 1.2rem;
      box-shadow: 0 -2px 12px rgba(28,28,30,0.07);
      z-index: 100;
    }
    .lr-chat-input {
      flex: 1;
      border-radius: 18px;
      border: 1px solid #e5e5ea;
      padding: 0.9rem 1.2rem;
      font-size: 1.1rem;
      font-family: inherit;
      margin-right: 0.7rem;
      outline: none;
      background: #F2F2F7;
    }
    .lr-chat-send {
      background: var(--accent-blue);
      color: #fff;
      border: none;
      border-radius: 18px;
      padding: 0.9rem 1.6rem;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: var(--shadow);
      transition: background 0.2s;
    }
    .lr-chat-send:active {
      background: #005ecb;
    }
    .lr-chat-network {
      width: 100%;
      text-align: center;
      font-size: 0.92rem;
      color: #8e8e93;
      margin-top: 0.2rem;
    }
    @media (max-width: 600px) {
      .lr-chat-input-wrap {
        padding: 0.5rem 0.3rem;
      }
      .lr-chat-input {
        font-size: 1rem;
        padding: 0.7rem 0.8rem;
      }
      .lr-chat-send {
        font-size: 1rem;
        padding: 0.7rem 1rem;
      }
    }
    `;
    document.head.appendChild(style);
  }
}

function renderChatMsgs() {
  // Fixed timestamps for the four preset messages
  const timestamps = [
    "2090-04-01 09:13",
    "2090-09-17 15:42",
    "2092-08-02 14:23",
    "2096-08-01 21:05"
  ];
  const userMessages = [
    "(｡･∀･)ﾉﾞHi, I saw in the manual that this thing needs to be activated here.",
    "Hello, the chip shows 'You have a risk of Fabry disease and need to be checked immediately.' I'm only 12 years old and have never heard of this, nor do I feel any discomfort. Is the chip broken?",
    "The news said there seemed to be some issues with this chip. But I think it's really helped me a lot. My classmates at school in my small town have said that since getting this chip, no one has ever gotten an infectious disease. And my mom said I'll have to get injections every week, and without the subsidy, our family wouldn't be able to afford treatment. So I hope you can persevere. Keep going!",
    "Is my Life Rhythm Detector chip data private and secure?"
  ];
  let chat = '';
  for (let c = 0; c < 4; c++) {
    chat += `
      <div class="lr-chat-msg user lr-slide-chat">
        <div class="lr-chat-bubble">${userMessages[c]}</div>
        <div class="lr-chat-timestamp">${timestamps[c]}</div>
      </div>
      <div class="lr-chat-msg lr-slide-chat">
        <div class="lr-chat-bubble">AI voice session ended.</div>
        <div class="lr-chat-timestamp">${timestamps[c]}</div>
      </div>
    `;
  }
  return chat;
}

// Initial render
renderLogin();
