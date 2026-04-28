# Supervisor Data Import Guide

## Step 1: Prepare Your Excel File

Create an Excel file (`supervisors.xlsx`) with the following columns:

| Name | Code | Status | Designation | Email | Level |
|------|------|--------|-------------|-------|-------|
| Ashraful Islam Shanto Sikder | ASRF | Accepting | Lecturer | ashraful.islam@bracu.ac.bd | U |
| Mohammad Naveed Hossain | MVH | Accepting | Lecturer | mohammad.naveed@bracu.ac.bd | U |
| Dr. Mohammad Kaykobad | KYK | Accepting | Professor | kaykobad@bracu.ac.bd | P |
| Dr. Chowdhury Mofizur Rahman | CMR | Accepting | Professor | rahman.mofizur@bracu.ac.bd | U & P |

### Column Details:

- **Name**: Full name of the supervisor
- **Code**: Short identifier (e.g., ASRF, MVH)
- **Status**: `Accepting` or `Not Accepting` (whether they accept new students)
- **Designation**: Professor, Associate Professor, Senior Lecturer, Lecturer, Adjunct Lecturer, etc.
- **Email**: Email address
- **Level**: 
  - `U` = Supervises Undergraduates only
  - `P` = Supervises Postgraduates only
  - `U & P` = Both Undergraduates and Postgraduates

## Step 2: Update the Import Script

Edit `importSupervisors.js` and replace the `supervisorData` array with your data:

```javascript
const supervisorData = [
  { name: 'Ashraful Islam Shanto Sikder', code: 'ASRF', status: 'Accepting', designation: 'Lecturer', email: 'ashraful.islam@bracu.ac.bd', level: 'U' },
  { name: 'Mohammad Naveed Hossain', code: 'MVH', status: 'Accepting', designation: 'Lecturer', email: 'mohammad.naveed@bracu.ac.bd', level: 'U' },
  // Add all supervisors here...
];
```

## Step 3: Run the Import

```bash
cd backend
node importSupervisors.js
```

You should see:
```
✅ MongoDB connected
🗑️ Dropped existing Supervisor collection and indexes
📂 Parsed 250 supervisors
✅ Successfully imported 250 supervisors
```

## Step 4: Verify in MongoDB Atlas

1. Go to MongoDB Atlas
2. Navigate to Collections
3. Find the `Supervisors` collection
4. Verify the data is imported correctly

## Fields Stored in MongoDB

Each supervisor document will have:
- `firstName` - First name
- `lastName` - Last name
- `code` - Short code (e.g., ASRF)
- `email` - Email address
- `department` - Computer Science and Engineering
- `university` - BRAC University
- `designation` - Job title
- `isAcceptingStudents` - Boolean (true/false)
- `supervisesUndergrad` - Boolean
- `supervisesPostgrad` - Boolean
- `isVerified` - Marked as true
- `sourceDatabase` - "brac-import"
- `createdAt` - Timestamp

## Filter Information for Frontend

The filters work with these fields:

### Status Filter:
- **All** - Shows all supervisors
- **Accepting** - Filters by `isAcceptingStudents: true`
- **Not Accepting** - Filters by `isAcceptingStudents: false`

### Level Filter:
- **Both** - Shows all supervisors
- **Undergraduate** - Filters by `supervisesUndergrad: true`
- **Postgraduate** - Filters by `supervisesPostgrad: true`

### Type Filter:
- Currently set but not filtered in backend (can be extended)

## API Query Examples

```javascript
// All accepting supervisors
GET /api/supervisors?isAccepting=true

// Supervisors accepting undergraduates
GET /api/supervisors?supervisesUndergrad=true

// Postgraduate supervisors only
GET /api/supervisors?supervisesPostgrad=true
```

## Next Steps

1. Add all supervisor data to the import script
2. Run the import
3. Update the frontend to display the filters (Status, Level, Type)
4. Test filtering works correctly
