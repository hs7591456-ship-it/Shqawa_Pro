/* إعداد خلفية شقاوة برو — غيّر القيم فقط حسب الملف الذي ترفعه داخل assets */
window.SHQAWA_BACKGROUND = {
  // اكتب "image" للصورة أو "video" للفيديو أو "none" بدون خلفية إضافية
  type: "none",
  // للصورة: ارفع ملفك إلى assets وغيّر الاسم هنا، مثال: /assets/background.jpg
  image: "/assets/background.jpg",
  // للفيديو: ارفع ملف MP4 إلى assets وغيّر الاسم هنا، مثال: /assets/background.mp4
  video: "/assets/background.mp4",
  // شفافية الخلفية من 0.05 إلى 1 (كلما قل الرقم ظهرت الخلفية الأصلية أكثر)
  opacity: 0.28,
  // تغطية الخلفية: cover تملأ الشاشة وتحافظ على التناسب
  fit: "cover"
};
