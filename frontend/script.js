// Grab DOM elements
const emailInput      = document.getElementById('email');
const passwordInput   = document.getElementById('password');
const nameInput       = document.getElementById('name');
const bioInput        = document.getElementById('bio');
const avatarInput     = document.getElementById('avatarUrl');
const postInput       = document.getElementById('postContent');

const authDiv         = document.getElementById('auth');
const appDiv          = document.getElementById('app');
const userNameSpan    = document.getElementById('userName');
const postsResult     = document.getElementById('postsResult');
const notificationsResult = document.getElementById('notificationsResult');

const userUrl  = 'http://localhost:4000';
const postUrl  = 'http://localhost:4001';
const notifUrl = 'http://localhost:4002';

let accessToken = '';
let user        = null;

async function register() {
  const res = await fetch(`${userUrl}/auth/register`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      email:     emailInput.value,
      password:  passwordInput.value,
      name:      nameInput.value,
      bio:       bioInput.value,
      avatarUrl: avatarInput.value
    })
  });
  alert(res.ok ? '✅ Registered' : '❌ ' + await res.text());
}

async function login() {
  const res = await fetch(`${userUrl}/auth/login`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      email:    emailInput.value,
      password: passwordInput.value
    })
  });
  if (!res.ok) return alert('❌ ' + await res.text());
  const body = await res.json();
  accessToken = body.accessToken;
  user        = body.user;
  userNameSpan.textContent = user.name || user.email;

  authDiv.style.display = 'none';
  appDiv.style.display  = 'block';

  // 1) Fetch initial feed
  const feedRes = await fetch(`${postUrl}/posts/feed`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const feed = await feedRes.json();
  postsResult.textContent = JSON.stringify(feed, null, 2);

  // 2) Fetch initial notifications
  const notRes = await fetch(`${notifUrl}/notifications/${user.userId}`);
  const nots  = await notRes.json();
  notificationsResult.textContent = JSON.stringify(
    nots.map(n => n.payload.message), null, 2
  );

  // 3) Subscribe to new posts
  const postStream = new EventSource(`${postUrl}/posts/stream`);
  postStream.onmessage = e => {
    const arr = JSON.parse(postsResult.textContent || '[]');
    const p   = JSON.parse(e.data);
    postsResult.textContent = JSON.stringify(
      [{ content: p.content, authorName: p.authorName, createdAt: p.createdAt }, ...arr],
      null, 2
    );
  };

  // 4) Subscribe to notifications
  const notifStream = new EventSource(
    `${notifUrl}/notifications/stream/${user.userId}`
  );
  notifStream.onmessage = e => {
    const arr = JSON.parse(notificationsResult.textContent || '[]');
    const n   = JSON.parse(e.data);
    notificationsResult.textContent = JSON.stringify(
      [n.payload.message, ...arr],
      null, 2
    );
  };

  alert('✅ Logged in, feed & notifications loaded, streaming active!');
}

async function createPost() {
  await fetch(`${postUrl}/posts`, {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization':`Bearer ${accessToken}`
    },
    body: JSON.stringify({ content: postInput.value, mediaUrls: [] })
  });
}
