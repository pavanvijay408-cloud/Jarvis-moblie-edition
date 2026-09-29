// ===== 1. GLOBAL VARIABLES =====
const chat = document.getElementById('chat');
const input = document.getElementById('input');
const micBtn = document.getElementById('mic-btn');
let API_KEY = localStorage.getItem('GEMINI_API_KEY');

// మీ Episode 2/3 లో వాడిన Models ఇవే. అవసరమైతే మార్చుకోండి.
const MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-pro"
];

// ===== 2. API KEY PROMPT (First Time Setup) =====
if (!API_KEY) {
  API_KEY = prompt("Enter your Gemini API Key:");
  if (API_KEY) {
    localStorage.setItem('GEMINI_API_KEY', API_KEY);
  } else {
    alert("API Key is required to run J.A.R.V.I.S!");
  }
}

// ===== 3. GEMINI API CALL (Corrected Code) =====
async function callGemini(p) {
  let lastErr;
  for (const m of MODELS) {
    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/" + m + ":generateContent?key=" + API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: p }] }] })
        }
      );

      const data = await res.json();

      if (data.error) {
        lastErr = new Error(data.error.message);
        // PDF లో ఇక్కడ typo ఉంది. దాన్ని సరిచేశాను ( /deprecated/i.test )
        if (/high demand|temporar|quota|rate|unavailable|no longer available|deprecated/i.test(data.error.message)) {
          continue;
        }
        throw lastErr;
      }

      return data.candidates[0].content.parts[0].text;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

async function askGemini(p) {
  add('J.A.R.V.I.S: Thinking...', 'ai');
  try {
    const reply = await callGemini(p);
    chat.lastChild.innerText = 'J.A.R.V.I.S: ' + reply;
    speak(reply); // reply ని వెంటనే VOICE లో చెప్పు
  } catch (e) {
    chat.lastChild.innerText = 'J.A.R.V.I.S: ERROR - ' + e.message;
  }
}

// ===== 4. SPEECH RECOGNITION (వినడం) =====
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SR) {
  const rec = new SR();
  rec.lang = 'en-US'; // Telugu కోసం 'te-IN' గా మార్చండి

  rec.onresult = (e) => {
    const t = e.results[0][0].transcript;
    add('YOU: ' + t, 'user');
    askGemini(t);
  };

  micBtn.onclick = () => {
    try {
      rec.start();
      micBtn.innerText = 'LISTENING...';
    } catch (e) {
      console.log("Mic already listening...");
    }
  };

  rec.onend = () => {
    micBtn.innerText = '🎤';
  };
} else {
  micBtn.onclick = () => alert("Speech Recognition is not supported in this browser. Please use Chrome.");
}

// ===== 5. TEXT-TO-SPEECH (మాట్లాడటం) =====
let voices = [];

function loadVoices() {
  voices = speechSynthesis.getVoices();
}

loadVoices();
speechSynthesis.onvoiceschanged = loadVoices;

function speak(t) {
  const u = new SpeechSynthesisUtterance(t);
  u.rate = 1.05;
  u.pitch = 0.85;

  const v = voices.find(v => v.lang.startsWith('en'));
  if (v) u.voice = v;

  speechSynthesis.speak(u);
}

// ===== 6. TEXT SEND BUTTON =====
document.getElementById('send').onclick = () => {
  const t = input.value.trim();
  if (!t) return;

  add('YOU: ' + t, 'user');
  input.value = "";
  askGemini(t);
};

// ===== 7. ADD MESSAGE TO CHAT =====
function add(t, w) {
  const d = document.createElement('div');
  d.className = 'msg ' + w;
  d.innerHTML = t;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}
