# Google Maps Styling Guide

This guide explains how to customize the appearance of your Google Maps implementation in the GSA Opportunities map.

## Current Configuration

The map currently uses:
- **Map ID**: `GSA_OPPORTUNITIES_MAP`
- **Default Style**: Google's default map style
- **API Key**: Configured in `.env.local` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## How to Create Custom Map Styles

### 1. Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **Credentials**
4. Ensure your API key has the following APIs enabled:
   - Maps JavaScript API
   - Maps Embed API (optional)

### 2. Create a Custom Map Style

#### Option A: Using Cloud-based Maps Styling

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Google Maps Platform** > **Map Styles**
3. Click **Create Map ID**
4. Name your map (e.g., "GSA Opportunities Custom")
5. Choose a base map style:
   - **Standard**: Default Google Maps style
   - **Silver**: Muted, grayscale style
   - **Retro**: Vintage map aesthetic
   - **Dark**: Dark mode friendly
   - **Night**: High contrast dark theme
   - **Aubergine**: Purple-tinted theme

6. Click **Customize** to modify colors, labels, and features
7. Save your style
8. Copy the **Map ID** (format: `abc123def456`)

#### Option B: Using JSON Styling

You can also define custom styles using JSON. Here are some popular presets:

**Silver (Muted)**
```json
[
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#f5f5f5" }]
  }
]
```

**Dark Mode**
```json
[
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#212121" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#212121" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#000000" }]
  }
]
```

**Government/Professional Blue**
```json
[
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [{ "color": "#1e3a8a" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#3b82f6" }]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry",
    "stylers": [{ "color": "#f8fafc" }]
  }
]
```

### 3. Apply Custom Styling to Your Map

#### Method 1: Using Map ID (Recommended)

Update `components/google-gsa-map.tsx`:

```tsx
map.current = new window.google.maps.Map(mapContainer.current, {
  center: { lat: 39.8283, lng: -98.5795 },
  zoom: 4,
  mapId: "YOUR_CUSTOM_MAP_ID_HERE", // Replace with your Map ID
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
});
```

#### Method 2: Using JSON Styles

If you prefer JSON styling without creating a Map ID:

```tsx
map.current = new window.google.maps.Map(mapContainer.current, {
  center: { lat: 39.8283, lng: -98.5795 },
  zoom: 4,
  styles: YOUR_JSON_STYLES_HERE, // Add your JSON array here
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
});
```

**Note**: When using JSON styles, you may need to remove or change the `mapId` property as it can conflict with custom styles.

### 4. Useful Resources

- **Snazzy Maps**: [snazzymaps.com](https://snazzymaps.com/) - Free map style gallery
- **Google Maps Styling Wizard**: [mapstyle.withgoogle.com](https://mapstyle.withgoogle.com/)
- **Style Reference**: [developers.google.com/maps/documentation/javascript/style-reference](https://developers.google.com/maps/documentation/javascript/style-reference)

### 5. Common Customizations

#### Hide Points of Interest (POI)

```json
[
  {
    "featureType": "poi",
    "stylers": [{ "visibility": "off" }]
  }
]
```

#### Simplify Labels

```json
[
  {
    "featureType": "administrative",
    "elementType": "labels",
    "stylers": [{ "visibility": "simplified" }]
  }
]
```

#### Emphasize Roads

```json
[
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }, { "weight": 2 }]
  }
]
```

## Testing Your Custom Style

1. Update the `mapId` in `components/google-gsa-map.tsx`
2. Restart your development server: `npm run dev`
3. Navigate to your opportunities page
4. The map should now use your custom styling

## Best Practices

1. **Keep it readable**: Ensure text labels are visible against your background colors
2. **Test with markers**: Make sure your custom markers (blue circles) stand out
3. **Consider accessibility**: Maintain sufficient color contrast
4. **Brand alignment**: Match your company's color scheme if applicable
5. **Performance**: Avoid overly complex styles that might slow down rendering

## Reverting to Default

To revert to the default Google Maps style, simply use:

```tsx
mapId: undefined,
styles: undefined,
```

Or remove these properties entirely from the map configuration.
