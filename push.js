/* إعداد آمن مبدئي لـ OneSignal Web Push. لا يرسل إشعارات بنفسه؛ الإرسال يحتاج جهة خلفية آمنة. */
(() => {
  const cfg = window.SHQAWA_PUSH_CONFIG || {};
  const appId = cfg.oneSignalAppId;
  if (!appId || appId === 'PUT_ONESIGNAL_APP_ID_HERE') return;
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async function (OneSignal) {
    try {
      await OneSignal.init({
        appId,
        serviceWorkerPath: '/OneSignalSDKWorker.js',
        serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
        notifyButton: { enable: false }
      });
      document.querySelectorAll('[data-enable-push]').forEach(btn => {
        btn.hidden = false;
        btn.addEventListener('click', async () => {
          btn.disabled = true;
          try {
            await OneSignal.Notifications.requestPermission();
            if (OneSignal.User?.PushSubscription?.optIn) await OneSignal.User.PushSubscription.optIn();
            btn.textContent = 'تم طلب تفعيل الإشعارات';
          } catch (e) {
            console.error('OneSignal permission error:', e);
            btn.textContent = 'تعذر التفعيل، حاول مرة أخرى';
          } finally { btn.disabled = false; }
        });
      });
    } catch (e) { console.error('OneSignal init error:', e); }
  });
})();
