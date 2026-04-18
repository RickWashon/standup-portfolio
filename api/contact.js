import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// 拦截配置字典（您可以随时在这里添加或修改）
const FILTER_CONFIG = {
  // 白名单：无条件放行的邮箱或域名后缀
  whitelist: ['boss@company.com', '@myfriend.com'],
  
  // 黑名单：直接拒绝的邮箱或域名后缀
  blacklist: ['spammer@bad.com', '@junkmail.xyz'],
  
  // 敏感词/广告词拦截：内容或名字包含这些词汇直接丢弃
  spamKeywords: [
    'SEO优化', '刷单', '加微信', '代发', '赌场', '加群', 'http://', 'https://', 'porn', 'xxx'
  ],
  
  // 最小有效留言长度
  minMessageLength: 5 
};

// 检查是否为垃圾信息的分析函数
function isSpam(name, email, message) {
  const emailLower = email.toLowerCase();
  const textToCheck = (name + ' ' + message).toLowerCase();

  // 1. 白名单放行
  for (const w of FILTER_CONFIG.whitelist) {
    if (emailLower.includes(w.toLowerCase())) return false;
  }

  // 2. 黑名单拦截
  for (const b of FILTER_CONFIG.blacklist) {
    if (emailLower.includes(b.toLowerCase())) return true;
  }

  // 3. 关键词拦截
  for (const keyword of FILTER_CONFIG.spamKeywords) {
    if (textToCheck.includes(keyword.toLowerCase())) return true;
  }

  // 4. 长度太短拦截
  if (message.trim().length < FILTER_CONFIG.minMessageLength) return true;

  return false;
}

export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: '请填写完整的信息' });
    }

    // 垃圾信息检测
    if (isSpam(name, email, message)) {
      // 静默丢弃：控制台打印日志以便在 Vercel 后台查阅，但对前端依然返回成功
      console.log(`[SPAM BLOCKED] Name: ${name}, Email: ${email}, Message: ${message}`);
      // 返回 success: true，不执行后续发邮件逻辑
      return res.status(200).json({ success: true, fake: true });
    }

    // 发送邮件的正常逻辑
    const { data, error } = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>', 
      // Vercel 环境变量中配置您自己的接收邮箱
      to: [process.env.MY_EMAIL || 'your_email@example.com'], 
      subject: `🎤 新的脱口秀商演邀约/留言 - ${name}`,
      html: `
        <h2>您收到了来自个人主页的新留言：</h2>
        <p><strong>称呼：</strong> ${name}</p>
        <p><strong>联系邮箱：</strong> ${email}</p>
        <p><strong>演出详情与需求：</strong></p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px;">
          <p>${message}</p>
        </div>
      `,
    });

    if (error) {
      return res.status(400).json({ error });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
