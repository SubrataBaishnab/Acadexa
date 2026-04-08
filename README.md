# Acadexa - Thesis Management & PhD Research Companion

A comprehensive academic web platform designed to streamline thesis workflow and help students find ideal supervisors and international PhD advisors.

## Project Structure

```
Acadexa/
├── backend/           # Node.js/Express backend
│   ├── src/
│   │   ├── models/    # MongoDB schemas (Supervisor, Professor)
│   │   ├── routes/    # API routes
│   │   ├── controllers/ # Business logic
│   │   ├── utils/     # Recommendation engine, chatbot helpers
│   │   └── server.js  # Express server entry point
│   └── package.json
└── frontend/          # React.js frontend
    ├── src/
    │   ├── components/ # Reusable components
    │   ├── pages/      # Page components
    │   ├── hooks/      # Custom React hooks
    │   ├── services/   # API client services
    │   ├── App.js      # Main app component
    │   └── index.js
    └── package.json
```

## Current Features Implemented

### 1. **Supervisor & PhD Advisor Listing**
- Browse all available supervisors with detailed profiles
- Filter by research areas, department, and availability
- View PhD professors from universities worldwide
- Filter professors by country, research specialty, and acceptance status

### 2. **Smart Recommendation Engine**
- AI-powered supervisor matching based on research interests
- Professor recommendations with country preference matching
- Match scoring algorithm using similarity metrics
- Detailed match explanations for each recommendation

### 3. **Chatbot for Smart Recommendations**
- Interactive chatbot widget for real-time advice
- Toggle between supervisor and PhD professor recommendations
- AI-generated responses using OpenAI API
- Historical conversation tracking

### 4. **Email Draft Generation**
- Auto-generate professional email drafts for contacting advisors
- Context-aware messaging based on research interests
- Personalized templates for academic outreach

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **AI Integration**: OpenAI API
- **Additional Libraries**: 
  - Mongoose for ODM
  - JWT for authentication
  - CORS for cross-origin requests

### Frontend
- **Framework**: React.js 18
- **Styling**: TailwindCSS
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **UI Components**: Custom components

## Getting Started

### Prerequisites
- Node.js >= 16
- MongoDB (local or Atlas)
- OpenAI API Key
- npm or yarn

### Installation

#### 1. Clone and Navigate
```bash
cd d:\Acadexa
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Update .env with your configuration:
# - MONGODB_URI
# - PORT
# - OPENAI_API_KEY
# - JWT_SECRET
# - FRONTEND_URL

# Start the server
npm run dev    # Development with nodemon
npm start      # Production
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Update .env with:
# REACT_APP_API_URL=http://localhost:5000/api

# Start the development server
npm start

# Application runs on http://localhost:3000
```

## API Endpoints

### Supervisor Endpoints
- `GET /api/supervisors` - Get all supervisors
- `GET /api/supervisors/:id` - Get supervisor by ID
- `POST /api/supervisors/recommendations` - Get recommended supervisors
- `GET /api/supervisors/search?keyword=...` - Search supervisors

### Professor Endpoints
- `GET /api/professors` - Get all professors
- `GET /api/professors/:id` - Get professor by ID
- `POST /api/professors/recommendations` - Get recommended professors
- `GET /api/professors/search?keyword=...` - Search professors

### Chatbot Endpoints
- `POST /api/chatbot/recommendation` - Get smart recommendation with chat response
- `POST /api/chatbot/email-draft` - Generate email draft

### Request Examples

**Get Recommended Supervisors:**
```json
POST /api/supervisors/recommendations
{
  "researchInterests": ["AI", "Machine Learning"],
  "skills": ["Python", "TensorFlow"]
}
```

**Get Recommended Professors:**
```json
POST /api/professors/recommendations
{
  "researchInterests": ["AI", "NLP"],
  "preferredCountries": ["USA", "UK", "Canada"]
}
```

**Get Smart Recommendation:**
```json
POST /api/chatbot/recommendation
{
  "query": "I'm interested in AI research in Canada",
  "researchInterests": ["AI", "Machine Learning"],
  "type": "professor",
  "preferredCountries": ["Canada"]
}
```

## Database Schema

### Supervisor Model
```javascript
{
  firstName, lastName, email, department,
  designation, bio, profileImage,
  researchAreas: [String],
  availableSlots, totalStudents,
  officeLocation, phoneNumber,
  websiteUrl, linkedInUrl,
  publicationsCount, h_index,
  isActive, createdAt, updatedAt
}
```

### Professor Model
```javascript
{
  firstName, lastName, email,
  university, department, country, city,
  designation, bio, profileImage,
  researchAreas: [String],
  researchKeywords: [String],
  publicationsCount, h_index, citations,
  acceptsPhDStudents, phdFocusAreas,
  fundingAvailable,
  acceptsPhDStudents, isVerified,
  sourceDatabase, sourceId,
  createdAt, updatedAt
}
```

## Frontend Components

### Pages
- **SupervisorsPage** - Browse and filter supervisors with recommendations
- **ProfessorsPage** - Browse and filter PhD professors globally

### Components
- **SupervisorCard** - Display individual supervisor information
- **ProfessorCard** - Display individual professor information
- **RecommendationFilter** - Filter recommendations by research interests, countries, match score
- **ChatbotWidget** - Floating chatbot for interactive recommendations

### Hooks
- **useAdvisors** - Custom hook for fetching and managing supervisor/professor data

### Services
- **apiService** - Centralized API client for all backend calls

## Recommendation Algorithm

The system uses a **Jaccard Similarity** approach:

1. **Research Interest Matching**: Compares student research interests with advisor research areas
2. **Keyword Matching**: Finds overlapping keywords
3. **Scoring**: Calculates intersection/union ratio as percentage
4. **Country Preference** (Professors): Adds bonus points for preferred countries
5. **Sorting**: Ranks advisors by total match score

## Next Steps for Full Implementation

### Phase 1: Core Features (Current)
- ✅ Supervisor & PhD Advisor Listing
- ✅ Smart Recommendation Engine
- ✅ Chatbot Integration
- ✅ Email Draft Generation

### Phase 2: User Authentication
- User registration and login
- Role-based access control (Student, Faculty, Admin)
- Profile management

### Phase 3: Thesis Management
- Thesis topic submission
- Synopsis upload
- Approval workflow
- Progress tracking

### Phase 4: Advanced Features
- Integration with Semantic Scholar API
- Google Calendar integration
- Cloudinary PDF upload
- SendGrid email notifications
- Claude API for burnout analysis

### Phase 5: Deployment
- Set up MongoDB Atlas
- Containerize with Docker
- Deploy to Render/Vercel

## Contributing

When adding new features:
1. Create feature branch: `git checkout -b feature/feature-name`
2. Follow the existing code structure
3. Update API documentation
4. Test thoroughly
5. Create pull request

## Troubleshooting

### Backend won't start
- Check MongoDB connection string in `.env`
- Ensure Port 5000 is not in use
- Verify all dependencies are installed: `npm install`

### API calls failing
- Verify backend is running on `PORT 5000`
- Check CORS configuration in `server.js`
- Verify `.env` variables are set correctly

### Frontend not loading data
- Check Network tab in DevTools for API errors
- Verify backend URL in `.env`
- Check browser console for errors

## Future Enhancements

- PDF thesis upload validator
- Video call scheduling with advisors
- Research paper recommendation engine
- Funding opportunity matching
- Conference recommendation system
- Peer collaboration finder
- Research publication tracker

## License

MIT License - Feel free to use this project for educational purposes

## Support

For issues and questions, create an issue in the repository or contact the development team.

---

**Happy researching! 🎓**
