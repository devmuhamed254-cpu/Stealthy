# Stealthy - AI Meeting Assistant Overlay

<p align="center">
  <b>Undetectable, Real-Time AI Assistance for your calls and interviews.</b>
</p>

## ✨ Overview

Stealthy is a desktop application overlay that serves as your discreet AI co-pilot during meetings. It integrates directly with top-tier LLM providers (OpenAI, Groq, OpenRouter) and listens to audio to automatically transcribe, detect questions, and suggest perfect responses on-screen without obstructing your workflow or being detected by other programs.

## 🚀 Key Features

- **Invisible Overlay:** A minimal, transparent, and always-on-top interface designed to be completely undetectable in screen-shares or recordings.
- **Audio Transcription:** Captures system and mic audio to automatically transcribe conversations in real-time.
- **Question Detection & Auto-Answers:** Intelligently recognizes when you are being asked a question during a meeting and generates a relevant AI response without any manual clicks.
- **Multiple AI Providers:** Choose between `OpenAI` (GPT-4), `Groq`, and `OpenRouter` models for lightning-fast answers.
- **Global Shortcuts:** Hide or show the app instantaneously from anywhere using native hotkeys (e.g. `Cmd/Ctrl + Shift + S`).

## 📥 Installation

You can download the appropriate installer for your OS from our [Releases](#) section, or build the app from source:

1. Clone the repository:
   ```bash
   git clone https://github.com/devmuhamed254-cpu/Stealthy.git
   ```
2. Navigate into the directory and install dependencies:
   ```bash
   cd Stealthy
   npm install
   ```
3. Start the application in development mode:
   ```bash
   npm run start
   ```

## 🛠 Building for Production

Depending on your Operating System, you can package the application into a standalone installer:

- **For Windows**: `npm run dist-win`
- **For Linux**: `npm run dist-linux`

The compiled executable will be located in the `release/` folder.

## 🔧 Configuration

To begin using Stealthy's AI functionality, configure your preferred models:
1. Open Stealthy.
2. Navigate to the **Settings** panel.
3. Input your API keys for the providers you prefer (e.g. Groq or OpenAI).
4. Select your primary LLM and specify transcription preferences.
5. Click **Start Interview** to begin!

---
*Built with React, Vite, TailwindCSS, and Electron.*
