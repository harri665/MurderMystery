// Notification Manager for Web Push Notifications
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

// Convert base64 string to Uint8Array for VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const NotificationManager = {
  // Check if browser supports notifications
  isSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  },

  // Get current notification permission
  getPermission() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  },

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported in this browser');
    }

    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  },

  // Register service worker
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers are not supported');
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  },

  // Subscribe to push notifications
  async subscribe(playerId, playerName) {
    try {
      if (!this.isSupported()) {
        throw new Error('Push notifications are not supported');
      }

      // Request permission if not already granted
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Register service worker
      const registration = await this.registerServiceWorker();

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Get VAPID public key from server
      const vapidResponse = await fetch(`${API_BASE}/api/vapid-public-key`);
      const { publicKey } = await vapidResponse.json();

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      console.log('Push subscription created:', subscription);

      // Send subscription to server
      const response = await fetch(`${API_BASE}/api/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          playerId,
          playerName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription to server');
      }

      console.log('✅ Push subscription saved to server');
      
      // Store subscription status in localStorage
      localStorage.setItem('pushSubscriptionStatus', 'subscribed');
      localStorage.setItem('pushSubscriptionPlayerId', playerId);

      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  },

  // Unsubscribe from push notifications
  async unsubscribe(playerId) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        console.log('Push subscription removed from browser');
      }

      // Remove subscription from server
      await fetch(`${API_BASE}/api/push/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ playerId })
      });

      console.log('✅ Push subscription removed from server');
      
      // Clear localStorage
      localStorage.removeItem('pushSubscriptionStatus');
      localStorage.removeItem('pushSubscriptionPlayerId');

      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  },

  // Check if user is currently subscribed
  async isSubscribed() {
    try {
      if (!this.isSupported()) return false;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      return subscription !== null;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  },

  // Get current subscription
  async getSubscription() {
    try {
      if (!this.isSupported()) return null;

      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  },

  // Test notification (requires permission)
  async testNotification() {
    if (!this.isSupported()) {
      alert('Notifications are not supported in this browser');
      return;
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      alert('Notification permission denied');
      return;
    }

    new Notification('Test Notification', {
      body: 'This is a test notification from Murder Mystery!',
      icon: '/images/seal.png',
      badge: '/images/seal.png',
      tag: 'test-notification'
    });
  }
};

export default NotificationManager;
