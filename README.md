# Tiger Bar Exchange Admin Dashboard

An admin dashboard for managing a bar exchange system, built with React, Vite, and shadcn/ui.

## Features

- **Dashboard**: Total orders, top items, crashes, live stats
- **Manage Items**: Add/edit items, floor/base price, demand tracking
- **Market Crash**: Trigger crash, timer, view logs
- **Orders**: View all orders by outlet/time
- **Prebookings**: View pending/active prebookings
- **Outlets**: Add/edit outlets (name, status, location)
- **Loyalty Settings**: View users, assign manual rewards if needed
- **Settings/Auth**: Admin login/logout, token refresh, roles

## Tech Stack

- React
- Vite
- React Router
- Tailwind CSS
- shadcn/ui components
- Lucide React icons

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## Project Structure

- `/src/components`: Reusable UI components
- `/src/components/ui`: shadcn/ui components
- `/src/layouts`: Layout components
- `/src/pages`: Page components
- `/src/lib`: Utility functions

## Customization

The UI can be customized by modifying the Tailwind configuration in `tailwind.config.js` and the CSS variables in `src/index.css`.
