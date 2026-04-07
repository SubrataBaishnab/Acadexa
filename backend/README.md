# Backend Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file based on `.env.example`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/acadexa
# OR for MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/acadexa

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_key_change_this_in_production

# OpenAI
OPENAI_API_KEY=sk-xxx...

# SendGrid (optional for later)
SENDGRID_API_KEY=SG.xxx...

# Other Services (for future use)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. Start the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will run on `http://localhost:5000`

## Database Setup

### Option 1: Local MongoDB
```bash
# Install MongoDB Community Edition
# macOS: brew install mongodb-community
# Windows: Download from https://www.mongodb.com/try/download/community
# Linux: Follow official guide

# Start MongoDB service
mongod
```

### Option 2: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/dbname`
4. Add to `.env` as `MONGODB_URI`

## API Documentation

### Health Check
```bash
GET http://localhost:5000/api/health
```

### Supervisors

**Get all supervisors:**
```bash
curl http://localhost:5000/api/supervisors
```

**Get recommended supervisors:**
```bash
curl -X POST http://localhost:5000/api/supervisors/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "researchInterests": ["AI", "Machine Learning"],
    "skills": ["Python", "TensorFlow"]
  }'
```

**Search supervisors:**
```bash
curl "http://localhost:5000/api/supervisors?keyword=john"
```

### Professors

**Get all professors:**
```bash
curl http://localhost:5000/api/professors
```

**Get recommended professors:**
```bash
curl -X POST http://localhost:5000/api/professors/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "researchInterests": ["AI"],
    "preferredCountries": ["USA", "UK"]
  }'
```

**Search professors:**
```bash
curl "http://localhost:5000/api/professors/search?keyword=smith&country=USA"
```

### Chatbot

**Get smart recommendation:**
```bash
curl -X POST http://localhost:5000/api/chatbot/recommendation \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I need help finding a good AI supervisor",
    "researchInterests": ["AI", "Machine Learning"],
    "type": "supervisor"
  }'
```

**Generate email draft:**
```bash
curl -X POST http://localhost:5000/api/chatbot/email-draft \
  -H "Content-Type: application/json" \
  -d '{
    "advisorId": "advisor_mongodb_id",
    "advisorType": "supervisor",
    "researchContext": "I am interested in deep learning"
  }'
```

## Project Structure

```
src/
├── models/           # MongoDB Schemas
│   ├── Supervisor.js
│   └── Professor.js
├── controllers/      # Business Logic
│   ├── supervisorController.js
│   ├── professorController.js
│   └── chatbotController.js
├── routes/          # API Routes
│   ├── supervisorRoutes.js
│   ├── professorRoutes.js
│   └── chatbotRoutes.js
├── utils/           # Utilities
│   ├── recommendationEngine.js
│   └── chatbotHelper.js
└── server.js        # Express App & Server
```

## Development Tips

### Add Dummy Data
Create a `seed.js` file to populate the database:

```javascript
const mongoose = require('mongoose');
const Supervisor = require('./src/models/Supervisor');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

const supervisors = [
  {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@university.edu',
    department: 'Computer Science',
    designation: 'Associate Professor',
    researchAreas: ['AI', 'Machine Learning'],
    availableSlots: 3,
    publicationsCount: 45,
    h_index: 12,
  },
  // ... more supervisors
];

Supervisor.insertMany(supervisors).then(() => {
  console.log('Data seeded');
  process.exit();
});
```

Run with: `node seed.js`

### Testing Endpoints
Use Postman or VS Code REST Client:
- Install: REST Client extension
- Create `test.http` file
- Write requests with `### Comment` separators

## Troubleshooting

### MongoDB Connection Error
- Check if service is running: `mongod --version`
- Verify connection string in `.env`
- Check firewall settings for port 27017

### OpenAI API Error
- Verify API key is valid and not expired
- Check account has credits
- Check rate limits haven't been exceeded

### Port Already in Use
```bash
# Find process on port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

## Environment Checklist

Before deploying:
- [ ] MongoDB connection tested
- [ ] OpenAI API key configured
- [ ] JWT_SECRET is strong
- [ ] FRONTEND_URL matches deployment URL
- [ ] All dependencies installed
- [ ] No console errors on startup
- [ ] Health check endpoint responds

## Next Steps

1. **Add Authentication**: Implement JWT-based auth
2. **Add Validation**: Use Joi or Yup for input validation
3. **Add Error Handling**: Comprehensive try-catch and logging
4. **Add Tests**: Jest for unit and integration tests
5. **Add Rate Limiting**: Prevent API abuse
6. **Setup CI/CD**: GitHub Actions or similar

---

For more help, check the root README.md
