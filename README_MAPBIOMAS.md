# Brazilian Water Data Finder

A React + TypeScript + Vite application that integrates Google Maps with the MapBiomas Water API to display Brazilian water reservoir data.

## Features

- 🗺️ **Interactive Google Maps**: Click anywhere to set a location
- 💧 **Real Water Data**: Uses MapBiomas Water API for authentic Brazilian reservoir information
- 📍 **Location-Based Search**: Find nearest water reservoirs around any location
- 🎯 **Default Location**: Starts at Charqueadas, RS, Brazil (R. Gen. Balbão, 81 - Centro)
- ⚡ **Real-Time Updates**: Location changes trigger immediate water data searches

## APIs Used

### MapBiomas Water API
- **Documentation**: https://plataforma.agua.mapbiomas.org/api/docs/
- **Endpoints**:
  - `/api/ana/reservoir` - List all Brazilian reservoirs
  - `/api/ana/surface/reservoir/{code}/{cadence}` - Water surface time series
- **Data Source**: Official Brazilian National Water Agency (ANA) database
- **Coverage**: Comprehensive reservoir monitoring across Brazil

### Google Maps JavaScript API
- Interactive map interface
- Location selection and visualization
- Marker display for selected locations

## Setup Instructions

### Prerequisites
- Node.js 18 or higher
- Google Maps API key
- Internet connection (for API calls)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/pedrosouza458/hackathon-2025-projeto.git
   cd hackathon-2025-projeto
   git checkout google-maps-only
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Google Maps API**:
   - Get your FREE API key from: https://console.cloud.google.com/google/maps-apis/overview
   - Update the `.env` file:
     ```
     VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
     ```
   - **Important**: Add your domain to API key restrictions in Google Cloud Console

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**: http://localhost:5173 (or the port shown in terminal)

## Usage

1. **View Default Location**: Map loads centered on Charqueadas, RS, Brazil
2. **Select New Location**: Click anywhere on the map to search for nearby reservoirs
3. **View Results**: Loading indicator appears, then reservoir data is displayed
4. **Explore Data**: Check browser console for detailed reservoir information including:
   - Reservoir names and codes
   - Distances from selected location
   - SAR IDs for detailed tracking

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production version
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint code quality checks

### Project Structure

```
src/
├── App.tsx                     # Main application component
├── App.css                     # Application styles
├── main.tsx                    # Application entry point
├── components/
│   └── GoogleMapSimple.tsx     # Google Maps integration
└── services/
    └── mapBiomasApi.ts         # MapBiomas Water API service
```

### Key Technologies

- **React 19.1.1**: Modern React with latest features
- **TypeScript**: Type-safe development
- **Vite 5.4.21**: Fast build tool and dev server
- **Google Maps JavaScript API**: Interactive mapping
- **MapBiomas Water API**: Brazilian water reservoir data

## API Key Setup (Detailed)

### Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Maps JavaScript API"
4. Create credentials (API Key)
5. **Important**: Add your domain to API key restrictions:
   - For development: `http://localhost:*`
   - For production: Add your actual domain

### No API Key Required for MapBiomas
The MapBiomas Water API is free and open - no authentication required!

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- **MapBiomas**: For providing free access to Brazilian water data
- **Google Maps**: For mapping infrastructure
- **ANA (National Water Agency)**: For comprehensive reservoir monitoring data