# Quick Setup Instructions

## Prerequisites
- Node.js 16 or higher
- npm or yarn
- MongoDB (local or Atlas account)
- OpenAI API key

## 5-Minute Setup

### Step 1: Clone to Your Workspace ✅
Already created at: `d:\Acadexa`

### Step 2: Backend Setup (5 minutes)
```bash
cd d:\Acadexa\backend

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env

# Edit .env with your values:
# - MONGODB_URI (local or Atlas)
# - OPENAI_API_KEY
# - JWT_SECRET (keep it secret!)

# Start backend
npm run dev
```

**Backend running on**: http://localhost:5000

### Step 3: Frontend Setup (5 minutes)
```bash
cd d:\Acadexa\frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Start frontend
npm start
```

**Frontend running on**: http://localhost:3000

## What You Get

### ✅ Feature 1: Supervisor Listing & Smart Recommendations
- Browse all available supervisors
- View research areas, available slots, publications
- Get AI-powered recommendations based on your interests
- Smart matching algorithm (Jaccard similarity)
- Filter by match score and research topics

### ✅ Feature 2: PhD Advisor Listing & Smart Recommendations
- Browse professors from universities worldwide
- Filter by country, research area, funding availability
- Country-aware recommendation system
- See matching explanations
- Access university profiles

### ✅ Feature 3: Interactive Chatbot
- Floating widget (bottom-right corner)
- Ask questions about supervisors/professors
- Toggle between supervisor and PhD modes
- AI-generated responses using OpenAI
- Smart recommendations with explanations

### ✅ Feature 4: Email Draft Generation
- Auto-generate professional emails
- Context-aware personalization
- Ready-to-send templates

## Testing the Features

### Test Supervisor Recommendations
1. Go to http://localhost:3000
2. Click "Find Supervisor"
3. Click "Get Recommendations"
4. Select research interests (AI, Machine Learning, etc.)
5. View recommendations with match scores

### Test PhD Advisor Recommendations
1. Go to http://localhost:3000/phd-professors
2. Click "Get Recommendations"
3. Select research interests and preferred countries
4. View professors ranked by match score

### Test Chatbot
1. Click the 💬 button (bottom-right)
2. Select "Supervisor" or "Professor"
3. Type your question (e.g., "I need AI supervisor")
4. Get AI-powered response with recommendations

## Project Architecture

```
BACKEND (Express.js + MongoDB)
├── Supervisor Model Schema
├── Professor Model Schema
├── Recommendation Engine (Jaccard Similarity)
├── Chatbot Integration (OpenAI API)
├── API Routes & Controllers
└── Database Models

FRONTEND (React.js + TailwindCSS)
├── Supervisor Listing Page
├── Professor Listing Page
├── Recommendation Filter Component
├── Chatbot Widget Component
├── API Service Layer
└── Custom Hooks for Data Management
```

## Key Files to Review

### Backend
- `backend/src/server.js` - Express server setup
- `backend/src/models/` - MongoDB schemas
- `backend/src/utils/recommendationEngine.js` - Matching algorithm
- `backend/src/routes/` - API endpoints

### Frontend
- `frontend/src/pages/` - Main pages
- `frontend/src/components/` - Reusable components
- `frontend/src/services/apiService.js` - API client
- `frontend/src/hooks/useAdvisors.js` - Data management

## Database Seeding (Optional)

Want dummy data? Create `backend/seed.js`:

```javascript
const mongoose = require('mongoose');
const Supervisor = require('./src/models/Supervisor');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

const supervisors = [
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@uni.edu',
    department: 'Computer Science',
    designation: 'Associate Professor',
    researchAreas: ['AI', 'Machine Learning'],
    availableSlots: 3,
    publicationsCount: 45,
    h_index: 12,
    isActive: true,
  },
  // Add more supervisors
];

Supervisor.insertMany(supervisors).then(() => {
  console.log('Database seeded!');
  process.exit();
});
```

Run: `node seed.js`

## Common Issues & Fixes

### "Cannot find module"
```bash
# Delete node_modules and reinstall
rm -r node_modules package-lock.json
npm install
```

### MongoDB Connection Error
- Verify `.env` has correct `MONGODB_URI`
- Check MongoDB service is running
- Try Atlas URL: `mongodb+srv://user:pass@cluster.mongodb.net/db`

### OpenAI API Error
- Check API key is valid
- Verify account has credits
- Check rate limits

### Port Already in Use
```bash
# Windows: Find and kill process on port
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :5000
kill -9 <PID>
```

## Next Steps

### Phase 1: Enhance Current Features ✨
- [ ] Add user authentication
- [ ] Implement email draft editor
- [ ] Add supervisor ratings/reviews
- [ ] Create advisor comparison feature
- [ ] Add favorite/wishlist system

### Phase 2: Core Thesis Features 📚
- [ ] Thesis topic submission
- [ ] Synopsis upload
- [ ] Approval workflow
- [ ] Progress tracking dashboard
- [ ] Deadline notifications

### Phase 3: Advanced Integration 🚀
- [ ] Semantic Scholar API for paper recommendations
- [ ] Google Calendar auto-scheduling
- [ ] SendGrid email notifications
- [ ] Cloudinary PDF storage
- [ ] Claude API for burnout analysis

### Phase 4: Deployment 🌐
- [ ] Docker containerization
- [ ] MongoDB Atlas setup
- [ ] Vercel/Render deployment
- [ ] CI/CD pipeline
- [ ] Monitoring and logging

## Documentation Files

- `README.md` - Project overview
- `backend/README.md` - Backend setup & API docs
- `frontend/README.md` - Frontend setup & components
- `QUICK_START.md` - This file!

## Support & Resources

### Useful Links
- React Docs: https://react.dev
- Express Docs: https://expressjs.com
- MongoDB Docs: https://docs.mongodb.com
- TailwindCSS: https://tailwindcss.com
- OpenAI API: https://openai.com/api

### API Testing
- Postman: https://www.postman.com
- VS Code REST Client Extension
- cURL commands in documentation

### Deployment
- Vercel: https://vercel.com (Frontend)
- Render: https://render.com (Backend)
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas

## Project Status

- ✅ Project structure created
- ✅ Backend API setup complete
- ✅ Frontend UI components complete
- ✅ Recommendation engine implemented
- ✅ Chatbot integration ready
- ✅ Email draft generation ready
- ⏳ Ready for testing and enhancement

---

Happy coding! 🚀

For detailed setup, see:
- `backend/README.md` for backend details
- `frontend/README.md` for frontend details
- Root `README.md` for full project overview
