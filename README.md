# TeleDrive - Telegram-Based File Manager

A complete web-based File Manager (Google Drive–like) using Telegram as free cloud storage. Upload, manage, preview, and share files directly through your browser, with Telegram acting as the storage backend.

## 🌟 Features

✅ **File Upload & Management**
- Drag-and-drop file upload
- Multiple file upload support
- Real-time upload progress tracking
- File preview (images, videos, documents)

✅ **Storage via Telegram**
- 100% free cloud storage (up to 2GB per file)
- Files stored in a private Telegram channel
- Secure file references using Telegram file_id
- No third-party paid services required

✅ **File Organization**
- Grid and list view modes
- Filter by file type (images, documents, videos)
- Search functionality
- File categories auto-detection

✅ **File Operations**
- Download files
- Delete files
- Rename files
- Share files (copy link)
- Right-click context menu

✅ **User Interface**
- Clean, modern design (no frameworks - pure CSS)
- Responsive mobile-friendly layout
- Real-time storage statistics
- Toast notifications
- Dark/Light theme ready

## 🛠 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Telegram Bot API
- **Storage**: Telegram Channel (free)
- **No Dependencies**: Pure vanilla - zero npm packages required

## 📋 Prerequisites

Before starting, you'll need:

1. **Telegram Account** - [Create one here](https://telegram.org)
2. **Telegram Bot** - Get one from [@BotFather](https://t.me/BotFather)
3. **Telegram Channel** - Create a private channel for storage
4. **Bot Token** - From @BotFather
5. **Channel ID** - Your private channel's ID

## 🚀 Setup Instructions

### Step 1: Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/start` and then `/newbot`
3. Follow the instructions to create your bot
4. Copy the **Bot Token** (looks like: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

### Step 2: Create a Private Telegram Channel

1. Open Telegram and create a new channel
2. Make it **private**
3. Set channel title to "TeleDrive Storage" or similar
4. Add your bot as an admin to the channel

### Step 3: Get Your Channel ID

1. Forward any message from your channel to [@userinfobot](https://t.me/userinfobot)
2. Look for the channel ID in the response (format: `-1001234567890`)

### Step 4: Configure TeleDrive

1. Open `index.html` in your web browser
2. Click the **⚙️ Settings** button (top-right)
3. Enter:
   - **Telegram Bot Token**: Your bot token from @BotFather
   - **Channel ID**: Your private channel's ID
   - **API Server URL**: Leave empty (uses direct Telegram API)
4. Click **"Test Connection"** to verify everything works
5. Click **"Save Settings"**

### Step 5: Start Using TeleDrive

1. Click the upload area or drag files to upload
2. Files are instantly stored in your Telegram channel
3. Manage files from the interface
4. Download, preview, or delete files anytime

## 📁 Project Structure

```
Filemanager-Telegram/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling (no frameworks)
├── app.js              # Core application logic
├── server.js           # Optional Node.js backend
├── README.md           # This file
└── package.json        # Node.js dependencies (optional)
```

## 🎯 Usage Guide

### Uploading Files
- **Click** the upload area or drag files directly
- **Supported formats**: Any file up to 2GB
- Progress bar shows upload status
- Files appear instantly in the file list

### Managing Files
- **Preview**: Click any file to see preview
- **Download**: Click download button in preview modal
- **Delete**: Click delete button to remove file
- **Rename**: Right-click and select "Rename"
- **Share**: Right-click and select "Share Link"

### Filtering & Search
- Use **sidebar** to filter by file type
- Use **search bar** to find specific files
- Switch between **grid** and **list** views

### Settings
- Click **⚙️** icon to open settings
- Update bot token or channel ID anytime
- Test connection before saving

## 🔒 Security & Privacy

✅ **End-to-End Safe**
- Files stored in YOUR private Telegram channel
- Only you have access
- No data stored on external servers
- Bot token stored locally (never sent to third parties)

✅ **Privacy Features**
- Settings stored in browser localStorage
- No tracking or analytics
- Open source - review the code
- Works completely offline (except uploads)

## 📊 Storage Limits

- **Per File**: Up to 2GB (Telegram limit)
- **Total Storage**: Unlimited (via Telegram channels)
- **Free**: 100% free - Telegram doesn't charge

## 🐛 Troubleshooting

### "Connection Failed" Error
- Verify bot token is correct
- Ensure bot is admin in your private channel
- Check channel ID format (should start with `-100`)
- Make channel absolutely private

### Files Not Uploading
- Check internet connection
- Verify bot token and channel ID
- Ensure file size is under 2GB
- Check browser console for errors

### Preview Not Working
- Supported formats: JPG, PNG, GIF, MP4, etc.
- Large files may take time to load
- Check Telegram channel - message should be there

### Share Link Not Working
- Copy the generated link manually
- Share link includes browser localStorage data
- Recipient needs app configured to access files

## 📈 Advanced Setup (Optional)

### Using a Proxy Server

For better reliability, you can set up a Node.js proxy server:

1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Update `server.js` with your bot token

3. Run the server:
   ```bash
   node server.js
   ```

4. In TeleDrive settings, set API Server URL to your server URL

5. The proxy server handles all Telegram API calls

## 🔄 File Sync Across Devices

Since files are stored in Telegram:
1. Same credentials (bot token + channel ID) on any device
2. All files automatically accessible
3. Perfect for cloud backup and sync

## ⚠️ Limitations

- Maximum file size: 2GB (Telegram limit)
- File history: Limited to what's in channel
- Offline mode: Download files to access offline
- Real-time sync: Check for new files manually

## 📱 Mobile Support

TeleDrive works on mobile browsers:
- iPhone Safari
- Android Chrome/Firefox
- Responsive design
- Touch-friendly interface

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest features
- Improve code
- Optimize performance

## 📝 License

Open Source - Free to use and modify

## 🙏 Support

Having issues? Check:
1. Browser console (F12) for errors
2. Telegram channel has messages
3. Bot is admin in channel
4. Token and channel ID are correct

## 🚀 Future Features

- Folder organization
- File tagging and labels
- Batch operations
- Advanced filtering
- Dark mode
- File versioning
- Collaborative sharing
- File encryption

## 📚 API Documentation

### Telegram Bot API Methods Used

- `sendDocument` - Upload file to channel
- `getFile` - Get file info and download link
- `deleteMessage` - Delete file message
- `getMe` - Verify bot connection
- `getChat` - Verify channel access

### Local Storage

- `teledriveFiles` - Stores file metadata
- `botToken` - Telegram bot token
- `channelId` - Telegram channel ID
- `apiUrl` - Custom API server URL (optional)

## 🎓 Learning Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Telegram Bot Development Guide](https://core.telegram.org/bots)
- [@BotFather Guide](https://core.telegram.org/bots#botfather)

## ⭐ Star This Project!

If you find TeleDrive useful, please star this repository on GitHub!

---

**Made with ❤️ for cloud storage lovers everywhere**

Last Updated: February 2, 2026
