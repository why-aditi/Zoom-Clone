# Zoom Clone

A real-time video conferencing web application built with WebRTC, Socket.IO, and Express.js that mimics core Zoom functionality.

## Features

- **Real-time Video Conferencing**: Connect with multiple participants via webcam and microphone
- **Live Chat**: Send and receive messages in real-time during meetings
- **Participants Management**: View all participants in the meeting
- **Invite Functionality**: Invite others to join your meeting via email
- **Video/Audio Controls**: Toggle your camera and microphone on/off
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, EJS (Embedded JavaScript templates)
- **Backend**: Node.js, Express.js
- **Real-time Communication**:
  - WebRTC (Peer.js) for video/audio streaming
  - Socket.IO for real-time messaging and events
- **Other Libraries**:
  - UUID for generating unique room IDs
  - Bootstrap for styling

## Prerequisites

- Node.js (v12 or higher)
- NPM (v6 or higher)
- A modern web browser with WebRTC support (Chrome, Firefox, Safari, Edge)

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/zoom-clone.git
   cd zoom-clone
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the server:

   ```
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

### Starting a Meeting

1. When you open the application, you'll be automatically redirected to a new meeting room with a unique URL
2. Allow camera and microphone access when prompted
3. Enter your name when prompted
4. Share the URL with others to invite them to your meeting

### During a Meeting

- **Toggle Audio**: Click the microphone icon to mute/unmute
- **Toggle Video**: Click the camera icon to turn your video on/off
- **View Participants**: Click the "Participants" button to see who's in the meeting
- **Chat**: Click the "Chat" button to open the chat panel and communicate via text
- **Invite Others**: In the participants panel, enter an email address and click "Invite"
- **Leave Meeting**: Click "Leave Meeting" to exit

## Project Structure

- `server.js` - Main server file that handles Express setup and Socket.IO events
- `public/` - Static assets
  - `script.js` - Client-side JavaScript for WebRTC and UI functionality
  - `style.css` - Styling for the application
- `views/` - EJS templates
  - `room.ejs` - Main meeting room template
