hereconst SYSTEM_PROMPT = `أنت مساعد موقع SHQAWA PRO (شقاوة برو)، تتحدث بالعربية المصرية بشكل ودود وواضح. الموقع يقدم خدمات برمجة المواقع، تطوير التطبيقات، التصميمات، والمشاريع البرمجية. ساعد الزائر على فهم الخدمات وتوضيح احتياجات مشروعه. لا تخترع أسعارًا أو مواعيد أو ضمانات غير موجودة؛ إذا سأل عن سعر أو تفاصيل غير معروفة، وجّهه للتواصل عبر واتساب على الرقم 01020427153. اجعل الإجابات مختصرة ومفيدة.`;

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'الطريقة غير مدعومة.' });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'مفتاح الذكاء الاصطناعي غير مضبوط بعد. أضف GEMINI_API_KEY في إعدادات Vercel.' });
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message) return res.status(400).json({ error: 'اكتب رسالتك الأول.' });
  if (message.length > 2000) return res.status(413).json({ error: 'الرسالة طويلة جدًا؛ اختصرها إلى 2000 حرف.' });

  try {
    const upstream = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: message }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 700 }
      })
    });
    const result = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error('Gemini API error:', upstream.status, result?.error?.message || 'Unknown error');
      if (upstream.status === 429) return res.status(429).json({ error: 'وصلنا لحد الاستخدام الحالي للخدمة المجانية. جرّب بعد شوية.' });
      if (upstream.status === 400 || upstream.status === 403) return res.status(502).json({ error: 'تعذر استخدام مفتاح Gemini أو النموذج. راجع المفتاح وحالة الخدمة في Google AI Studio.' });
      return res.status(502).json({ error: 'خدمة الذكاء الاصطناعي غير متاحة حاليًا. جرّب لاحقًا.' });
    }
    const reply = result?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('').trim();
    if (!reply) return res.status(502).json({ error: 'المساعد لم يرجع ردًا نصيًا. جرّب صياغة السؤال بطريقة أخرى.' });
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat API request failed:', error?.message || error);
    return res.status(500).json({ error: 'حصل خطأ أثناء الاتصال بالمساعد.' });
  }
};
