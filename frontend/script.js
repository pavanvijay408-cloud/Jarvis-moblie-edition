const chat = document.getElementById('chat');
const input = document.getElementById('msg');
const sendBtn = document.getElementById('send');

sendBtn.onclick = sendMessage;

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  add('YOU: ' + text, 'user');
  input.value = '';

  add('J.A.R.V.I.S: Processing...', 'ai');

  setTimeout(() => {
    const reply = getReply(text.toLowerCase());
    chat.lastChild.innerHTML = 'J.A.R.V.I.S: ' + reply;
    chat.scrollTop = chat.scrollHeight;
  }, 800);
}

function getReply(msg) {
  if (msg.includes('hello') || msg.includes('hi')) {
    return 'Hello Boss. Systems are online.';
  }
  if (msg.includes('status')) {
    return 'AI Core online. Network online. Voice and Memory are locked for now.';
  }
  if (msg.includes('name')) {
    return 'I am J.A.R.V.I.S, your mobile edition assistant.';
  }
  if (msg.includes('time')) {
    return 'Current time is ' + new Date().toLocaleTimeString();
  }
  return 'Systems online. How may I assist you, Boss?';
}

function add(text, who) {
  const div = document.createElement('div');
  div.className = 'msg ' + who;
  div.innerHTML = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}
