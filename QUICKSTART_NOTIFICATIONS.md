# Quick Start Guide: Web Push Notifications

## 🚀 Getting Started in 5 Minutes

### Step 1: Start Your Server
```bash
npm start
```
This will start both the frontend (port 5173) and backend (port 3001).

### Step 2: Sign In as a Player
1. Open browser: `http://localhost:5173`
2. Sign in with your name (e.g., "harrison")
3. **Allow notifications** when prompted 🔔
4. You're now subscribed!

### Step 3: Test as GM
1. Open another browser tab/window
2. Navigate to: `http://localhost:5173/gm`
3. Scroll to "📢 Send Push Notifications" section
4. Fill in:
   - **Title**: "Test Notification"
   - **Body**: "This is working!"
   - **Target**: Leave empty (sends to all)
5. Click "📢 Send Notification"

### Step 4: Verify It Works
- ✅ Notification should appear immediately
- ✅ Works even if you close the player tab
- ✅ Click notification to reopen the app

## 📱 Quick Test from Terminal

```bash
# Send a test notification via curl
curl -X POST http://localhost:3001/api/gm/notify \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Murder Mystery Alert",
    "body": "A new clue has been discovered!",
    "url": "/"
  }'
```

## 🎯 Key Routes

| Route | Description |
|-------|-------------|
| `/gm` | Admin dashboard - Send notifications here |
| `/notifications` | Player notification settings |
| `/` | Home - Sign in here |

## ✅ Verification Checklist

- [ ] Server running (`npm start`)
- [ ] Signed in as player
- [ ] Notification permission granted
- [ ] Push subscription saved
- [ ] GM can send notifications
- [ ] Notifications received successfully

## 🔍 Troubleshooting

### No notification prompt?
- Check browser supports push (Chrome, Firefox, Safari 16+)
- Check you haven't previously blocked notifications
- Try incognito/private mode

### Can't send notifications?
- Ensure at least one player is subscribed
- Check server logs for errors
- Verify `/api/gm/notify` endpoint is accessible

### Check subscription status:
```bash
# View current subscriptions
cat server/data/push_subscriptions.json
```

## 🎓 Learn More

- Full Documentation: `NOTIFICATIONS.md`
- Architecture Details: `NOTIFICATION_ARCHITECTURE.md`
- Implementation Summary: `NOTIFICATION_IMPLEMENTATION.md`

## 🎉 You're All Set!

The notification system is ready to enhance your Murder Mystery game experience. Players will now receive important updates even when they're not actively playing!

---

**Pro Tip**: Test with multiple browsers/devices to see notifications in action across different players!
