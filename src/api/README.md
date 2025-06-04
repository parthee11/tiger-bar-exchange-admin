# API Client

This folder contains the API client for the Tiger Bar Exchange admin application.

## Structure

- `index.js` - Base API client with axios configuration and interceptors
- `api.js` - Exports all API modules
- `auth.js` - Authentication API functions
- `items.js` - Items API functions
- `orders.js` - Orders API functions
- `branches.js` - Branches API functions
- `prebookings.js` - Prebookings API functions
- `loyalty.js` - Loyalty API functions

## Usage

### Import the API modules

```jsx
// Import all APIs
import api from '../api/api';

// Or import specific API modules
import { authApi, itemsApi } from '../api/api';

// Or import directly from the module
import authApi from '../api/auth';
```

### Use the API functions

```jsx
// Example: Sign in
const handleSignIn = async (email, password) => {
  try {
    const response = await authApi.signIn(email, password);
    console.log('Signed in:', response.user);
  } catch (error) {
    console.error('Sign in error:', error);
  }
};

// Example: Get items
const fetchItems = async () => {
  try {
    const response = await api.items.getItems();
    console.log('Items:', response.items);
  } catch (error) {
    console.error('Error fetching items:', error);
  }
};
```

## Configuration

The API client is configured with the base URL from the environment variable `VITE_API_BASE_URL`. You can change this in the `.env` file.

## Authentication

The API client automatically includes the authentication token in requests if it exists in localStorage. When a user signs in, the token is stored in localStorage and included in subsequent requests.

## Error Handling

The API client includes error handling for common errors:

- 401 Unauthorized: Automatically clears the token and user from localStorage
- Other errors: Returns the error response from the server

Each API function wraps the error in a try/catch block and returns a standardized error format.