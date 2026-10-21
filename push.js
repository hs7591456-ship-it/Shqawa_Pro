/* OneSignal Web Push: initialize and show the configured slide prompt on the first site visit. */
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

      // Keep an explicit button available on pages that contain one.
      document.querySelectorAll('[data-enable-push]').forEach(btn => {
        btn.hidden = false;
        btn.addEventListener('click', async () => {
          btn.disabled = true;
          try {
            await OneSignal.Slidedown.promptPush();
            btn.textContent = 'تم فتح طلب تفعيل الإشعارات';
          } catch (e) {
            console.error('OneSignal prompt error:', e);
            btn.textContent = 'افتح إعدادات المتصفح للسماح بالإشعارات';
          } finally { btn.disabled = false; }
        });
      });

      // Show OneSignal's configured slide-down subscription prompt after the visitor
      // has had a moment to see the site. The visitor still chooses whether to subscribe.
      const permission = (typeof OneSignal.Notifications?.permission === 'boolean')
        ? OneSignal.Notifications.permission : false;
      const optedIn = OneSignal.User?.PushSubscription?. optedIn;
      if (!permission && optedIn !== true && !sessionStorage.getItem('shqawaPushPromptShown')) {
        sessionStorage.setItem('shqawaPushPromptShown', '1');
        window.setTimeout(async () => {
          try {
            await OneSignal.Slidedown.promptPush();
          } catch (e) {
            console.warn('OneSignal prompt did not display:', e);
          }
        }, 3500);
      }
    } catch (e) {
      console.error('OneSignal init error:', e);
    }
  });
})();
