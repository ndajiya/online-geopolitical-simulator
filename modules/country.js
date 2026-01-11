/**
 * @class Alliance representing a country in the simulation.
 * 
 * Used to store country variables and country nodes for the simulation.
 */
class Country {
  /**
   * Creates an instance of a country.
   * 
   * @param {JSON} data JSON data of a country.
   */
 // In modules/country.js
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.vertices = data.vertices;
    this.selected = false;
    this.nodeAmount = 0;
    this.nodes = [];
    this.capturedNodes = [];
    this.population = data.population;
    this.activeMilitary = data.activeMilitary;
    this.reserveMilitary = data.reserveMilitary;
    this.fertilityRate = data.fertilityRate;
    this.mortalityMaleAdults = data.mortalityMaleAdults;
    this.mortalityFemaleAdults = data.mortalityFemaleAdults;
    this.lifespan = data.lifespan;
    this.democracyIndex = data.democracyIndex;
    this.gdp = data.gdp;
    this.nuclearWeapons = data.nuclearWeapons;
    
    // Initialize geoeconomics properties
    this.geoeconomics = {
      trade: {
        tariffs: new Map(),
        tradeElasticity: Math.random() * 2 + 0.5,
        dependencyScores: new Map(),
        tradeVolume: Math.random() * 1000 + 100
      },
      finance: {
        currencyRegime: "managed",
        fxReserves: this.gdp * 0.1,
        confidenceIndex: Math.random() * 100,
        debtLevel: Math.random() * 200
      },
      resources: {
        criticalMinerals: new Set(['lithium', 'cobalt', 'nickel']),
        seasonalVulnerability: Math.random(),
        resourceProduction: Math.random() * 100
      },
      technology: {
        chokepointDependence: new Map(),
        techExports: Math.random() * 500,
        innovationIndex: Math.random() * 100
      },
      narrative: {
        mediaInfluence: Math.random() * 100,
        softPower: Math.random() * 100
      },
      legal: {
        regulatoryCapacity: Math.random() * 100,
        disputeSettlement: Math.random() * 100
      },
      coalition: {
        allianceCohesion: Math.random(),
        coordinatedSanctions: new Set(),
        coalitionMembers: new Set()
      },
      marketAccess: {
        tariffBarriers: Math.random() * 50,
        nonTariffBarriers: Math.random() * 50
      },
      supplyChain: {
        criticalNodes: Math.random() * 20,
        diversification: Math.random() * 100
      },
      energy: {
        energyIndependence: Math.random() * 100,
        renewableShare: Math.random() * 100
      },
      digitalInfrastructure: {
        cyberSecurity: Math.random() * 100,
        internetPenetration: Math.random() * 100
      }
    };
  }

  /**
   * Update country and country node information based on statistics.
   */
  update() {
    let totalPopulation = 0;
    let totalActiveMilitary = 0;
    let totalReserveMilitary = 0;
    let totalFertilityRate = 0;
    let totalMortalityMaleAdults = 0;
    let totalMortalityFemaleAdults = 0;
    let totalLifespan = 0;
    let totalDemocracyIndex = 0;
    let totalGdp = 0;
    let totalNuclearWeapons = 0;

    this.nodes.forEach(node => {
      /* Grow population statistically */
      let averageWomenPopulation = Math.floor(node.population * 0.5);
      let percentageChance = (node.fertilityRate / (8766 * node.lifespan)) * averageWomenPopulation;
      let random = Math.random();

      if (random < percentageChance) {
        if (percentageChance < 1) {
          node.population += 1;
        }

        node.population += Math.round(percentageChance);
      }

      /* Decay population statistically */
      let averageMaleDeaths = (node.mortalityMaleAdults / 2000) * (node.population * 0.5) / 8766;
      let averageFemaleDeaths = (node.mortalityFemaleAdults / 2000) * (node.population * 0.5) / 8766;
      random = Math.random();

      if (random < node.mortalityMaleAdults / 2000) {
        node.population -= Math.round(averageMaleDeaths);
      }

      random = Math.random();

      if (random < node.mortalityFemaleAdults / 2000) {
        node.population -= Math.round(averageFemaleDeaths);
      }

      totalPopulation += node.population;
      totalActiveMilitary += node.activeMilitary;
      totalReserveMilitary += node.reserveMilitary;
      totalFertilityRate += node.fertilityRate;
      totalMortalityMaleAdults += node.mortalityMaleAdults;
      totalMortalityFemaleAdults += node.mortalityFemaleAdults;
      totalLifespan += node.lifespan;
      totalDemocracyIndex += node.democracyIndex;
      totalGdp += node.gdp;
      totalNuclearWeapons += node.nuclearWeapons;
    });

    this.population = totalPopulation;
    this.activeMilitary = totalActiveMilitary;
    this.reserveMilitary = totalReserveMilitary;
    this.fertilityRate = totalFertilityRate / this.nodeAmount;
    this.mortalityMaleAdults = totalMortalityMaleAdults / this.nodeAmount;
    this.mortalityFemaleAdults = totalMortalityFemaleAdults / this.nodeAmount;
    this.lifespan = totalLifespan / this.nodeAmount;
    this.democracyIndex = totalDemocracyIndex / this.nodeAmount;
    this.gdp = totalGdp;
    this.nuclearWeapons = totalNuclearWeapons;
  }

  /**
   * Make a country declare war on another country.
   * 
   * @param {Country} country Country to declare war on.
   * @returns A war.
   */
  declareWar(country) {
    let attackers = [this];
    let defenders = [country];
    let attackersLeader = this;
    let defendersLeader = country;
    let attackerAlliances = [];
    let defenderAlliances = []

    simulation.alliances.forEach(alliance => {
      if (alliance.members.includes(this.id)) {
        attackerAlliances.push(alliance);
      }

      if (alliance.members.includes(country.id)) {
        defenderAlliances.push(alliance);
      }
    })

    attackerAlliances.forEach(alliance => {
      alliance.members.forEach(memberID => {
        let country = simulation.countries.get(memberID);

        if (country) {
          attackers.push(country);

          if (country.gdp > attackersLeader.gdp) {
            attackersLeader = country;
          }
        }
      });
    });

    defenderAlliances.forEach(alliance => {
      alliance.members.forEach(memberID => {
        let country = simulation.countries.get(memberID);

        if (country) {
          defenders.push(country);

          if (country.gdp > defendersLeader.gdp) {
            defendersLeader = country;
          }
        }
      });
    });

    return new War(attackers, defenders, attackersLeader, defendersLeader);
  }

  /**
   * Assess dependency of target country
   * @param {Country} targetCountry - Country to assess
   * @returns {Object} Dependency assessment
   */
  assessDependency(targetCountry) {
    // Existing dependency score (from trade)
    const existing = this.geoeconomics?.trade?.dependencyScores?.get(targetCountry.id) || 0;
    
    // Manufacturable dependency (based on resource and tech access)
    const resourceDependence = targetCountry?.geoeconomics?.resources?.seasonalVulnerability || 0;
    const chokepointDependenceValues = Array.from(targetCountry?.geoeconomics?.technology?.chokepointDependence?.values() || [0]);
    const techDependence = chokepointDependenceValues.length > 0 
      ? chokepointDependenceValues.reduce((sum, dep) => sum + dep, 0) / chokepointDependenceValues.length 
      : 0;
    const manufacturable = (resourceDependence + techDependence) / 2;
    
    // Structural immunity (based on economic diversity and coalition strength)
    const economicDiversity = 1 - (this.gdp / ((targetCountry.gdp || 1) * 1.5));
    const coalitionStrength = targetCountry?.geoeconomics?.coalition?.allianceCohesion || 0;
    const immunity = Math.min(1.0, Math.max(0, (economicDiversity + coalitionStrength) / 2));
    
    return {
      existing,
      manufacturable,
      immunity,
      vulnerability: Math.max(0, 1 - immunity)
    };
  }

  /**
   * Get letter grade for success score
   * @param {number} total - Total success score
   * @returns {string} Letter grade
   */
  getSuccessGrade(total) {
    if (total >= 90) return "A+";
    if (total >= 80) return "A";
    if (total >= 70) return "B";
    if (total >= 60) return "C";
    if (total >= 50) return "D";
    return "F";
  }
  
  // --------------------------
  // AI BEHAVIOR HEURISTICS
  // --------------------------
  
  /**
   * AI decision-making for geoeconomic actions
   */
  aiMakeGeoeconomicDecision() {
    // Select target country based on threat perception
    const targets = Array.from(simulation.countries.values())
      .filter(country => country.id !== this.id)
      .sort((a, b) => {
        // Prioritize countries with high dependency vulnerability
        const depA = this.assessDependency(a).vulnerability;
        const depB = this.assessDependency(b).vulnerability;
        return depB - depA;
      });
    
    if (targets.length === 0) return;
    
    const target = targets[0];
    
    // Determine conflict type based on current relations
    const conflictType = ["economic", "technological", "political", "hybrid"][Math.floor(Math.random() * 4)];
    
    // Run decision tree
    const decision = this.geoeconomicDecisionTree(target, conflictType);
    
    // Execute the decision if appropriate
    this.executeGeoeconomicAction(decision, target);
  }
  
  /**
   * Execute geoeconomic action based on decision
   * @param {Object} decision - Decision tree result
   * @param {Country} targetCountry - Target country
   */
  executeGeoeconomicAction(decision, targetCountry) {
    const { tool } = decision;
    
    // Map decision tools to actual action methods
    const actionMap = {
      tariff: () => this.imposeTariff(targetCountry, tool.params.sector || "manufacturing", tool.params.rate || 0.15),
      export_control: () => this.restrictResourceExports(targetCountry, tool.params.resource || "rareEarths", tool.params.restriction || 0.5),
      capital_control: () => this.applyFinancialSanction(targetCountry, "capital"),
      investment_screening: () => this.applyFinancialSanction(targetCountry, "bond"),
      coordinated_sanction: () => this.applyFinancialSanction(targetCountry, "payment"),
      export_restriction: () => this.restrictResourceExports(targetCountry, tool.params.resource || "oil", tool.params.restriction || 0.6),
      export_license_restriction: () => this.restrictTechnologyExports(targetCountry, "advanced"),
      subsidy: () => this.subsidizeSector(tool.params.sector || "technology", tool.params.amount || 0.05)
    };
    
    const action = actionMap[tool.specific];
    if (action) {
      const success = action();
      if (success) {
        // Create log message
        const logMessage = `${this.name} applied ${tool.specific} against ${targetCountry.name}: ${decision.rationale}`;
        
        // Log to console
        console.log(logMessage);
        
        // Add to news ticker if addNewsItem function exists (global scope)
        if (typeof addNewsItem === 'function') {
          addNewsItem(logMessage);
        }
      }
    }
  }
  
  // --------------------------
  // GEOECONOMIC ACTION METHODS
  // --------------------------
  
  /**
   * Impose tariffs on a target country
   * @param {Country} targetCountry - Target country
   * @param {string} sector - Economic sector to target
   * @param {number} rate - Tariff rate (0-1)
   * @returns {boolean} Success status
   */
  imposeTariff(targetCountry, sector, rate) {
    if (!this.geoeconomics?.trade?.tariffs) {
      this.geoeconomics.trade.tariffs = new Map();
    }
    
    let sectorTariffs = this.geoeconomics.trade.tariffs.get(sector) || new Map();
    sectorTariffs.set(targetCountry.id, rate);
    this.geoeconomics.trade.tariffs.set(sector, sectorTariffs);
    
    return true;
  }
  
  /**
   * Restrict resource exports to a target country
   * @param {Country} targetCountry - Target country
   * @param {string} resource - Resource to restrict
   * @param {number} restriction - Restriction level (0-1)
   * @returns {boolean} Success status
   */
  restrictResourceExports(targetCountry, resource, restriction) {
    // Simple implementation - in a full version, this would track specific resource restrictions
    return true;
  }
  
  /**
   * Apply financial sanctions to a target country
   * @param {Country} targetCountry - Target country
   * @param {string} type - Sanction type (capital, bond, payment)
   * @returns {boolean} Success status
   */
  applyFinancialSanction(targetCountry, type) {
    if (type === "coordinated") {
      this.geoeconomics.coalition.coordinatedSanctions.add(targetCountry.id);
    }
    return true;
  }
  
  /**
   * Restrict technology exports to a target country
   * @param {Country} targetCountry - Target country
   * @param {string} techLevel - Technology level to restrict
   * @returns {boolean} Success status
   */
  restrictTechnologyExports(targetCountry, techLevel) {
    // Simple implementation - in a full version, this would track specific tech restrictions
    return true;
  }
  
  /**
   * Subsidize a domestic sector
   * @param {string} sector - Sector to subsidize
   * @param {number} amount - Subsidy amount as percentage of GDP
   * @returns {boolean} Success status
   */
  subsidizeSector(sector, amount) {
    // Simple implementation - in a full version, this would track sector subsidies
    return true;
  }
  
  // --------------------------
  // ESCALATION LADDER SYSTEM
  // --------------------------
  
  /**
   * Escalation ladder levels
   */
  escalationLadder = [
    { id: 0, name: "Signaling", description: "Verbal warnings, diplomatic notes, market signals" },
    { id: 1, name: "Targeted Friction", description: "Minor trade barriers, selective regulatory delays" },
    { id: 2, name: "Sectoral Pressure", description: "Sector-specific tariffs, export controls" },
    { id: 3, name: "Systemic Exclusion", description: "Financial sanctions, payment system restrictions" },
    { id: 4, name: "Structural Lock-out", description: "Technology decoupling, supply chain redirection" },
    { id: 5, name: "Freeze & Containment", description: "Total embargo, comprehensive sanctions" }
  ];
  
  /**
   * Get current escalation level with target country
   * @param {Country} targetCountry - Target country
   * @returns {number} Escalation level (0-5)
   */
  getEscalationLevel(targetCountry) {
    // Check existing actions to determine escalation
    const tradeTariffs = this.geoeconomics?.trade?.tariffs;
    let tariffCount = 0;
    
    if (tradeTariffs) {
      tradeTariffs.forEach((sectorMap) => {
        if (sectorMap instanceof Map && sectorMap.has(targetCountry.id)) {
          tariffCount++;
        }
      });
    }
    
    const sanctionCount = this.geoeconomics?.coalition?.coordinatedSanctions?.has(targetCountry.id) ? 1 : 0;
    
    // Simple escalation calculation
    return Math.min(5, Math.floor((tariffCount + sanctionCount * 2) / 2));
  }
  
  /**
   * Check if escalation is allowed
   * @param {number} currentLevel - Current escalation level
   * @param {number} newLevel - Desired escalation level
   * @returns {boolean} Whether escalation is allowed
   */
  isEscalationAllowed(currentLevel, newLevel) {
    // Never skip levels
    if (newLevel > currentLevel + 1) {
      return false;
    }
    
    // Check coalition cohesion for high escalation
    if (newLevel > 2 && this.geoeconomics.coalition.allianceCohesion < 0.6) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Get last used domain with target country
   * @param {Country} targetCountry - Target country
   * @returns {string} Last used domain
   */
  getLastUsedDomain(targetCountry) {
    // In a full implementation, this would track actual domain usage
    // For now, return a random domain except trade
    const domains = ["tech", "finance", "legal", "narrative", "coalition"];
    return domains[Math.floor(Math.random() * domains.length)];
  }

  /**
   * Get total population of a country based on its nodes.
   * 
   * @returns Total amount of population.
   */
  population() {
    let population = 0;

    for (let i = 0; i < this.nodes.length; i++) {
      population += this.nodes[i].population;
    }

    return population;
  }

  /**
   * Get total active military of a country based on its nodes.
   * 
   * @returns Total amount of active military.
   */
  activeMilitary() {
    let activeMilitary = 0;

    this.nodes.forEach(node => {
      if (node.capturer == this) {
        activeMilitary += node.activeMilitary;
      }
    })

    this.capturedNodes.forEach(node => activeMilitary += node.activeMilitary);

    return activeMilitary;
  }

  /**
   * Get total reserve military of a country based on its nodes.
   * 
   * @returns Total amount of reserve military.
   */
  reserveMilitary() {
    let reserveMilitary = 0;

    this.nodes.forEach(node => reserveMilitary += node.reserveMilitary);

    return reserveMilitary;
  }

  /**
   * Get average fertility rate of a country.
   * 
   * @returns Average total fertility rate.
   */
  fertilityRate() {
    let fertilityRate = 0;

    this.nodes.forEach(node => fertilityRate += node.fertilityRate);

    let averageFertilityRate = fertilityRate / this.nodes.length;

    return Math.ceil(averageFertilityRate * 100) / 100;
  }

  /**
   * Get average mortality rate for male adults of a country.
   * 
   * @returns Average total mortality rate for male adults.
   */
  mortalityMaleAdults() {
    let mortalityMaleAdults = 0;

    this.nodes.forEach(node => mortalityMaleAdults += node.mortalityMaleAdults);

    let averageMortalityMaleAdults = mortalityMaleAdults / this.nodes.length;

    return Math.ceil(averageMortalityMaleAdults * 100) / 100;
  }

  /**
   * Get average mortality rate for female adults of a country.
   * 
   * @returns Average total mortality rate for female adults.
   */
  mortalityFemaleAdults() {
    let mortalityFemaleAdults = 0;

    this.nodes.forEach(node => mortalityFemaleAdults += node.mortalityFemaleAdults);

    let averageMortalityFemaleAdults = mortalityFemaleAdults / this.nodes.length;

    return Math.ceil(averageMortalityFemaleAdults * 100) / 100;
  }

  /**
   * Get average lifespan of a country.
   * 
   * @returns Average total lifespan.
   */
  lifespan() {
    let lifespan = 0;

    this.nodes.forEach(node => lifespan += node.lifespan);

    let averageLifespan = lifespan / this.nodes.length;

    return Math.ceil(averageLifespan * 100) / 100;
  }

  /**
   * Draw the country on to the screen.
   */
  draw() {
    if (simulation.selectedCountry == this) {
      fill(100, 100, 255);
    } else {
      if (this.hover()) {
        fill(100);
      } else {
        if (simulation.activeWars.length < 1) {
          fill(0);
        } else {
          simulation.activeWars.forEach(war => {
            let sameSide = false;
            let inWar = false;
            let selectedCountrySameWar = false;
  
            if (war.attackers.includes(this) || war.defenders.includes(this)) {
              inWar = true;
            }
  
            if (war.attackers.includes(simulation.selectedCountry)) {
              selectedCountrySameWar = true;
  
              if (war.attackers.includes(this)) {
                sameSide = true;
              }
            } else if (war.defenders.includes(simulation.selectedCountry)) {
              selectedCountrySameWar = true;
  
              if (war.defenders.includes(this)) {
                sameSide = true;
              }
            }
  
            if (selectedCountrySameWar && inWar) {
              sameSide ? fill(100, 100, 255) : fill(255, 100, 100);
            } else {
              fill(0);
            }
          })
        }
      }
    }

    this.vertices.forEach(vertices => {
      beginShape();

      vertices.forEach(vertice => {
        let x = vertice[0];
        let y = vertice[1];
        let currentVertex = new Point(x, y);
  
        vertex(currentVertex.x, currentVertex.y);
      })

      endShape();
    })

    if (simulation.selectedCountry == this) {
      this.nodes.forEach(node => node.draw());
    }
  }

  /**
   * Checks if the mouse is above a country.
   * 
   * @returns True if mouse is hovering above a country.
   */
  hover() {
    return this.mouseInsideCountry();
  }
  
  /**
   * Checks if mouse is within country vertices.
   * Credits: https://stackoverflow.com/questions/217578/how-can-i-determine-whether-a-2d-point-is-within-a-polygon
   * 
   * @returns True if mouse is inside country vertices.
   */
  mouseInsideCountry() {
    let inside = false;

    this.vertices.forEach(currentVertex => {
      let i;
      let j;
      let x = (mouseX - offset.x) / zoom;
      let y = (mouseY - offset.y) / zoom;
      let point = new Point(x, y);

      for (i = 0, j = currentVertex.length - 1; i < currentVertex.length; j = i++) {
        if (((currentVertex[i][1] > point.y) != (currentVertex[j][1] > point.y)) && (point.x < (currentVertex[j][0] - currentVertex[i][0]) * (point.y - currentVertex[i][1]) / (currentVertex[j][1] - currentVertex[i][1]) + currentVertex[i][0])) {
          inside = !inside;
        }
      }
    })

    return inside;
  }

  /**
   * Generate an array of nodes for a country.
   * 
   * @param {JSON} data JSON data for country.
   * @param {number} amount Amount of nodes to be generated.
   * @returns Array of nodes.
   */
  generateNodes(data, amount) {
    return CountryNode.create(this, data, amount, this.countryTriangles());
  }

  /**
   * Generates the triangulation of a country vertices.
   * 
   * @returns Triangulation of a country in an array.
   */
  countryTriangles() {
    let indices;
    let triangles = [];
    let flattenedData = [];

    this.vertices.forEach(vertices => {
      let flattenedVertices = [];

      for (let i = 0; i < vertices.length; i++) {
        let x = vertices[i][0];
        let y = vertices[i][1];

        flattenedVertices.push(x);
        flattenedVertices.push(y);
      }

      flattenedData.push(flattenedVertices);
    })

    for (let i = 0; i < this.vertices.length; i++) {
      indices = earcut(flattenedData[i]);

      for (let j = 0; j < indices.length; j++) {
        if (j % 3 == 0) {
          let currentVertices = this.vertices[i];
          let x1 = currentVertices[indices[j]][0];
          let y1 = currentVertices[indices[j]][1];
          let x2 = currentVertices[indices[j + 1]][0];
          let y2 = currentVertices[indices[j + 1]][1];
          let x3 = currentVertices[indices[j + 2]][0];
          let y3 = currentVertices[indices[j + 2]][1];
  
          triangles.push(new Triangle(new Point(x1, y1), new Point(x2, y2), new Point(x3, y3)));
        }
      }
    }

    return triangles;
  }

  /**
   * Get the areas of given triangles.
   * 
   * @param {Array.<Point>} trianglePoints Array of triangles to get the areas.
   * @returns An array of areas.
   */
  static getAreas(trianglePoints) {
    let triangleAreas = [];

    /* Calculate area for each triangle to determine ratio for node placement */
    for (let i = 0; i < trianglePoints.length; i++) {
      let pointA = trianglePoints[i].a;
      let pointB = trianglePoints[i].b;
      let pointC = trianglePoints[i].c;
      let lengthA = dist(pointA.x, pointA.y, pointB.x, pointB.y);
      let lengthB = dist(pointC.x, pointC.y, pointB.x, pointB.y);
      let lengthC = dist(pointC.x, pointC.y, pointA.x, pointA.y);;

      /* Heron's formula https://en.wikipedia.org//wiki/Heron's_formula */
      let s = (lengthA + lengthB + lengthC) * 0.5;
      let area = Math.sqrt(s * (s - lengthA) * (s - lengthB) * (s - lengthC));

      triangleAreas.push(area);
    }

    return triangleAreas;
  }

  /**
   * Get area ratios from the total areas.
   * 
   * @param {Array.<number>} triangleAreas Array of areas to determine ratios.
   * @returns Area ratios of triangleAreas.
   */
  static getAreaRatios(triangleAreas) {
    const areaRatios = [];

    /* Add up all areas and determine percentages */
    let totalArea = 0;

    triangleAreas.forEach(triangleArea => totalArea += triangleArea);
    triangleAreas.forEach(triangleArea => areaRatios.push(triangleArea / totalArea));

    return areaRatios;
  }

  /**
   * Calculates geoeconomic power score
   * @returns {number} Geoeconomic power score (0-100)
   */
  calculateGeoeconomicPower() {
    let score = 0;
    
    // Trade power (20% weight)
    const tradeDependencySum = Array.from(this.geoeconomics?.trade?.dependencyScores?.values() || [0])
      .reduce((sum, dep) => sum + dep, 0);
    const tradeScore = tradeDependencySum * 10;
    score += tradeScore * 0.2;
    
    // Financial power (20% weight)
    const confidenceIndex = this.geoeconomics?.finance?.confidenceIndex || 0;
    const fxReserves = this.geoeconomics?.finance?.fxReserves || 0;
    const financeScore = (confidenceIndex * 50) + ((fxReserves / (this.gdp || 1)) * 50);
    score += financeScore * 0.2;
    
    // Technological power (15% weight)
    const innovationIndex = this.geoeconomics?.technology?.innovationIndex || 0;
    const techScore = innovationIndex;
    score += techScore * 0.15;
    
    // Resource power (10% weight)
    const seasonalVulnerability = this.geoeconomics?.resources?.seasonalVulnerability || 0;
    const resourceScore = (1 - seasonalVulnerability) * 100;
    score += resourceScore * 0.1;
    
    // Coalition power (10% weight)
    const allianceCohesion = this.geoeconomics?.coalition?.allianceCohesion || 0;
    const coalitionScore = allianceCohesion * 100;
    score += coalitionScore * 0.1;
    
    // Energy power (10% weight)
    const energyIndependence = this.geoeconomics?.energy?.energyIndependence || 0;
    const energyScore = energyIndependence;
    score += energyScore * 0.1;
    
    // Digital Infrastructure power (10% weight)
    const cyberSecurity = this.geoeconomics?.digitalInfrastructure?.cyberSecurity || 0;
    const digitalScore = cyberSecurity;
    score += digitalScore * 0.1;
    
    // Supply Chain power (5% weight)
    const supplyChainDiversification = this.geoeconomics?.supplyChain?.diversification || 0;
    const supplyChainScore = supplyChainDiversification;
    score += supplyChainScore * 0.05;
    
    // Return the final score, capped at 100
    return Math.min(100, Math.max(0, score));
  }
  
  // --------------------------
  // GEOECONOMIC DECISION TREE
  // --------------------------
  
  /**
   * Geoeconomic decision tree for AI and player guidance
   * @param {Country} targetCountry - Country to analyze
   * @param {string} conflictType - Conflict classification: economic, technological, political, hybrid
   * @returns {Object} Recommended action and rationale
   */
  geoeconomicDecisionTree(targetCountry, conflictType) {
    // Step 1: Threat Classification
    const threat = this.classifyThreat(conflictType);
    
    // Step 2: Dependency Check
    const dependency = this.assessDependency(targetCountry);
    
    // Step 3: Tool Selection (basic implementation)
    const tool = {
      domain: "trade",
      escalation: { level: "signaling", scope: "low", visibility: "deniable" },
      specific: "tariff",
      params: { sector: "manufacturing", rate: 0.1 }
    };
    
    return {
      threat,
      dependency,
      tool,
      rationale: `${this.name} faces a ${threat.urgency} ${threat.type} threat from ${targetCountry.name}. ` +
                `Target vulnerability: ${(dependency.vulnerability * 100).toFixed(0)}%. ` +
                `Selected ${tool.escalation.level} in ${tool.domain} domain using ${tool.specific} tool.`
    };
  }
  
  /**
   * Classify threat type
   * @param {string} conflictType - Initial conflict type
   * @returns {Object} Threat classification with severity
   */
  classifyThreat(conflictType) {
    const types = ["economic", "technological", "political", "hybrid"];
    const severity = Math.random() * 0.7 + 0.3; // 0.3-1.0
    
    return {
      type: types.includes(conflictType) ? conflictType : "hybrid",
      severity,
      urgency: severity > 0.7 ? "high" : severity > 0.5 ? "medium" : "low"
    };
  }
  
  /**
   * Assess dependency of target country
   * @param {Country} targetCountry - Country to assess
   * @returns {Object} Dependency assessment
   */
  assessDependency(targetCountry) {
    // Existing dependency score (from trade)
    const existing = this.geoeconomics?.trade?.dependencyScores?.get(targetCountry.id) || 0;
    
    // Manufacturable dependency (based on resource and tech access)
    const resourceDependence = targetCountry?.geoeconomics?.resources?.seasonalVulnerability || 0;
    const chokepointDependenceValues = Array.from(targetCountry?.geoeconomics?.technology?.chokepointDependence?.values() || [0]);
    const techDependence = chokepointDependenceValues.length > 0 
      ? chokepointDependenceValues.reduce((sum, dep) => sum + dep, 0) / chokepointDependenceValues.length 
      : 0;
    const manufacturable = (resourceDependence + techDependence) / 2;
    
    // Structural immunity (based on economic diversity and coalition strength)
    const economicDiversity = 1 - (this.gdp / ((targetCountry.gdp || 1) * 1.5));
    const coalitionStrength = targetCountry?.geoeconomics?.coalition?.allianceCohesion || 0;
    const immunity = Math.min(1.0, Math.max(0, (economicDiversity + coalitionStrength) / 2));
    
    return {
      existing,
      manufacturable,
      immunity,
      vulnerability: Math.max(0, 1 - immunity)
    };
  }

  /**
   * Get letter grade for success score
   * @param {number} total - Total success score
   * @returns {string} Letter grade
   */
  getSuccessGrade(total) {
    if (total >= 90) return "A+";
    if (total >= 80) return "A";
    if (total >= 70) return "B";
    if (total >= 60) return "C";
    if (total >= 50) return "D";
    return "F";
  }
}