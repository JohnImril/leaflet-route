# Leaflet Route

[githubPages](https://johnimril.github.io/leaflet-route/)

## Description

This project demonstrates the use of the Leaflet library with React to display moving markers (trucks) on a map with routes. Routes can either be randomly generated.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/JohnImril/leaflet-route.git
    cd leaflet-route
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

## Usage

1. Start the project:
    ```bash
    npm start
    ```

## Project Structure

-   `public/` - contains static files
-   `src/`
    -   `components/`
        -   `ForestryMap.tsx` - main map component
        -   `MovingIcon.tsx` - component for displaying a moving marker
    -   `images/` - contains images, such as truck icons
    -   `types/` - contains TypeScript types
    -   `utils.ts` - utilities for generating routes
    -   `App.tsx` - main application component
    -   `index.tsx` - application entry point

## Example Usage

### Generating Routes

The `generateRoutes` function generates routes radiating out from a starting point. Each route has random changes in direction and speed to create realistic movement.

### Displaying the Map

The `MapComponent` displays the map with markers and routes. Markers move along the routes, and hovering over a route line changes its opacity.

## License

This project is licensed under the terms of the [MIT License](LICENSE).
