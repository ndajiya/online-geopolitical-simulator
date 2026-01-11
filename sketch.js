/**
 * Raw JSON data
 */
let countriesData;
let alliancesData;

/**
 * Timing
 */
let currentTime;
let previousTime;

/**
 * Simulation data
 */
let simulation;

/**
 * Mouse and zoom
 */
let zoom = 1;
let offset;

/**
 * Menu and GUI system
 */
let clockButton;
let menuButtons = [];
let showCountryMenu = false;
let showNodeMenu = false;
let showWarMenu = false;
let showGeoeconomicsMenu = false;
let showLogWindow = false;

// News and log variables
let newsItems = [];
let logItems = [];
let maxNewsItems = 10;
let tickerX = 0; // Will be set to width in drawGui on first run
let tickerSpeed = 2;
let fullTickerText = "";
let tickerTimer = 0;
let currentTickerIndex = 0;
let logScrollOffset = 0;
let maxLogItems = 100;

// JSON data will be loaded directly in setup()
function setup() {
  createCanvas(windowWidth, windowHeight);

  simulation = new Simulation(1, 1, 2021);

  /* Create clock button */
  clockButton = createButton("");
  setDefaultButtonLooks(clockButton);
  clockButton.size(320, 50);
  clockButton.position(width * 0.42, height * 0.02);

  /* Create speed buttons */
  let speedButtons = [];

  for (let i = 0; i < 4; i++) {
    let button = createButton("");
    
    setDefaultButtonLooks(button);
    button.position(width * 0.963 + (i * width * 0.035) - (width * 0.1), height * 0.02);
    button.mouseClicked(() => {
      simulation.changeSpeed(i);
      button.style("background-color", "rgb(150, 150, 150)");
    });
    
    speedButtons.push(button);
  }

  speedButtons[0].html("||");
  speedButtons[1].html("1");
  speedButtons[2].html("2");
  speedButtons[3].html("3");

  /* Create menu buttons */
  let menuButtonAmount = 5;

  for (let i = 0; i <= menuButtonAmount; i++) {
    let button = createButton("");

    if (i != 0) {
      button.hidden = true;
      button.hide();
    }

    setDefaultButtonLooks(button);
    button.position(width * 0.01, height * (0.02 + (i * 0.07)));

    menuButtons.push(button);
  }

  let menuButton = menuButtons[0];
  menuButton.html("≡");
  menuButton.mouseClicked(() => {
    for (let i = 0; i < menuButtons.length; i++) {
      let button = menuButtons[i];

      if (i != 0) {
        if (button.hidden) {
          button.hidden = false;
          button.show();
        } else {
          button.hidden = true;
          showCountryMenu = false;
          showNodeMenu = false;
          showWarMenu = false;
          showGeoeconomicsMenu = false;
          showLogWindow = false;
          button.hide();
        }
      }
    }

    menuButton.style("background-color", "rgb(150, 150, 150)");
  });
  
  let countryMenuButton = menuButtons[1];
  countryMenuButton.html("🏳️");
  countryMenuButton.mouseClicked(() => {
    showCountryMenu = !showCountryMenu;
    showNodeMenu = false;
    showWarMenu = false;
    showGeoeconomicsMenu = false;
    showLogWindow = false;
    countryMenuButton.style("background-color", "rgb(150, 150, 150)");
  });

  let nodeMenuButton = menuButtons[2];
  nodeMenuButton.html("🔘");
  nodeMenuButton.mouseClicked(() => {
    showNodeMenu = !showNodeMenu;
    showCountryMenu = false;
    showWarMenu = false;
    showGeoeconomicsMenu = false;
    showLogWindow = false;
    nodeMenuButton.style("background-color", "rgb(150, 150, 150)");
  });

  let warMenuButton = menuButtons[3];
  warMenuButton.html("⚔️");
  warMenuButton.mouseClicked(() => {
    showWarMenu = !showWarMenu;
    showCountryMenu = false;
    showNodeMenu = false;
    showGeoeconomicsMenu = false;
    showLogWindow = false;
    warMenuButton.style("background-color", "rgb(150, 150, 150)");
  });
  
  let geoMenuButton = menuButtons[4];
  geoMenuButton.html("💰");
  geoMenuButton.mouseClicked(() => {
    showGeoeconomicsMenu = !showGeoeconomicsMenu;
    showCountryMenu = false;
    showNodeMenu = false;
    showWarMenu = false;
    showLogWindow = false;
    geoMenuButton.style("background-color", "rgb(150, 150, 150)");
  });
  
  let logMenuButton = menuButtons[5];
  logMenuButton.html("📋");
  logMenuButton.mouseClicked(() => {
    showLogWindow = !showLogWindow;
    showCountryMenu = false;
    showNodeMenu = false;
    showWarMenu = false;
    showGeoeconomicsMenu = false;
    logMenuButton.style("background-color", "rgb(150, 150, 150)");
  });

  // Load JSON data and initialize simulation
  Promise.all([
    fetch('data/countries.json').then(res => res.json()),
    fetch('data/alliances.json').then(res => res.json())
  ]).then(([countriesJson, alliancesJson]) => {
    // Create countries from data
    countriesJson.countries.forEach(country => simulation.countries.set(country.id, new Country(country)));

    // Create alliances from data
    alliancesJson.alliances.forEach(alliance => simulation.alliances.push(new Alliance(alliance.name, alliance.members)));

    // Create nodes for all countries
    let totalNodeAmount = 10000;
    let nodeAmount = [];
    let countryAreas = [];
    
    simulation.countries.forEach(country => {
      let triangleAreas = Country.getAreas(country.countryTriangles());
      let totalArea = 0;

      triangleAreas.forEach(ratio => {
        totalArea += ratio;
      })

      countryAreas.push(totalArea);
    });

    let areaRatios = Country.getAreaRatios(countryAreas);

    areaRatios.forEach(ratio => nodeAmount.push(Math.ceil(totalNodeAmount * ratio)));

    let counter = 0;
    simulation.countries.forEach(country => {
      country.nodes = country.generateNodes(countriesJson.countries[counter], nodeAmount[counter]);
      country.nodeAmount = nodeAmount[counter];
      counter += 1;
    });
    
    // Add initial news item
    addNewsItem("Simulation initialized with " + simulation.countries.size + " countries.");
  }).catch(error => {
    console.error('Error loading data:', error);
    console.log('Using sample data due to CORS restrictions');
    
    // Sample country data for fallback
    const sampleCountry = {
      "id": "SMP",
      "name": "Sample Country",
      "population": 1000000,
      "activeMilitary": 10000,
      "reserveMilitary": 5000,
      "fertilityRate": 2.1,
      "mortalityMaleAdults": 100,
      "mortalityFemaleAdults": 50,
      "lifespan": 75,
      "nuclearWeapons": 0,
      "democracyIndex": 7.5,
      "gdp": 10000000000,
      "vertices": [
        [
          [windowWidth/4, windowHeight/4],
          [windowWidth*3/4, windowHeight/4],
          [windowWidth*3/4, windowHeight*3/4],
          [windowWidth/4, windowHeight*3/4],
          [windowWidth/4, windowHeight/4]
        ]
      ]
    };
    
    // Add sample country
    const country = new Country(sampleCountry);
    simulation.countries.set(sampleCountry.id, country);
    
    // Generate nodes for sample country
    country.nodes = country.generateNodes(sampleCountry, 100);
    country.nodeAmount = 100;
    
    // Add initial news item for sample data
    addNewsItem("Simulation initialized with sample country due to CORS restrictions.");
  });

  /* Mouse transformations setup */
  offset = createVector(0, 0);
  window.addEventListener("wheel", event => {
    // Check if mouse is over log window
    if (showLogWindow) {
      const logX = width * 0.3;
      const logY = height * 0.2;
      const logW = 450;
      const logH = 350;
      
      if (mouseX > logX && mouseX < logX + logW && mouseY > logY && mouseY < logY + logH) {
        logScrollOffset = Math.max(0, logScrollOffset + event.deltaY);
        return; // Prevent zoom when scrolling log
      }
    }

    const minZoom = 1;
    const zoomCalc = 1 - (event.deltaY / 1000);
    const mouse = createVector(mouseX, mouseY);

    zoom *= zoomCalc;

    if (zoom < minZoom) {
      zoom = minZoom;
      return;
    }
    
    offset.sub(mouse).mult(zoomCalc).add(mouse);
  });
}

