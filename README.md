# Camera Control Dashboard - Vue.js 3 + Tailwind CSS

A modern, responsive dashboard for controlling Blackmagic cameras using Vue.js 3 and Tailwind CSS.

## ✨ Features

- **Real-time WebSocket connections** to multiple cameras
- **Auto-restart recording** when cameras stop unexpectedly
- **Responsive design** with Tailwind CSS
- **Modern Vue.js 3** Composition API
- **Pinia state management** for clean architecture
- **Real-time updates** for timecode, format, and status

## 🚀 Tech Stack

- **Frontend**: Vue.js 3 (Composition API)
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Pinia
- **Font**: Montserrat (Google Fonts)

## 📦 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## 🔧 Configuration

### Camera IP Addresses

Edit `src/stores/cameraStore.js` to configure camera IP addresses:

```javascript
const cameras = reactive({
  camera1: {
    id: 'camera1',
    ip: '192.168.8.201',  // Change this IP
    // ... other properties
  },
  // ... other cameras
})
```

### WebSocket Endpoints

The dashboard connects to cameras via WebSocket at:
```
ws://{CAMERA_IP}/control/api/v1/event/websocket
```

## 🎯 Usage

1. **Connect to cameras** - WebSocket connections are established automatically
2. **Monitor status** - Real-time connection and recording status
3. **Control recording** - Start/stop recording for each camera
4. **View format info** - Codec, frame rate, resolution, device name
5. **Monitor timecode** - Real-time clip timecode display

## 📱 Responsive Design

- **Desktop (≥1201px)**: 3 columns layout
- **Tablet (769px-1200px)**: 2 columns layout  
- **Mobile (≤768px)**: 1 column layout

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
colors: {
  'camera-red': '#FF0000',
  'camera-orange': '#FF8C00',
  'camera-green': '#27ae60',
  'camera-dark': '#1a1a1a',
  'camera-card': '#2a2a2a',
  'camera-element': '#3a3a3a',
  'camera-border': '#4a4a4a'
}
```

### Animations

Custom animations are defined in `tailwind.config.js`:

- `recording-pulse`: Button pulse animation
- `recording-gradient`: Gradient animation
- `recording-item-pulse`: Status item pulse

## 🔌 API Endpoints

### Camera Control
- `PUT /control/api/v1/transports/0/record` - Start/stop recording

### Camera Data
- `GET /control/api/v1/system/format` - Camera format information
- `GET /control/api/v1/transports/0/timecode` - Timecode data
- `GET /control/api/v1/media/active` - Device information

## 🚨 Auto-restart Feature

The dashboard automatically restarts recording when:
- Camera stops recording unexpectedly
- Network connection is restored
- WebSocket reconnects

**Note**: Manual stops (via Stop button) do not trigger auto-restart.

## 📁 Project Structure

```
src/
├── components/
│   └── CameraCard.vue          # Individual camera component
├── stores/
│   └── cameraStore.js          # Pinia store for camera state
├── App.vue                     # Main application component
├── main.js                     # Application entry point
└── style.css                   # Global styles and Tailwind imports
```

## 🐛 Troubleshooting

### WebSocket Connection Issues
- Check camera IP addresses
- Verify network connectivity
- Check camera WebSocket endpoint availability

### Build Issues
- Ensure Node.js version ≥16
- Clear `node_modules` and reinstall dependencies
- Check Vite configuration

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation 