# Online Geopolitical Simulator

A simple geopolitical simulator designed to simulate basic country conflicts using a node-based system. Each country is represented by groups of nodes that are randomly generated containing country data.

You can view the simulation [here](https://jagger-harris.github.io/online-geopolitical-simulator/).

This uses the p5.js library for graphics as well as other helper libraries ([Earcut.js](https://github.com/mapbox/earcut)).

Requires git for testing.

## Testing Environment
* OS: Arch Linux

## Dependencies
* None

## Getting and Running

```shell
git clone https://github.com/jagger-harris/online-geopolitical-simulator.git
```

### Option 1: Open Directly (Simplified Mode)
Open `index.html` directly in your browser. 
**Note:** This will use sample data due to CORS restrictions on local file access.

### Option 2: Run with Node.js HTTP Server (Full Functionality)
To access the complete simulation with all country data, use a local HTTP server to avoid CORS issues:

```shell
# Install http-server globally (if not already installed)
npm install -g http-server

# Navigate to the project directory
cd online-geopolitical-simulator

# Start the server
http-server -p 8000
```

Then open `http://localhost:8000` in your browser.

### Option 3: Run with Python HTTP Server (Alternative)

```shell
# For Python 3
python -m http.server 8000

# For Python 2
python -m SimpleHTTPServer 8000
```

Then open `http://localhost:8000` in your browser.

### Option 4: VS Code Live Server
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html` in the Explorer
3. Select "Open with Live Server"
4. The application will open at `http://127.0.0.1:5500`

## Contributing
This is a personal and capstone project. Contributions will not be accepted.

## License
[ISC](https://choosealicense.com/licenses/isc/)
