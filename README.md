# R-Cloud ☁️ 

A powerful Telegram-based cloud storage solution with multi-user support and unlimited storage capacity.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- 🔐 **Multi-User Authentication** - Secure login system with user-specific data isolation
- ☁️ **Unlimited Storage** - Uses Telegram as backend (2GB per file, unlimited files)
- 👥 **User Isolation** - Each user sees only their own files
- 🎨 **Modern UI** - Clean, responsive design with dark/light themes
- 📤 **Easy Upload** - Drag & drop or click to upload
- 🔍 **Search & Filter** - Quickly find your files
- 👁️ **File Preview** - Preview images and documents in-app
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- 🚀 **Fast & Secure** - Serverless architecture on Vercel

## 🚀 Live Demo

**Production**: [https://r-cloud.vercel.app](https://r-cloud.vercel.app)

### Demo Accounts
- Username: `raghav` / Password: `raghavg2004`
- Username: `user2` / Password: `password2`
- Username: `admin` / Password: `admin123`

## 📦 Installation

### Prerequisites
- Node.js 14+
- Telegram Bot Token ([Get from @BotFather](https://t.me/BotFather))
- Telegram Channel ID

### Local Setup

```bash
# Clone repository
git clone https://github.com/raghavg2004/R-Cloud.git
cd R-Cloud

# Install dependencies
npm install

# Start local server (optional)
npm start

# Or open index.html directly in browser
```

## 🌐 Deploy to Vercel

### Quick Deploy

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import `raghavg2004/R-Cloud`
   - Click "Deploy"

### Or use the deploy script:

**Windows**:
```bash
./deploy.bat
```

**Linux/Mac**:
```bash
chmod +x deploy.sh
./deploy.sh
```

📖 **Detailed deployment guide**: See [DEPLOY.md](DEPLOY.md)

## ⚙️ Configuration

### 1. Setup Telegram Bot

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Create a new bot: `/newbot`
3. Copy your bot token
4. Create a private channel
5. Add your bot as admin to the channel
6. Get channel ID (use [@userinfobot](https://t.me/userinfobot))

### 2. Configure in App

1. Open the app
2. Login with your credentials
3. Click Settings (⚙️)
4. Enter:
   - Bot Token
   - Channel ID
5. Click "Test Connection"
6. Save settings

### 3. Add Users

Edit `app.js` and add users to the `USERS` object:

```javascript
const USERS = {
    'username': { password: 'password123', email: 'user@example.com' },
    // Add more users...
};
```

## 🏗️ Project Structure

```
R-Cloud/
├── api/                    # Vercel serverless functions
│   ├── health.js          # Health check endpoint
│   ├── settings.js        # Settings API
│   ├── files.js           # Files metadata API
│   └── telegram.js        # Telegram API proxy
├── data/                   # User data (local only, not deployed)
│   ├── user1/
│   └── user2/
├── index.html             # Main app interface
├── app.js                 # Frontend logic
├── styles.css             # Styling
├── server.js              # Local development server
├── vercel.json            # Vercel configuration
├── package.json           # Dependencies
└── DEPLOY.md              # Deployment guide
```

## 🔧 How It Works

1. **Authentication**: Users login with username/password
2. **File Upload**: Files are uploaded to your Telegram channel
3. **Metadata Storage**: File information stored in browser localStorage
4. **User Isolation**: Each user's data is separated by username
5. **Retrieval**: Files fetched from Telegram when needed

## 💾 Storage Details

- **File Storage**: Telegram Channel (unlimited files, 2GB each)
- **Metadata**: Browser localStorage (per user)
- **Sessions**: Browser sessionStorage
- **Max File Size**: 2GB per file (Telegram limit)

## 🔐 Security

⚠️ **Important Security Notes**:

This is a demo/personal project. For production use:

1. ✅ Implement password hashing (bcrypt)
2. ✅ Use JWT tokens for authentication
3. ✅ Add rate limiting
4. ✅ Use environment variables for secrets
5. ✅ Implement proper database (MongoDB/PostgreSQL)
6. ✅ Add HTTPS only
7. ✅ Sanitize user inputs

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run local server
npm start

# Development with auto-reload
npm run dev
```

## 📝 API Endpoints

### Health Check
```
GET /api/health
```

### Settings
```
GET /api/settings?username=user1
POST /api/settings
```

### Files
```
GET /api/files?username=user1
POST /api/files
```

### Telegram Proxy
```
POST /api/telegram
Body: { method, token, data }
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Raghav**
- GitHub: [@raghavg2004](https://github.com/raghavg2004)
- Repository: [R-Cloud](https://github.com/raghavg2004/R-Cloud)

## 🙏 Acknowledgments

- Telegram Bot API for unlimited storage
- Vercel for free hosting
- Open source community

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the [DEPLOY.md](DEPLOY.md) guide
- Review the configuration section

---

**Made with ❤️ by Raghav**

⭐ Star this repo if you find it useful!
