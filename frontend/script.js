// Minikube IP & NodePorts
const minikubeIP = '192.168.49.2';
const userUrl    = `http://${minikubeIP}:30002`;
const postUrl    = `http://${minikubeIP}:30003`;
const notifUrl   = `http://${minikubeIP}:30004`;

// DOM refs
const emailInput        = document.getElementById('email');
const passwordInput     = document.getElementById('password');
const nameInput         = document.getElementById('name');
const bioInput          = document.getElementById('bio');
const avatarInput       = document.getElementById('avatarUrl');
const postInput         = document.getElementById('postContent');
const authDiv           = document.getElementById('auth');
const appDiv            = document.getElementById('app');
const userNameSpan      = document.getElementById('userName');
const postsList         = document.getElementById('postsList');
const notificationsList = document.getElementById('notificationsList');

let accessToken = '';
let user        = null;

function clearChildren(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function renderPost(post) {
  const li = document.createElement('li');
  const h4 = document.createElement('h4');
  h4.textContent = post.authorName;
  const p = document.createElement('p');
  p.textContent = post.content;
  const time = document.createElement('time');
  time.textContent = new Date(post.createdAt).toLocaleString();
  li.append(h4, p, time);
  postsList.prepend(li);
}

function renderNotification(n) {
  const li = document.createElement('li');
  li.textContent = n.payload.message;
  notificationsList.prepend(li);
}

async function register() {
  const res = await fetch(`${userUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  authDiv.classList.add('hidden');
  appDiv.classList.remove('hidden');

  // load feed
  const feed = await (await fetch(`${postUrl}/posts/feed`)).json();
  clearChildren(postsList);
  feed.forEach(renderPost);

  // load notifications
  const nots = await (await fetch(`${notifUrl}/notifications/${user.userId}`)).json();
  clearChildren(notificationsList);
  nots.forEach(renderNotification);

  // SSE posts
  const postStream = new EventSource(`${postUrl}/posts/stream`);
  postStream.onmessage = e => renderPost(JSON.parse(e.data));

  // SSE notifications
  const notifStream = new EventSource(
    `${notifUrl}/notifications/stream/${user.userId}`
  );
  notifStream.onmessage = e => renderNotification(JSON.parse(e.data));
}

async function createPost() {
  const res = await fetch(`${postUrl}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ content: postInput.value, mediaUrls: [] })
  });
  if (!res.ok) return alert('❌ ' + await res.text());
  const newPost = await res.json();
  renderPost(newPost);
  postInput.value = '';
}

function logout() {
  accessToken = '';
  user = null;
  authDiv.classList.remove('hidden');
  appDiv.classList.add('hidden');
  clearChildren(postsList);
  clearChildren(notificationsList);
}