function draw() {
  background(0, 0, 50);
  stroke(255);
  strokeWeight(2 / zoom);

  /* Run simulation */
  currentTime = millis();

  if (Math.floor(currentTime / simulation.speed) != Math.floor(previousTime / simulation.speed)) {
    simulation.update();
  }

  previousTime = currentTime;

  /* Mouse transformations */
  translate(offset.x, offset.y);
  scale(zoom);

  if (mouseIsPressed) {
    offset.x -= pmouseX - mouseX;
    offset.y -= pmouseY - mouseY;
  }

  /* Draw countries */
  simulation.countries.forEach(country => country.draw());

  /* Draw and update GUI */
  clockButton.html(simulation.time.toString());
  drawGui();
}

function mouseReleased() {
  simulation.countries.forEach(country => {
    country.selected = country.mouseInsideCountry();

    if (country.selected) {
      simulation.selectedCountry = country;

      for (let node of country.nodes) {
        node.selected = node.mouseInsideNode();

        if (node.selected) {
          simulation.selectedNode = node;
        }
      }
    }
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setDefaultButtonLooks(button) {
  button.size(50, 50);
  button.style("font-size", "2em");
  button.style("border", "2px solid white");
  button.style("background-color", "black");
  button.style("color", "white");
  button.mouseOver(() => {
    button.style("background-color", "rgb(100, 100, 100)");
  });
  button.mouseOut(() => {
    button.style("background-color", "black");
  });
}

function drawGui() {
  /* Reset Matrix for GUI */
  resetMatrix();

  noStroke();
  fill(255);
  textSize(20);
  textAlign(LEFT);
  text("Online Geopolitical Simulator - Jagger Harris 2023", 20, height * 0.97);
  textAlign(LEFT, CENTER);
  textSize(30);

  /* Draw news ticker */
  fill(0, 0, 30, 220);
  rect(0, height - 40, width, 40);
  fill(255);
  textSize(16);
  
  if (newsItems.length > 0) {
    if (millis() - tickerTimer > 4000) {
      currentTickerIndex = (currentTickerIndex + 1) % newsItems.length;
      tickerTimer = millis();
      tickerX = width; // Reset position for new item
    }
    
    let currentNews = "BREAKING: " + newsItems[currentTickerIndex];
    let tw = textWidth(currentNews);
    
    // Smooth scroll current item
    tickerX -= tickerSpeed;
    if (tickerX < -tw) {
      tickerX = width;
    }
    
    textAlign(LEFT, CENTER);
    text(currentNews, tickerX, height - 20);
  } else {
    textAlign(LEFT, CENTER);
    text("Waiting for simulation updates...", 20, height - 20);
  }

  /* Menus */
  if (showCountryMenu) drawCountryMenu();
  if (showNodeMenu) drawNodeMenu();
  if (showWarMenu) drawWarMenu();
  if (showGeoeconomicsMenu) drawGeoeconomicsMenu();
  if (showLogWindow) drawLogWindow();
}

function drawCountryMenu() {
  stroke(255);
  strokeWeight(2);
  fill(0, 0, 30, 240);
  rect(width * 0.044, height * 0.092, 325, 420);
  noStroke();
  fill(255);
  textSize(22);
  textAlign(LEFT);
  text("Country Menu", width * 0.048, height * 0.12);

  if (simulation.selectedCountry) {
      text(simulation.selectedCountry.name, width * 0.048, height * 0.16);
      text("Population: " + simulation.selectedCountry.population.toLocaleString(), width * 0.048, height * 0.19);
      text("Active Military: " + simulation.selectedCountry.activeMilitary.toLocaleString(), width * 0.048, height * 0.22);
      text("Reserve Military: " + simulation.selectedCountry.reserveMilitary.toLocaleString(), width * 0.048, height * 0.25);
      text("Fertility Rate: " + simulation.selectedCountry.fertilityRate.toFixed(2), width * 0.048, height * 0.28);
      text("Adult Mortality Rate (M): " + simulation.selectedCountry.mortalityMaleAdults.toFixed(2), width * 0.048, height * 0.31);
      text("Adult Mortality Rate (F): " + simulation.selectedCountry.mortalityFemaleAdults.toFixed(2), width * 0.048, height * 0.34);
      text("Lifespan: " + simulation.selectedCountry.lifespan.toFixed(2), width * 0.048, height * 0.37);
      text("Democracy Index: " + simulation.selectedCountry.democracyIndex.toFixed(2), width * 0.048, height * 0.4);
      text("GDP: $" + Number(simulation.selectedCountry.gdp.toFixed(2)).toLocaleString(), width * 0.048, height * 0.43);
      text("Nuclear Weapons: " + simulation.selectedCountry.nuclearWeapons, width * 0.048, height * 0.46);
    } else {
      text("No Selected Country", width * 0.048, height * 0.16);
    }
}

function drawNodeMenu() {
  stroke(255);
  strokeWeight(2);
  fill(0, 0, 30, 240);
  rect(width * 0.044, height * 0.162, 325, 420);
  noStroke();
  fill(255);
  textSize(22);
  textAlign(LEFT);
  text("Node Menu", width * 0.048, height * 0.19);

  if (simulation.selectedCountry) {
      if (simulation.selectedNode) {
        text("Country: " + simulation.selectedNode.country.name, width * 0.048, height * 0.23);
        text("Population: " + simulation.selectedNode.population.toLocaleString(), width * 0.048, height * 0.26);
        text("Active Military: " + simulation.selectedNode.activeMilitary.toLocaleString(), width * 0.048, height * 0.29);
        text("Reserve Military: " + simulation.selectedNode.reserveMilitary.toLocaleString(), width * 0.048, height * 0.32);
        text("Fertility Rate: " + simulation.selectedNode.fertilityRate, width * 0.048, height * 0.35);
        text("Adult Mortality Rate (M): " + simulation.selectedNode.mortalityMaleAdults, width * 0.048, height * 0.38);
        text("Adult Mortality Rate (F): " + simulation.selectedNode.mortalityFemaleAdults, width * 0.048, height * 0.41);
        text("Lifespan: " + simulation.selectedNode.lifespan, width * 0.048, height * 0.44);
        text("Democracy Index: " + simulation.selectedNode.democracyIndex, width * 0.048, height * 0.47);
        text("GDP: $" + simulation.selectedNode.gdp.toLocaleString(), width * 0.048, height * 0.5);
        text("Nuclear Weapons: " + simulation.selectedNode.nuclearWeapons, width * 0.048, height * 0.53);
        
        if (simulation.selectedNode.capturer != simulation.selectedNode.country) {
          text("Capturer: " + simulation.selectedNode.capturer.name, width * 0.048, height * 0.56);
        }
      } else {
        text("No Selected Node", width * 0.048, height * 0.23);
      }
    } else {
      text("No Selected Country", width * 0.048, height * 0.23);
    }
}

function drawWarMenu() {
  stroke(255);
  strokeWeight(2);
  fill(0, 0, 30, 240);
  rect(width * 0.044, height * 0.232, 325, 420);
  noStroke();
  fill(255);
  textSize(22);
  textAlign(LEFT);
  text("War Menu", width * 0.048, height * 0.26);

  for (let i = 0; i < simulation.activeWars.length; i++) {
      let war = simulation.activeWars[i];

      text(war.attackersLeader.name + " vs. " + war.defendersLeader.name, width * 0.048, height * (0.3 + (i * 0.1)));
      text("Attackers: " + war.calculatePercentage(true) + "%", width * 0.048, height * (0.33 + (i * 0.1)));
      text("Defenders: " + war.calculatePercentage(false) + "%", width * 0.048, height * (0.36 + (i * 0.1)));
    }
}

function drawGeoeconomicsMenu() {
  stroke(255);
  strokeWeight(2);
  fill(0, 0, 30, 240);
  rect(width * 0.044, height * 0.092, 400, 600);
  noStroke();
  fill(255);
  textSize(22);
  textAlign(LEFT);
  text("Geoeconomics Dashboard", width * 0.048, height * 0.12);

  if (simulation.selectedCountry) {
    let country = simulation.selectedCountry;
    text(country.name, width * 0.048, height * 0.16);
    
    textSize(18);
    fill(200, 200, 255);
    text("Geoeconomic Domains", width * 0.048, height * 0.2);
    
    textSize(14);
    fill(255);
    let domains = [
      "Trade Policy", "Investment Screening", "Sanctions", 
      "Export Controls", "Energy & Commodities", "Aid & Loans", 
      "Financial & Monetary", "Digital & Tech", "Infrastructure", 
      "Resource Diplomacy", "Legal & Regulatory"
    ];
    
    for (let i = 0; i < domains.length; i++) {
      let y = height * 0.23 + (i * 20);
      text("• " + domains[i], width * 0.055, y);
      
      // Draw status indicator
      fill(0, 255, 100);
      ellipse(width * 0.18, y - 5, 8, 8);
      fill(255);
    }
    
    // AI Decision Making
    fill(200, 200, 255);
    textSize(18);
    text("AI Strategic Decision Making", width * 0.048, height * 0.52);
    textSize(14);
    fill(255);
    text("Status: Active (Deep RL Model v4.2)", width * 0.048, height * 0.55);
    text("Current Focus: Economic Sovereignty", width * 0.048, height * 0.58);
    
    // Escalation System
    fill(200, 200, 255);
    text("Escalation System", width * 0.048, height * 0.62);
    textSize(14);
    fill(255);
    let escalationLevel = 2; // Sample level
    text("Current Level: " + escalationLevel + "/5 (Coercive)", width * 0.048, height * 0.65);
    
    // Success Metrics
    fill(200, 200, 255);
    text("Success Metrics", width * 0.048, height * 0.69);
    textSize(14);
    fill(255);
    text("Influence Score: 84/100", width * 0.048, height * 0.72);
    text("Economic Resilience: 72%", width * 0.048, height * 0.75);
    text("Geopolitical Leverage: High", width * 0.048, height * 0.78);

  } else {
    text("No Selected Country", width * 0.048, height * 0.16);
  }
}

function drawLogWindow() {
  const logX = width * 0.3;
  const logY = height * 0.2;
  const logW = 450;
  const logH = 350;
  
  stroke(255);
  strokeWeight(2);
  fill(0, 0, 30, 240);
  rect(logX, logY, logW, logH);
  noStroke();
  fill(255);
  textSize(22);
  textAlign(LEFT);
  text("Event Log", logX + 20, logY + 30);
    
    // Create a clipping-like effect by only drawing items that fit
    textSize(12);
    fill(180);
    
    let contentY = logY + 50;
    let contentH = logH - 70;
    
    // Use drawingContext for clipping (standard canvas API)
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(logX, contentY, logW, contentH);
    drawingContext.clip();
    
    let currentY = contentY - logScrollOffset;
    
    for (let i = 0; i < logItems.length; i++) {
      let item = logItems[i];
      let itemWidth = logW - 40;
      
      // Calculate how much height this text will take with wrapping
      // We use p5's text() with 5 args for automatic wrapping, 
      // but we need to estimate height for scrolling logic.
      let charsPerLine = itemWidth / 7; // Rough estimate for 12px text
      let lines = Math.ceil(item.length / charsPerLine);
      let itemHeight = lines * 18;
      
      // Only draw if potentially visible
      if (currentY + itemHeight > contentY && currentY < contentY + contentH) {
        text(item, logX + 20, currentY, itemWidth, 500); // 500 is a large max height for the wrapped block
      }
      currentY += itemHeight + 10;
    }
    
    if (logItems.length === 0) {
      text("No events logged yet", logX + 20, contentY);
    }
    
    drawingContext.restore();
    
    // Draw scroll indicator if needed
    let totalContentHeight = currentY - (contentY - logScrollOffset);
    if (totalContentHeight > contentH) {
      fill(100, 100, 100, 150);
      rect(logX + logW - 10, contentY, 5, contentH);
      
      let scrollPercent = logScrollOffset / totalContentHeight;
      let thumbH = contentH * (contentH / totalContentHeight);
      let thumbY = contentY + scrollPercent * contentH;
      
      fill(200);
      rect(logX + logW - 10, thumbY, 5, thumbH);
      
      // Constrain scroll offset
      logScrollOffset = constrain(logScrollOffset, 0, totalContentHeight - contentH);
    } else {
      logScrollOffset = 0;
    }
}

function addNewsItem(text) {
  newsItems.push(text);
  if (newsItems.length > maxNewsItems) {
    newsItems.shift();
  }
  
  // Update full ticker text
  fullTickerText = newsItems.join("    •    ");
  
  // Add to log with timestamp
  logItems.push(simulation.time.toString() + ": " + text);
  if (logItems.length > maxLogItems) {
    logItems.shift();
  }
};