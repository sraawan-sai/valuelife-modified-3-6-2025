# MLM Portal with JSON Database

This is a Multi-Level Marketing (MLM) portal application with a JSON file-based database.

## Features

- User authentication (login/register)
- Dashboard with statistics
- Network visualization and management
- Wallet and transaction management
- KYC verification
- Product management
- Admin panel

## Database Structure

The application uses a JSON file-based database (`src/data/db.json`) which is accessed through an Express server API. The database contains the following sections:

- `currentUser`: The currently logged-in user
- `users`: All registered users
- `transactions`: All financial transactions
- `networkMembers`: Network hierarchy structure
- `networkStats`: Statistics about the network
- `dashboardStats`: User dashboard statistics
- `wallet`: User wallet information
- `commissionStructure`: Commission structure settings
- `kycRequests`: KYC verification requests
- `adminAuth`: Admin authentication credentials

## Setup and Running

1. Install dependencies:
   ```
   npm install
   ```

2. Run both the frontend and backend servers:
   ```
   npm run dev:full
   ```

   This will start:
   - Vite development server for the frontend at http://localhost:5173
   - Express API server for the JSON database at http://localhost:3001

3. Alternatively, you can run them separately:
   ```
   npm run dev        # Start frontend only
   npm run server     # Start database server only
   ```

## API Endpoints

The Express server provides the following API endpoints:

- `GET /api/db`: Get the entire database
- `GET /api/db/:section`: Get a specific section of the database
- `POST /api/db/:section`: Update a specific section of the database
- `POST /api/db/:section/add`: Add an item to an array in the database
- `POST /api/db/currentUser/update`: Update the current user

## Using the Database Service

Import functions from the `jsonDbService.ts` file to interact with the database:

```typescript
import { 
  getCurrentUser, 
  updateCurrentUser, 
  getAllUsers,
  // other functions as needed
} from './utils/jsonDbService';

// Example usage
const user = await getCurrentUser();
// Update user
await updateCurrentUser({...user, name: 'New Name'});
```

## Development

The database service (`jsonDbService.ts`) provides functions for all database operations, abstracting away the API calls. All functions are asynchronous and return Promises.

## Switching Back to Local Storage

If you need to switch back to using local storage, update the imports in your components from `jsonDbService` to `localStorageService`. 