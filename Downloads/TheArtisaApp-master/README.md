# The Artisan App

The Artisan App is a cross-platform mobile and web application for discovering, connecting with, and hiring local service professionals (artisans). Built with React Native, Expo, and TypeScript, it features a modern UI, real-time chat, and a robust service browsing experience.

---

## 🚀 Tech Stack

- **Framework:** React Native (0.79), Expo (53)
- **Navigation:** Expo Router (file-based), React Navigation
- **Language:** TypeScript
- **Styling:** NativeWind (Tailwind CSS for RN), React Native Paper, custom theming
- **State/Data:** React Query, Axios
- **Animation:** React Native Reanimated, Gesture Handler
- **Device/UX:** Expo Haptics, Expo Image, Expo Blur, Expo Web Browser
- **Testing/Quality:** ESLint, Prettier

## 📁 Project Structure

- `app/` — Main screens, navigation, and routing (file-based)
  - `(tabs)/` — Tab navigation screens (Home, Explore, How It Works, Connect, etc.)
  - `category/`, `service/` — Dynamic routes for categories and service details
- `components/` — Reusable UI components (cards, sections, chat, etc.)
- `data/` — Mock data for services, artisans, and messages
- `constants/` — App-wide constants (colors, etc.)
- `hooks/` — Custom React hooks (color scheme, responsive styles)
- `types/` — TypeScript types for services, messages, users
- `assets/` — Images, icons, and fonts

## ✨ Features

- Browse and search for local services by category
- View detailed service and artisan profiles
- Real-time chat with artisans (mocked for demo)
- Attach images/files in chat
- Animated, responsive UI with theming and haptic feedback
- Trust & safety features (verified pros, secure payments, satisfaction guarantee)
- Modern onboarding and "How It Works" walkthrough

## 🛠️ Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the app**

   ```bash
   npx expo start
   ```

   - Open in Expo Go, iOS Simulator, Android Emulator, or Web

3. **Lint the code**

   ```bash
   npm run lint
   ```

4. **Reset the project** (optional, resets to a blank app)

   ```bash
   npm run reset-project
   ```

## 🏗️ Best Practices

- Use functional components and React Hooks
- Modular folder structure for scalability
- TypeScript for type safety
- Optimize and compress assets
- Limit third-party dependencies
- Consistent code style (ESLint, Prettier)

## 📚 Learn More

- [Expo documentation](https://docs.expo.dev/)
- [React Native docs](https://reactnative.dev/)
- [NativeWind docs](https://www.nativewind.dev/)
- [React Query docs](https://tanstack.com/query/latest)

## 🤝 Community & Contributing

- [Expo on GitHub](https://github.com/expo/expo)
- [Expo Discord](https://chat.expo.dev)

---

**Built with ❤️ by NaniTech Dev Works.
