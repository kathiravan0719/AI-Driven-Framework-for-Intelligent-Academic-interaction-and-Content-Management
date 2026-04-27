# 🎓 AI-Driven College Interaction & Content Management System

A modern, intelligent platform for college students to interact, share content, and build community using AI-powered features and real-time data monitoring.

## 🌟 Features

### Core Features
- ✅ **Real-time Communication** - Instant updates using Socket.io
- ✅ **AI Content Moderation** - Automatic content quality checking
- ✅ **Sentiment Analysis** - Understand the tone of discussions
- ✅ **Smart Recommendations** - AI-powered post suggestions
- ✅ **Advanced Search** - NLP-powered search with relevance scoring
- ✅ **Analytics Dashboard** - Real-time insights and statistics
- ✅ **User Profiles** - Track activity and engagement
- ✅ **Events Management** - Campus events with registration
- ✅ **Discussion Forums** - Topic-based conversations

### AI-Powered Features
- 🤖 **Content Quality Scoring** - Automatic quality assessment
- 🤖 **Auto-categorization** - Smart category suggestions
- 🤖 **Tag Generation** - Automatic tag extraction
- 🤖 **Spam Detection** - Identify and flag spam content
- 🤖 **Sentiment Detection** - Analyze emotional tone
- 🤖 **Smart Recommendations** - Personalized content suggestions

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library with Vite
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Recharts** - Data visualization
- **TensorFlow.js** - Client-side AI
- **Lucide React** - Modern icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **Natural** - NLP library
- **Sentiment** - Sentiment analysis
- **Nodemailer** - Email service

## 📁 Project Structure
```
ai-college-system/
├── frontend/               # React Frontend
├── backend/                # Node.js Backend
└── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### 1. Clone Repository
```bash
git clone https://github.com/kathiravan0719/AI-Driven-Framework-for-Intelligent-Academic-interaction-and-Content-Management.git
cd AI-Driven-Framework-for-Intelligent-Academic-interaction-and-Content-Management
```

### 2. Setup Backend
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install

# Create .env file
cp .env.example .env

# Edit .env
```

### 4. Run Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Access the application at `http://localhost:3000`

## 📊 Features Documentation

### AI Content Moderation
The system automatically checks all posts for:
- Toxic content
- Spam patterns
- Content quality
- Readability

### Real-time Features
- Live post updates
- Instant comments
- Real-time notifications
- Online user status
- Typing indicators

### Analytics
- User engagement metrics
- Post performance
- Platform statistics
- Activity timeline
- Sentiment trends

## 🔐 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get current user
```

### Posts
```
GET    /api/posts            - Get all posts
POST   /api/posts            - Create post
GET    /api/posts/:id        - Get single post
PUT    /api/posts/:id        - Update post
DELETE /api/posts/:id        - Delete post
PUT    /api/posts/:id/like   - Like/unlike post
POST   /api/posts/:id/comment - Add comment
```

## 🔧 Configuration

### Environment Variables

**Server (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-college-cms
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Client (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 🚢 Deployment

### Production Readiness
The application is pre-configured for production with:
- **Helmet**: Secure HTTP headers for XSS and clickjacking protection.
- **Compression**: Response body compression for faster page loads.
- **Morgan**: Structured request logging in production.
- **Vite esbuild**: Automated stripping of `console.log` in production bundles.

## 👥 Author

- **D.kathiravan** - [GitHub](https://github.com/kathiravan0719)

## 📜 License

This project is licensed under the MIT License.
