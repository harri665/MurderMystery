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
console.log('');
console.log('🎮 Murder Mystery Push Notification System');
console.log('==========================================');
console.log('');
console.log('✨ Features:');
console.log('  • Push notifications work even when browser is closed');
console.log('  • Automatic subscription on player sign-in');
console.log('  • GMs can send to all players or specific players');
console.log('  • Subscriptions persist across sessions');
console.log('');
console.log('📋 How to Use:');
console.log('  1. Players: Sign in to automatically enable notifications');
console.log('  2. GMs: Go to /gm and use the notification panel');
console.log('  3. Players: Visit /notifications to manage preferences');
console.log('');
console.log('🔗 API Endpoints:');
console.log('  • POST /api/gm/notify - Send notifications (GM)');
console.log('  • POST /api/push/subscribe - Subscribe to notifications');
console.log('  • POST /api/push/unsubscribe - Unsubscribe from notifications');
console.log('  • GET /api/vapid-public-key - Get VAPID public key');
console.log('');
console.log('🚀 Notification system is ready!');
console.log('');
console.log('Example curl command to send notification:');
console.log('curl -X POST http://localhost:3001/api/gm/notify \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"title":"Test","body":"This is a test notification!"}\'');
