# UniConnect

[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

UniConnect is a comprehensive social platform designed specifically for university students. It enables students to connect, share posts, collaborate on projects, participate in events, and engage in real-time chats, fostering a vibrant academic community.

## Features

- **User Authentication**: Secure login and signup with email and password.
- **Profiles**: Detailed user profiles including university, major, year, bio, and social links (e.g., GitHub).
- **Posts**: Share text and image posts with likes, comments, and shares.
- **Stories**: Temporary photo stories to share daily updates.
- **Events**: Discover and attend university events, categorized by type.
- **Projects**: Collaborative project management with GitHub integration, status tracking, and team member management.
- **Chat**: Real-time messaging with individual and group chats.
- **Edit Profile**: Customize your profile information and avatar.

## Tech Stack

- **Framework**: [Expo](https://expo.dev/) with [React Native](https://reactnative.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Data Fetching**: [TanStack React Query](https://tanstack.com/query/latest)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Storage**: [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- **Icons**: [Lucide React Native](https://lucide.dev/) and [@expo/vector-icons](https://docs.expo.dev/guides/icons/)
- **Other Libraries**: Expo modules for image picking, location, web browser, etc.

## Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or bun
- Expo CLI (install globally: `npm install -g @expo/cli`)

### Steps

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd uni-connect
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start the development server**:
   - For mobile (iOS/Android):
     ```bash
     npm run start
     # or
     bun run start
     ```
     This will start the Expo development server with a tunnel.

   - For web:
     ```bash
     npm run start-web
     # or
     bun run start-web
     ```

4. **Run on device/emulator**:
   - Install the Expo Go app on your device.
   - Scan the QR code displayed in the terminal or use the Expo Dev Tools in your browser.

## Usage

1. **Sign Up/Login**: Create an account or log in with your credentials.
2. **Complete Profile**: Fill in your university details, major, year, and bio.
3. **Explore**: Browse posts, events, and projects in the tabs.
4. **Create Content**: Share posts, create projects, or start chats.
5. **Collaborate**: Join projects, attend events, and connect with peers.

## Project Structure

```
uni-connect/
├── app/                          # App screens and navigation
│   ├── (tabs)/                   # Tab-based navigation
│   ├── chat/                     # Chat-related screens
│   ├── project/                  # Project-related screens
│   ├── login.tsx                 # Login screen
│   ├── signup.tsx                # Signup screen
│   ├── create-post.tsx           # Create post screen
│   ├── create-project.tsx        # Create project screen
│   ├── edit-profile.tsx          # Edit profile screen
│   ├── posts.tsx                 # Posts feed
│   └── _layout.tsx               # Root layout
├── assets/                       # Static assets (images, icons)
├── constants/                    # App constants (colors, etc.)
├── contexts/                     # React contexts (AuthContext)
├── mocks/                        # Mock data for development
├── types/                        # TypeScript type definitions
├── app.json                      # Expo app configuration
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request.

Please ensure your code follows the existing style and includes tests where applicable.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or issues, please open an issue on GitHub or contact the maintainers.

---

Built with ❤️ for university students everywhere.
