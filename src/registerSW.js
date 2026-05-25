export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      console.log("✅ Service Worker registered:", reg.scope);
      return reg;
    } catch (err) {
      console.error("❌ Service Worker registration failed:", err);
    }
  }
};

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("Notifications not supported");
    return false;
  }
  const permission = await Notification.requestPermission();
  console.log("Notification permission:", permission);
  return permission === "granted";
};