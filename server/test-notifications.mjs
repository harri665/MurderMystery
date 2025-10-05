// Test script for web push notifications
import webPush from 'web-push';

// Set VAPID keys (same as in server)
const VAPID_PUBLIC_KEY = 'BBdvZpojnEEPWl2T7hvJoFdmL13yA3CmjEmdzOre3ZKzClI_lrgmO2YmTHKrE1M7eR-jGvvBwBnEN1Gyqrel_ck';
const VAPID_PRIVATE_KEY = 'mjIAB-XhXmHGhovH7TYkhxxBq64qKQdb5BOBD7AIp_c';
const VAPID_EMAIL = 'mailto:admin@murdermystery.game';

webPush.setVapidDetails(
  VAPID_EMAIL,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

console.log('✅ Web push configured successfully');
console.log('📱 VAPID public key:', VAPID_PUBLIC_KEY);
console.log('🔑 Testing notification system...');

// Test payload
const testPayload = JSON.stringify({
  title: 'Murder Mystery Test',
  body: 'This is a test notification from the server!',
  icon: '/images/seal.png',
  badge: '/images/seal.png',
  data: {
    url: '/',
    timestamp: Date.now(),
    type: 'test'
  }
});

console.log('🧪 Test payload created:', testPayload);
console.log('🚀 Notification system is ready!');
