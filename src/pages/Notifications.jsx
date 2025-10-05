import { useState, useEffect } from 'react';
import NotificationManager from '../utils/notificationManager';

export default function Notifications() {
  const [notificationStatus, setNotificationStatus] = useState({
    supported: false,
    permission: 'default',
    subscribed: false
  });
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const checkNotificationStatus = async () => {
      const storedPlayer = localStorage.getItem('player');
      if (storedPlayer) {
        setPlayer(JSON.parse(storedPlayer));
      }

      const supported = NotificationManager.isSupported();
      const permission = NotificationManager.getPermission();
      const subscribed = await NotificationManager.isSubscribed();

      setNotificationStatus({
        supported,
        permission,
        subscribed
      });

      setLoading(false);
    };

    checkNotificationStatus();
  }, []);

  const handleSubscribe = async () => {
    if (!player) {
      alert('Player data not found. Please sign in again.');
      return;
    }

    try {
      setLoading(true);
      await NotificationManager.subscribe(player.id, player.name);
      
      const permission = NotificationManager.getPermission();
      const subscribed = await NotificationManager.isSubscribed();
      
      setNotificationStatus(prev => ({
        ...prev,
        permission,
        subscribed
      }));

      alert('✅ Successfully subscribed to notifications!');
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Failed to subscribe to notifications: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!player) {
      alert('Player data not found. Please sign in again.');
      return;
    }

    try {
      setLoading(true);
      await NotificationManager.unsubscribe(player.id);
      
      const subscribed = await NotificationManager.isSubscribed();
      
      setNotificationStatus(prev => ({
        ...prev,
        subscribed
      }));

      alert('🔕 Successfully unsubscribed from notifications.');
    } catch (error) {
      console.error('Error unsubscribing:', error);
      alert('Failed to unsubscribe: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await NotificationManager.testNotification();
    } catch (error) {
      console.error('Error testing notification:', error);
      alert('Failed to send test notification: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="card">
          <div className="animate-pulse">
            <div className="h-6 bg-neutral-700 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-neutral-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-neutral-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="card">
        <h2 className="text-xl font-bold mb-4">🔔 Push Notifications</h2>
        
        {!notificationStatus.supported ? (
          <div className="bg-red-900/20 border border-red-600 text-red-400 p-4 rounded">
            <p className="font-semibold mb-2">❌ Not Supported</p>
            <p className="text-sm">
              Push notifications are not supported in this browser. Please use a modern browser like Chrome, Firefox, or Edge.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between p-3 bg-neutral-800 rounded">
                <span className="text-sm font-medium">Browser Support</span>
                <span className="text-green-400">✅ Supported</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-neutral-800 rounded">
                <span className="text-sm font-medium">Permission Status</span>
                <span className={`font-semibold ${
                  notificationStatus.permission === 'granted' ? 'text-green-400' :
                  notificationStatus.permission === 'denied' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {notificationStatus.permission === 'granted' ? '✅ Granted' :
                   notificationStatus.permission === 'denied' ? '❌ Denied' :
                   '⚠️ Not Set'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-neutral-800 rounded">
                <span className="text-sm font-medium">Subscription Status</span>
                <span className={`font-semibold ${notificationStatus.subscribed ? 'text-green-400' : 'text-neutral-400'}`}>
                  {notificationStatus.subscribed ? '✅ Subscribed' : '🔕 Not Subscribed'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-neutral-300 p-3 bg-blue-900/20 border border-blue-600 rounded">
                <p className="font-semibold mb-1">ℹ️ About Push Notifications</p>
                <p>
                  Enable push notifications to receive important game updates even when the app is closed. 
                  You'll be notified about clues, events, and game state changes.
                </p>
              </div>

              {notificationStatus.permission === 'denied' && (
                <div className="text-sm text-red-300 p-3 bg-red-900/20 border border-red-600 rounded">
                  <p className="font-semibold mb-1">⚠️ Permission Denied</p>
                  <p>
                    You've blocked notifications for this site. To enable them, you need to:
                  </p>
                  <ol className="list-decimal ml-5 mt-2 space-y-1">
                    <li>Click the lock icon in your browser's address bar</li>
                    <li>Find "Notifications" in the permissions list</li>
                    <li>Change it from "Block" to "Allow"</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
              )}

              <div className="grid gap-2">
                {!notificationStatus.subscribed ? (
                  <button
                    onClick={handleSubscribe}
                    disabled={loading || notificationStatus.permission === 'denied'}
                    className="btn btn-primary w-full"
                  >
                    🔔 Enable Notifications
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleTestNotification}
                      disabled={loading}
                      className="btn btn-secondary w-full"
                    >
                      🧪 Send Test Notification
                    </button>
                    <button
                      onClick={handleUnsubscribe}
                      disabled={loading}
                      className="btn w-full bg-red-600 hover:bg-red-700"
                    >
                      🔕 Disable Notifications
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {player && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Player Info</h3>
          <div className="text-sm space-y-1">
            <p><span className="text-neutral-400">Name:</span> {player.name}</p>
            <p><span className="text-neutral-400">ID:</span> {player.id}</p>
          </div>
        </div>
      )}
    </div>
  );
}
