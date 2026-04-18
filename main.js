import './style.css'

const jokes = [
  { setup: "我最近去了一家极简主义的咖啡店...", punchline: "他们的WiFi密码是空的，如果你问他们，他们会说：用心去感受连接。" },
  { setup: "现在的人真的太依赖手机了。", punchline: "昨天我手机没电了，我甚至不知道该怎么冲一杯咖啡，因为说明书在微信收藏里。" },
  { setup: "相亲最大的问题是什么？", punchline: "就是你像是在参加一场面试，而HR不仅要看你的简历，还要看你妈的简历。" },
  { setup: "我觉得人工智能不会取代人类。", punchline: "因为它永远学不会在群里发个表情包来掩饰尴尬。" },
  { setup: "健身房的跑步机真的是个神奇的地方。", punchline: "你跑了半个小时，除了满身大汗和怀疑人生，你哪儿也没去。" },
  { setup: "我朋友说他找到了人生的意义...", punchline: "我凑过去一看，原来是他找到了B站大会员的共享账号。" }
];

const container = document.getElementById('jokes-container');

jokes.forEach((joke) => {
  const card = document.createElement('div');
  card.className = 'joke-card';
  card.innerHTML = `
    <div class="joke-setup">${joke.setup}</div>
    <div class="joke-punchline">${joke.punchline}</div>
    <div class="click-hint">点击抖包袱</div>
  `;
  
  card.addEventListener('click', () => {
    card.classList.toggle('revealed');
    const hint = card.querySelector('.click-hint');
    if(card.classList.contains('revealed')){
       hint.style.display = 'none';
    } else {
       hint.style.display = 'inline-block';
    }
  });

  container.appendChild(card);
});

// Handle form submission
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button');
  const originalText = btn.innerText;
  
  // Get form data
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  btn.innerText = '发送中...';
  btn.style.opacity = '0.7';
  btn.disabled = true;

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('网络请求失败');
    }

    btn.innerText = '发送成功！期待与您合作。';
    btn.style.background = '#4BB543'; // Success green
    btn.style.color = '#fff';
    form.reset();
  } catch (error) {
    console.error('Error:', error);
    btn.innerText = '发送失败，请稍后重试';
    btn.style.background = '#ff3333';
    btn.style.color = '#fff';
  } finally {
    btn.style.opacity = '1';
    setTimeout(() => {
      btn.innerText = originalText;
      btn.style.background = '';
      btn.style.color = '';
      btn.disabled = false;
    }, 4000);
  }
});
