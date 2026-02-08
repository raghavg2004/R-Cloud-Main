# Deploy to Vercel 🚀

Your TeleDrive project is now ready for Vercel deployment!

## 📋 Prerequisites

1. **GitHub Account**: Make sure your code is pushed to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

## 🚀 Deployment Steps

### Step 1: Push to GitHub

```bash
cd "C:\Users\Raghav\Desktop\v of tele drive\TeleDrive-main"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Prepare for Vercel deployment"

# Add your GitHub repository
git remote add origin https://github.com/raghavg2004/R-Cloud.git

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click "Add New Project"**
3. **Import your GitHub repository**: `raghavg2004/R-Cloud`
4. **Configure Project**:
   - Framework Preset: **Other**
   - Root Directory: `./`
   - Build Command: Leave empty or use `npm install`
   - Output Directory: Leave empty
5. **Click "Deploy"**

### Step 3: Access Your App

Once deployed, Vercel will give you URLs like:
- Production: `https://r-cloud.vercel.app`
- Preview: `https://r-cloud-xxx.vercel.app`

## ⚙️ Configuration

### User Credentials (Update in app.js)

The current demo users are:
```javascript
const USERS = {
    'raghav': { password: 'raghavg2004', email: 'user1@example.com' },
    'user2': { password: 'password2', email: 'user2@example.com' },
    'admin': { password: 'admin123', email: 'admin@example.com' }
};
```

**⚠️ Security Note**: For production, implement proper authentication with encrypted passwords!

### Telegram Bot Setup

1. Get your bot token from [@BotFather](https://t.me/BotFather) on Telegram
2. Create a private channel and add your bot as admin
3. Get the channel ID
4. Enter these in the app's Settings modal when you first open it

## 📝 Important Notes

### Storage Behavior

**Vercel Deployment**:
- ✅ Serverless functions work (API endpoints)
- ✅ Client-side works perfectly
- ⚠️ **No persistent file storage** on Vercel (read-only filesystem)
- ✅ **Solution**: All user data is stored in browser's localStorage
- ✅ Files are uploaded to Telegram (unlimited storage!)

**How it Works**:
1. File metadata is stored in your browser's localStorage
2. Actual files are stored in your Telegram channel
3. Each user's data is isolated by username
4. Data persists in browser (not on server)

### Data Persistence

- **User files list**: Stored in `localStorage` per user
- **Settings**: Stored in `localStorage` per user
- **File uploads**: Stored in your Telegram channel (永久存储)
- **Login sessions**: Stored in `sessionStorage`

## 🔧 Local Development

To run locally:

```bash
# Install dependencies
npm install

# Start the local server
npm start

# Or use nodemon for auto-restart
npm run dev
```

Visit: `http://localhost:3000` (server) or open `index.html` directly

## 🌐 Custom Domain (Optional)

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed by Vercel

## 🐛 Troubleshooting

**Issue**: Server not found
- **Solution**: The app will automatically use localStorage if server is unavailable

**Issue**: Files not showing after refresh
- **Solution**: Make sure you're logged in with the same username

**Issue**: Login not working
- **Solution**: Check the username/password in `app.js` USERS object

## 📱 Features

✅ Multi-user authentication  
✅ User-specific data isolation  
✅ Telegram integration for file storage  
✅ Responsive design  
✅ Dark/Light theme  
✅ File preview  
✅ Search & filter files  
✅ Drag & drop upload  

## 🔐 Security Recommendations

For production use, consider:
1. Use environment variables for sensitive data
2. Implement proper password hashing (bcrypt)
3. Add rate limiting on API endpoints
4. Use JWT tokens for authentication
5. Add HTTPS only
6. Implement database for user data (MongoDB, PostgreSQL, etc.)

---

**Made with ❤️ by Raghav**

Repository: https://github.com/raghavg2004/R-Cloud.git
