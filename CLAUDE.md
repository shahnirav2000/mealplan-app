# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MealPlan is a Progressive Web App (PWA) for AI-powered family meal planning. It's a single-page React application that helps users create personalized weekly meal plans based on cuisine preferences, meal types, and taste profiles.

## Development Commands

**Start development server:**
```bash
npm start
```
Runs on http://localhost:3000 with hot reload enabled.

**Build for production:**
```bash
npm run build
```
Creates optimized production build in `build/` directory.

**Deploy to Vercel:**
```bash
npm run deploy
```

## Architecture

### Core Application Structure

The app is a **single-component architecture** - the entire application logic lives in `src/App.js` as the `MealPlannerApp` component. This component manages:

- **Multi-user system**: Users can create profiles with customized preferences
- **State management**: All state is managed locally using React hooks (no external state library)
- **Screen navigation**: Bottom navigation bar toggles between different views (dashboard, planner, profile, history)

### Key State Variables (src/App.js)

- `currentScreen`: Controls which view is displayed ('login', 'dashboard', 'planner', 'profile', 'history', 'setupNewUser')
- `currentUser`: Currently logged-in user
- `users`: Object containing user profiles with preferences (cuisines, mealTypes, tastes)
- `meals`: Weekly meal plan for each user (organized by day and meal type)
- `userMeals`: Curated meal library for each user based on their preferences
- `weeklyPlans`: Historic weekly plans for each user
- `mealDatabase`: Comprehensive meal database organized by cuisine → meal type → taste

### Meal Planning Algorithm

The intelligent meal plan generation (`generateIntelligentPlan()`) works by:
1. Filtering available meals by type (Breakfast, Lunch, Dinner)
2. Randomly selecting meals for each day without repetition across the week
3. Tracking used meals to ensure variety throughout the week
4. Assigning meals to morning/lunch/dinner slots for all 7 days

### User Onboarding Flow

New users go through a 3-step setup process:
1. **Step 1**: Select preferred cuisines from `mealDatabase` (Indian - Gujarati, Punjabi, South Indian, Chinese, Italian, Continental, Asian - Other)
2. **Step 2**: Choose meal types (Breakfast, Lunch, Dinner) and taste preferences (mild, spicy, sweet) for each meal type
3. **Step 3**: Review curated meal library generated from selections

The `getCuratedMeals()` function generates the personalized meal library by iterating through selected cuisines, meal types, and taste preferences.

### Custom Meals

Users can add custom meals via the `CustomMealPopup` component when editing meal slots. Custom meals:
- Are added to the user's meal library (`userMeals`)
- Include fields: name, calories, cuisine, meal types, and taste profile
- Are marked with `isCustom: true` flag

## PWA Features

The app is configured as a Progressive Web App:
- **Service Worker**: Registered in `src/index.js` via `serviceWorkerRegistration.register()`
- **Manifest**: `public/manifest.json` defines app metadata, icons, theme colors
- **Offline Support**: Service worker enables offline functionality
- **Icons**: Multiple icon sizes provided in `public/` for different devices

## Styling

Uses **Tailwind CSS** utility classes throughout. No separate CSS files. Key design patterns:
- Dark theme with gradient backgrounds (`bg-gradient-to-br from-gray-900 via-gray-800 to-black`)
- Color-coded components (blue for primary actions, green for success, purple for stats)
- Responsive grid layouts using Tailwind's grid system
- Icon library: `lucide-react` for all icons

## Data Persistence

Currently, all data is stored in component state and is **not persisted** between sessions. State resets on page reload. To add persistence, consider integrating localStorage or a backend API.

## Testing Strategy

No test files currently exist. When adding tests:
- Focus on `generateIntelligentPlan()` algorithm for meal distribution
- Test user preference filtering in `getCuratedMeals()`
- Verify custom meal creation flow
- Test multi-user state isolation
