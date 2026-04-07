# Frontend Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file based on `.env.example`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI Components
│   ├── SupervisorCard.js
│   ├── ProfessorCard.js
│   ├── RecommendationFilter.js
│   └── ChatbotWidget.js
├── pages/              # Page Components
│   ├── SupervisorsPage.js
│   └── ProfessorsPage.js
├── hooks/              # Custom React Hooks
│   └── useAdvisors.js
├── services/           # API Client
│   └── apiService.js
├── App.js              # Main App Component
├── index.js            # React Entry Point
└── App.css
public/
└── index.html
```

## Key Features

### 1. Supervisor Listing & Recommendations
- Browse all active supervisors
- View detailed profiles with research areas
- Get AI-powered recommendations based on interests
- Filter by match score and research interests

### 2. PhD Professor Listing & Recommendations
- Browse professors worldwide
- Filter by country, research area, funding status
- Get recommendations for global PhD opportunities
- View university profiles and verified credentials

### 3. Smart Recommendation Filter
- Multi-select research interests
- Country preference selection
- Match score threshold slider
- Reset filters quickly

### 4. Interactive Chatbot
- Floating chatbot widget (bottom-right)
- Toggle between supervisor and professor recommendations
- Ask questions about advisors
- Get AI-powered responses

## Component Guide

### SupervisorCard
Displays individual supervisor information:
```jsx
<SupervisorCard
  supervisor={supervisorData}
  onContact={handleContact}
/>
```

### ProfessorCard
Displays individual professor information:
```jsx
<ProfessorCard
  professor={professorData}
  onContact={handleContact}
/>
```

### RecommendationFilter
Provides filtering UI:
```jsx
<RecommendationFilter
  onFilterChange={handleFilterChange}
/>
```

### ChatbotWidget
Floating chatbot interface - automatically included in App.js

## Custom Hooks

### useAdvisors
Manages advisor data and API calls:

```jsx
const {
  supervisors,
  loading,
  error,
  fetchAllSupervisors,
  fetchRecommendations
} = useSupervisors();

const {
  professors,
  loading,
  error,
  fetchAllProfessors,
  fetchRecommendations
} = useProfessors();
```

## API Service

All API calls are centralized in `services/apiService.js`:

```javascript
import { supervisorService, professorService, chatbotService } from './services/apiService';

// Supervisors
supervisorService.getAllSupervisors();
supervisorService.getRecommendedSupervisors(data);
supervisorService.searchSupervisors(keyword);

// Professors
professorService.getAllProfessors();
professorService.getRecommendedProfessors(data);
professorService.searchProfessors(query);

// Chatbot
chatbotService.getSmartRecommendation(data);
chatbotService.generateEmailDraft(data);
```

## Styling with TailwindCSS

The project uses TailwindCSS for styling. Key utility classes:
- Colors: `text-blue-600`, `bg-purple-100`
- Layout: `flex`, `grid`, `gap-4`
- Spacing: `px-4`, `py-2`, `mb-6`
- Responsive: `md:grid-cols-2`, `lg:grid-cols-3`

### Customization
Tailwind configuration is in `tailwind.config.js` (generated with `npm install -D tailwindcss`).

## Development Workflow

### Adding a New Page
1. Create component in `src/pages/NewPage.js`
2. Add route in `App.js`:
```jsx
<Route path="/new-page" element={<NewPage />} />
```
3. Add navigation link in navbar

### Adding a New Component
1. Create in `src/components/NewComponent.js`
2. Import and use in pages
3. Export for reusability

### Modifying API Service
1. Edit `src/services/apiService.js`
2. Add new service method
3. Use in hooks or pages

### Creating Custom Hook
1. Create in `src/hooks/useNewHook.js`
2. Follow pattern of `useAdvisors.js`
3. Export and use in components

## Available Scripts

```bash
# Start development server
npm start

# Build for production
npm build

# Run tests
npm test

# Eject (one-way operation)
npm eject
```

## Routing Structure

- `/` - Supervisor listing and recommendations
- `/phd-professors` - Professor listing and recommendations

## Error Handling

Components handle errors gracefully:
- Loading states show spinners
- Errors display in red banner
- Empty states show helpful messages
- API failures caught and logged

## Performance Tips

1. **Image Optimization**: Compress supervisor/professor photos
2. **Lazy Loading**: Implement for long lists
3. **Memoization**: Use `React.memo()` for expensive components
4. **Code Splitting**: Use React.lazy() for routes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility

Components include:
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliant

## Future Enhancements

1. **Authentication UI**: Login/signup pages
2. **User Profile**: Student profile management
3. **Email Draft Editor**: Rich text email composer
4. **Favorites**: Save favorite advisors
5. **Comparison**: Compare multiple advisors
6. **Calendar Integration**: View advisor availability
7. **Rating System**: Community reviews

## Troubleshooting

### API Connection Failed
- Check backend is running on port 5000
- Verify `REACT_APP_API_URL` is correct
- Check network tab in DevTools

### TailwindCSS Not Applying
- Ensure content paths are correct in tailwind.config.js
- Run `npm install -D tailwindcss postcss autoprefixer`
- Restart dev server

### Components Not Updating
- Check for missing useState/useEffect dependencies
- Verify state updates in hooks
- Check browser console for errors

## Testing

Create test files with `.test.js` extension:

```javascript
import { render, screen } from '@testing-library/react';
import SupervisorCard from './SupervisorCard';

test('renders supervisor card', () => {
  const mockSupervisor = { ... };
  render(<SupervisorCard supervisor={mockSupervisor} />);
  expect(screen.getByText(/test/i)).toBeInTheDocument();
});
```

Run tests: `npm test`

## Deployment Checklist

Before deploying to production:
- [ ] Build succeeds: `npm run build`
- [ ] No console errors
- [ ] Environment variables set correctly
- [ ] API endpoint configured for production
- [ ] All routes working
- [ ] Mobile responsive verified
- [ ] Forms submit correctly
- [ ] Error states handled

## Deployment Options

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Upload build folder to Netlify
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

For more help, check the root README.md
