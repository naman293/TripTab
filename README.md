# TripTab 🌍✈️

TripTab is a modern, responsive web application designed for seamless trip expense management and group synchronization. It enables users to collaboratively track expenses, manage trip groups, and easily settle balances during or after their travels.

## 🚀 Features

- **Group Trip Management:** Create and manage distinct trip spaces for different travel groups.
- **Expense Tracking:** Add, categorize, and track expenses among group members.
- **Balance Calculation:** Automatically calculate who owes whom, simplifying settlements.
- **Secure Authentication:** Integrated with **Clerk** for robust, secure user authentication.
- **Modern UI:** Built with Tailwind CSS and React for a fast, responsive, and beautiful user experience. 

*(Note: The application currently uses local mock state to validate the UI for the MVP phase, and is designed for future transition to a real-time database such as Supabase.)*

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, PostCSS
- **Authentication:** Clerk
- **Backend Sync/API:** Custom Node.js server (serves the API and acts as the entry point for production builds)

## 📋 Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites

- Node.js (v18 or higher recommended)
- `npm` (Node Package Manager)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/naman293/TripTab.git
   cd TripTab
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` or `.env.local` file in the root directory and add your Clerk API keys:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   ```

### Running Locally

This project uses a unified script to run both the frontend UI and the backend API concurrently.

```bash
npm run dev
```

- **Frontend UI:** Available at `http://localhost:5173`
- **Backend API:** Available at `http://localhost:8787`

### Building for Production

To build the project for a production environment:

```bash
npm run build
```

You can preview the built production app locally using:

```bash
npm run start:local
```

## 📂 Project Structure

- `/src`: Contains the React frontend source code, including components, features, hooks, and types.
- `/server`: Contains the simple Node.js backend API and file-serving logic.
- `/scripts`: Contains orchestration scripts, like `dev.mjs`, to run background processes concurrently in development.
- `requirements.md`: Documentation on future database and service integrations (e.g., Supabase, PostHog, Vercel).

## 📄 License

This project is licensed under the MIT License.
