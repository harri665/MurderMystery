# 🎯 Kill Notification - Quick Reference

## URL Format
```
/kill?victim=firstname
```

## Examples
```bash
# Development (Frontend)
http://localhost:5173/kill?victim=zarin
http://localhost:5173/kill?victim=harrison

# Production (Frontend)
https://murdermystery.harrison-martin.com/kill?victim=maya
https://murdermystery.harrison-martin.com/kill?victim=isla
```

## What Happens
1. ✅ Frontend page loads and reads victim query parameter
2. ✅ Calls backend API to execute kill
3. ✅ Player is marked as "down" for 5 minutes
4. ✅ Push notification sent to victim's device
5. ✅ Real-time Socket.io event emitted
6. ✅ Shows success/error screen to killer

## Notification Preview
```
🔔 Murder Mystery
💀 You've Been Eliminated!
You've been killed! You're down for 5 minutes.
Head to the medbay: Park with 4 orange benches
```

## Testing
```bash
# Method 1: Browser (Recommended)
open http://localhost:5173/kill?victim=zarin

# Method 2: Test Tool
open kill-test.html
```

## QR Code Generation
1. Go to https://www.qr-code-generator.com/
2. Enter: `http://localhost:5173/kill?victim=zarin`
3. Download and print QR code
4. Attach to player badge

## Key Features
- 📱 Works when browser is closed
- 🔤 Case-insensitive first names
- ⏱️ Prevents duplicate kills
- 🏥 Includes medbay location
- 🔔 Instant push notifications
- ⚡ Real-time updates

## Files
- **Test Tool:** `kill-test.html`
- **Documentation:** `KILL_NOTIFICATIONS.md`
- **Implementation:** `KILL_NOTIFICATION_IMPLEMENTATION.md`

## Common Responses
```json
// Success
{"ok": true, "message": "Zarin Niles has been eliminated!", "notificationSent": true}

// Not Found
{"error": "Player with first name \"zarin\" not found"}

// Already Down
{"error": "Zarin Niles is already down for 3 more minute(s)"}
```

## Integration
Works with:
- ✅ QR code scanning
- ✅ NFC tag tapping
- ✅ Direct URL access
- ✅ Existing `/api/kill` endpoint

---

**🚀 Start Testing:**
1. Sign in: `http://localhost:5173/zarin`
2. Kill: `http://localhost:5173/kill?victim=zarin`
3. Check notification on device! 🔔
