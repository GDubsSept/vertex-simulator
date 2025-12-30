const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());
// Serve static React build
app.use(express.static(path.join(__dirname, 'client/build')));
// Initialize Anthropic (keeping for reference)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});
// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' });

// ============================================================
// COMPREHENSIVE SCENARIO CONTEXT FOR GEMINI
// ============================================================
const SCENARIO_CONTEXT = `
## VERTEX PHARMACEUTICALS - COMPANY OVERVIEW

Vertex Pharmaceuticals is a global biotechnology company headquartered in Boston, Massachusetts. The company focuses on developing medicines for serious diseases including cystic fibrosis, sickle cell disease, and acute pain.

### THREE SUPPLY CHAIN MODELS

**1. SMALL MOLECULE - Cystic Fibrosis (Trikafta/Kaftrio)**
- Product: Trikafta (US) / Kaftrio (EU) - oral tablets
- Manufacturing: Continuous Manufacturing at Boston Seaport facility
- Storage: Room temperature (15-25°C), 36-month shelf life
- Distribution: Traditional wholesale/retail pharmacy
- Key Technology: PAT (Process Analytical Technology) sensors for real-time quality
- Volume: High volume, steady demand (~90,000 patients in US)
- Key Metrics: OEE, batch cycle time, API purity, fill rate

**2. CELL & GENE THERAPY - Sickle Cell Disease (Casgevy)**
- Product: Casgevy (exagamglogene autotemcel) - one-time gene therapy
- Manufacturing: Autologous (patient's own cells) at CDMO partners (Lonza)
- Storage: Cryopreserved at -150°C in liquid nitrogen vapor phase
- Distribution: Vein-to-vein supply chain (patient → manufacturing → patient)
- Critical Requirements:
  - Chain of Identity (COI): Permanent link ensuring product matches specific patient
  - Chain of Custody (COC): Temperature and handling documentation
  - Cryo Hold Time: Typically 4-6 hours out of cryo storage before viability risk
  - Manufacturing Time: 16-20 weeks from apheresis to infusion-ready product
- Volume: Low volume, high complexity (~100,000 eligible patients, ~50-100 treatments/year currently)
- Key Metrics: Cell viability, COI compliance, vein-to-vein time, on-time delivery

**3. ACUTE PAIN LAUNCH - Suzetrigine (VX-548)**
- Product: Suzetrigine - oral tablets for acute pain (non-opioid)
- Manufacturing: Traditional batch manufacturing, transitioning to continuous
- Storage: Room temperature (15-25°C)
- Distribution: High-volume retail pharmacy launch (CVS, Walgreens, hospitals)
- Launch Phase: New product launch requiring demand sensing and rapid scaling
- Volume: Very high potential volume (millions of acute pain episodes annually)
- Key Metrics: Stockout rate, fill rate, demand forecast accuracy, shelf availability

---

## GEOGRAPHIC REFERENCE DATA

### Major US Airports for Pharma Logistics
| Code | City | State | Hub Type |
|------|------|-------|----------|
| BOS | Boston | MA | Vertex HQ, CGT destination |
| ORD | Chicago | IL | Major hub, weather delays common |
| ATL | Atlanta | GA | Southeast hub |
| DFW | Dallas/Fort Worth | TX | Southwest hub |
| DEN | Denver | CO | Mountain region hub |
| LAX | Los Angeles | CA | West Coast hub |
| SFO | San Francisco | CA | West Coast secondary |
| MEM | Memphis | TN | FedEx global hub |
| CVG | Cincinnati | KY | DHL Americas hub |
| JFK | New York | NY | International gateway |
| MIA | Miami | FL | Latin America gateway |
| SEA | Seattle | WA | Pacific Northwest |
| PHX | Phoenix | AZ | Southwest secondary |
| MSP | Minneapolis | MN | Upper Midwest |
| DTW | Detroit | MI | Great Lakes region |

### Vertex Distribution Centers
| ID | Location | City | State | Primary Products | Cryo Capable |
|----|----------|------|-------|------------------|--------------|
| BOS-DC | Boston Distribution Center | Boston | MA | All products | Yes (50 slots) |
| MEM-HUB | Memphis Central Hub | Memphis | TN | Trikafta, Suzetrigine | Yes (100 slots) |
| CHI-DC | Chicago Distribution Center | Chicago | IL | All products | Yes (75 slots) |
| ATL-DC | Atlanta Distribution Center | Atlanta | GA | Trikafta, Suzetrigine | Yes (30 slots) |
| DAL-DC | Dallas Distribution Center | Dallas | TX | Trikafta, Suzetrigine | Yes (25 slots) |
| LAX-DC | Los Angeles Distribution Center | Los Angeles | CA | All products | Yes (40 slots) |
| DEN-DC | Denver Distribution Center | Denver | CO | Trikafta, Suzetrigine | No |

### Specialized Cryo Depots (for CGT emergencies)
| ID | Name | City | Nearest Airport | Drive Time from Airport | Available Slots |
|----|------|------|-----------------|------------------------|-----------------|
| BOS-CRYO | Boston Cryo Center | Boston | BOS | 15 min | 25 |
| CHI-CRYO | Chicago Cryo Depot | Elk Grove Village | ORD | 20 min | 28 |
| MKE-CRYO | Milwaukee Cryo Facility | Milwaukee | MKE | 15 min | 15 |
| DEN-CRYO | Denver Cryo Storage | Aurora | DEN | 25 min | 18 |
| ATL-CRYO | Atlanta Cryo Center | College Park | ATL | 12 min | 22 |
| LAX-CRYO | Los Angeles Cryo Depot | El Segundo | LAX | 10 min | 30 |
| DFW-CRYO | Dallas Cryo Facility | Irving | DFW | 18 min | 20 |
| MEM-CRYO | Memphis Cryo Hub | Memphis | MEM | 8 min | 35 |

### US Regions for Demand Planning
| Region | States Included | Major DCs |
|--------|-----------------|-----------|
| NORTHEAST | MA, NY, NJ, PA, CT, RI, NH, VT, ME | BOS-DC |
| SOUTHEAST | FL, GA, NC, SC, VA, TN, AL, MS | ATL-DC |
| MIDWEST | IL, OH, MI, IN, WI, MN, IA, MO | CHI-DC |
| SOUTHWEST | TX, AZ, NM, OK, AR, LA | DAL-DC |
| WEST | CA, WA, OR, NV, CO, UT | LAX-DC, DEN-DC |

---

## OPERATIONAL PARAMETERS

### Cryo Shipper Hold Times
| Shipper Type | Temperature | Max Hold Time | Use Case |
|--------------|-------------|---------------|----------|
| MVE Vapor Shipper | -150°C | 10 days | Long-haul CGT transport |
| Cryoport Express | -150°C | 7 days | Standard CGT transport |
| Emergency Portable | -150°C | 4-6 hours | Ground transport, emergencies |
| Dry Ice Shipper | -78°C | 48-72 hours | Backup, not for CGT |

### Common Delay Causes
| Category | Specific Causes | Typical Duration |
|----------|-----------------|------------------|
| Weather | Ice storm, thunderstorms, fog, snow | 2-12 hours |
| Mechanical | Aircraft maintenance, equipment failure | 1-6 hours |
| Customs | Documentation issues, inspection holds | 4-24 hours |
| Operational | Crew timeout, airport congestion, ground stop | 1-4 hours |
| Security | TSA holds, cargo screening delays | 1-3 hours |

### Inventory Level Ranges (units)
| Product | Small DC | Medium DC | Large Hub |
|---------|----------|-----------|-----------|
| Trikafta | 15,000-35,000 | 35,000-60,000 | 80,000-150,000 |
| Suzetrigine | 10,000-25,000 | 25,000-50,000 | 60,000-100,000 |
| Cryo Slots | 15-30 | 30-50 | 75-100 |

### Demand Forecast Ranges (7-day, units)
| Product | Low Demand | Normal | High/Spike |
|---------|------------|--------|------------|
| Trikafta | 5,000-10,000 | 10,000-20,000 | 20,000-35,000 |
| Suzetrigine | 8,000-15,000 | 15,000-30,000 | 30,000-50,000 |

### Stockout Risk Thresholds
| Risk Level | Inventory vs 7-Day Forecast |
|------------|----------------------------|
| LOW | Inventory > 150% of forecast |
| MEDIUM | Inventory 80-150% of forecast |
| HIGH | Inventory < 80% of forecast |

---

## ROLE DEFINITIONS

### Quality Engineer (Cell & Gene Therapy Focus)
**Responsibilities:**
- Monitor CGT shipments and ensure product integrity
- Verify Chain of Identity compliance
- Manage temperature excursions and cryo emergencies
- Coordinate with treatment centers and patients
- Document all actions for regulatory compliance

**Typical Scenario Types:**
- Flight delays with cryo expiry risk
- Temperature excursion during transport
- COI verification discrepancies
- Cryo depot capacity emergencies
- Patient scheduling conflicts with product availability

### Supply Chain Planner (Commercial Operations Focus)
**Responsibilities:**
- Monitor inventory levels across distribution network
- Respond to demand signals and forecast changes
- Coordinate inter-depot transfers
- Manage product allocation during shortages
- Support new product launches

**Typical Scenario Types:**
- Regional demand spikes causing stockout risk
- Inventory imbalances across network
- Supply disruptions from manufacturing
- New product launch distribution challenges
- Seasonal demand fluctuations

---

## DIFFICULTY CALIBRATION

### BEGINNER
- Single clear issue to address
- Time pressure: 3-4 hours
- 3-4 helpful hints provided
- Clear "right answer" path
- Limited stakeholders involved

### INTERMEDIATE
- 2-3 compounding factors
- Time pressure: 1.5-2.5 hours
- 1-2 subtle hints provided
- Multiple viable approaches
- Cross-functional coordination needed

### EXPERT
- Cascading failures, evolving situation
- Time pressure: 30-90 minutes
- No hints provided
- Competing priorities and trade-offs
- Executive escalation decisions
- Regulatory/compliance implications

---

## REQUIRED OUTPUT SCHEMA

You must generate a complete JSON object with ALL of the following fields. Every field is required.

{
  "alert_title": "string - Compelling 5-10 word title describing the emergency",
  "alert_severity": "CRITICAL | HIGH | MEDIUM",
  "briefing": "string - 3-5 sentence situation briefing. Be specific with flight IDs, times, locations, patient IDs. All details here MUST match the data below.",
  "initial_data": {
    "flight_id": "string or null - Primary flight ID if applicable (e.g., VX-CGT-042)",
    "location": "string - Current location of the issue",
    "time_pressure": "string - How much time before critical deadline (e.g., '2 hours 15 minutes until cryo expiry')",
    "key_metrics": {
      "metric_name": "value - 2-4 relevant metrics"
    }
  },
  "ideal_response_checklist": ["array of 5-8 actions the trainee should take - DO NOT reveal to user"],
  "hints": ["array of 1-4 hints based on difficulty level"],
  "scenario_data": {
    "flights": {
      "FLIGHT-ID": {
        "status": "GROUNDED | DELAYED | IN_TRANSIT | DIVERTED | ARRIVED",
        "location": "Current location (airport name with code)",
        "destination": "Destination (airport name with code)",
        "cargo": "Description of cargo",
        "delay_reason": "Reason if delayed/grounded, null otherwise",
        "patient_id": "Patient ID if CGT shipment, null otherwise",
        "cryo_expiry": null,
        "eta_original": "ISO datetime string",
        "weight_kg": "number if applicable, null otherwise",
        "units": "number if applicable, null otherwise"
      }
    },
    "inventory": {
      "DEPOT-ID": {
        "location": "Full location name",
        "trikafta_units": "number",
        "suzetrigine_units": "number",
        "cryo_capacity": "number",
        "cryo_available": "number"
      }
    },
    "demand": {
      "REGION": {
        "region": "Full region name",
        "suzetrigine_7day_forecast": "number",
        "suzetrigine_current_inventory": "number",
        "stockout_risk": "HIGH | MEDIUM | LOW",
        "trending_states": ["array of state names showing increased demand"]
      }
    },
    "cryo_expiry_minutes": "number - Minutes from now until cryo expiry (for CGT scenarios), null otherwise",
    "cryo_depots": [
      {
        "id": "DEPOT-ID",
        "name": "Full name",
        "distance_miles": "number - distance from incident location",
        "drive_time_minutes": "number",
        "available_slots": "number"
      }
    ]
  }
}

---

## COMPLETE EXAMPLE OUTPUT

Here is a perfect example of what you should generate for a Quality Engineer at INTERMEDIATE difficulty:

{
  "alert_title": "CGT Shipment Grounded - Patient Cells at Risk",
  "alert_severity": "CRITICAL",
  "briefing": "Flight VX-CGT-089 carrying autologous Casgevy cells for Patient PT-4521 has been grounded at Denver International Airport (DEN) due to a severe thunderstorm system. The aircraft was en route from Los Angeles (LAX) to Boston (BOS) for manufacturing. Current cryo shipper readings show -151°C but the portable unit has approximately 2 hours 30 minutes of hold time remaining. Ground transport to the nearest cryo facility must be arranged immediately to preserve cell viability. The patient has been waiting 18 weeks for this treatment.",
  "initial_data": {
    "flight_id": "VX-CGT-089",
    "location": "Denver International Airport (DEN)",
    "time_pressure": "2 hours 30 minutes until cryo expiry",
    "key_metrics": {
      "current_temp": "-151°C",
      "patient_wait_time": "18 weeks",
      "cells_collected": "8.2 × 10⁶ CD34+ cells",
      "nearest_cryo": "25 min drive"
    }
  },
  "ideal_response_checklist": [
    "Immediately contact Denver Cryo Storage (DEN-CRYO) to confirm slot availability",
    "Arrange emergency ground transport with qualified cryo courier",
    "Verify Chain of Identity documentation is complete and accessible",
    "Notify Boston manufacturing site of delay and revised ETA",
    "Contact Patient Coordinator to update PT-4521's care team",
    "Document all actions in QMS with timestamps",
    "Monitor cryo shipper temperature readings every 15 minutes",
    "Prepare contingency for alternative flight routing once weather clears"
  ],
  "hints": [
    "Consider ground transport options to preserve the cells while weather clears",
    "The patient's care team should be kept informed of any delays"
  ],
  "scenario_data": {
    "flights": {
      "VX-CGT-089": {
        "status": "GROUNDED",
        "location": "Denver International Airport (DEN)",
        "destination": "Boston Logan International (BOS)",
        "cargo": "Autologous patient cells - Casgevy therapy",
        "delay_reason": "Severe thunderstorm - ground stop in effect",
        "patient_id": "PT-4521",
        "cryo_expiry": null,
        "eta_original": "2024-03-15T18:30:00Z",
        "weight_kg": null,
        "units": null
      }
    },
    "inventory": {
      "DEN-DC": {
        "location": "Denver Distribution Center",
        "trikafta_units": 28500,
        "suzetrigine_units": 31000,
        "cryo_capacity": 0,
        "cryo_available": 0
      },
      "BOS-DC": {
        "location": "Boston Distribution Center",
        "trikafta_units": 52000,
        "suzetrigine_units": 18000,
        "cryo_capacity": 50,
        "cryo_available": 14
      }
    },
    "demand": {
      "WEST": {
        "region": "West US",
        "suzetrigine_7day_forecast": 22000,
        "suzetrigine_current_inventory": 31000,
        "stockout_risk": "LOW",
        "trending_states": []
      },
      "NORTHEAST": {
        "region": "Northeast US",
        "suzetrigine_7day_forecast": 16000,
        "suzetrigine_current_inventory": 18000,
        "stockout_risk": "MEDIUM",
        "trending_states": ["Massachusetts", "New York"]
      }
    },
    "cryo_expiry_minutes": 150,
    "cryo_depots": [
      {
        "id": "DEN-CRYO",
        "name": "Denver Cryo Storage",
        "distance_miles": 18,
        "drive_time_minutes": 25,
        "available_slots": 18
      },
      {
        "id": "CHI-CRYO",
        "name": "Chicago Cryo Depot",
        "distance_miles": 920,
        "drive_time_minutes": 840,
        "available_slots": 28
      }
    ]
  }
}

---

## CONSISTENCY RULES - CRITICAL

1. **Flight IDs**: Any flight ID mentioned in the briefing MUST appear in scenario_data.flights
2. **Patient IDs**: Any patient ID mentioned MUST appear in the relevant flight's patient_id field
3. **Locations**: All locations mentioned must have corresponding entries in inventory or cryo_depots
4. **Times**: The cryo_expiry_minutes MUST match the time pressure stated in the briefing
5. **Status**: Flight status must match what's described (grounded = GROUNDED, delayed = DELAYED)
6. **Numbers**: All inventory numbers, distances, and times must be realistic per the operational parameters above
7. **Relevance**: Only include flights, depots, and regions that are relevant to THIS scenario - do not pad with unrelated data

---

## GENERATION INSTRUCTIONS

Generate a completely new, unique scenario. Do not reuse the example above. Create fresh:
- Flight IDs (format: VX-CGT-XXX for cell therapy, VX-SM-XXX for small molecule, VX-APL-XXX for acute pain launch)
- Patient IDs (format: PT-XXXX)
- Specific circumstances and complications
- Realistic current-day timing

Respond with ONLY the JSON object. No additional text, no markdown code blocks, just the raw JSON.
`;

// ============================================================
// MOCK DATA - Simulates external systems for agentic tools
// ============================================================
const mockFlightData = {
  'VX-CGT-001': { 
    status: 'GROUNDED', 
    location: 'Chicago O\'Hare (ORD)', 
    destination: 'Boston Logan (BOS)',
    eta_original: '2024-03-15T14:30:00Z',
    delay_reason: 'Severe weather - ice storm',
    cargo: 'Patient cells - Casgevy therapy',
    patient_id: 'PT-7829',
    cryo_expiry: '2024-03-15T18:00:00Z'
  },
  'VX-SM-042': {
    status: 'IN_TRANSIT',
    location: 'Airborne - over Kansas',
    destination: 'Memphis Hub',
    eta_original: '2024-03-15T16:00:00Z',
    cargo: 'Trikafta bulk API',
    weight_kg: 2500
  },
  'VX-APL-108': {
    status: 'DELAYED',
    location: 'Los Angeles (LAX)',
    destination: 'Dallas/Fort Worth (DFW)',
    eta_original: '2024-03-15T12:00:00Z',
    delay_reason: 'Mechanical inspection',
    cargo: 'Suzetrigine finished goods',
    units: 15000
  }
};

const mockInventoryData = {
  'BOS-DC': { 
    location: 'Boston Distribution Center',
    trikafta_units: 45000,
    suzetrigine_units: 12000,
    cryo_capacity: 50,
    cryo_available: 12
  },
  'MEM-HUB': {
    location: 'Memphis Central Hub',
    trikafta_units: 120000,
    suzetrigine_units: 85000,
    cryo_capacity: 100,
    cryo_available: 34
  },
  'CHI-DEPOT': {
    location: 'Chicago Cryo Depot',
    trikafta_units: 8000,
    suzetrigine_units: 5000,
    cryo_capacity: 75,
    cryo_available: 28
  },
  'ATL-DC': {
    location: 'Atlanta Distribution Center',
    trikafta_units: 35000,
    suzetrigine_units: 42000,
    cryo_capacity: 30,
    cryo_available: 8
  },
  'DAL-DC': {
    location: 'Dallas Distribution Center',
    trikafta_units: 28000,
    suzetrigine_units: 38000,
    cryo_capacity: 25,
    cryo_available: 15
  }
};

const mockDemandSignals = {
  'SOUTHEAST': {
    region: 'Southeast US',
    suzetrigine_7day_forecast: 28000,
    suzetrigine_current_inventory: 18000,
    stockout_risk: 'HIGH',
    trending_states: ['Florida', 'Georgia', 'North Carolina']
  },
  'NORTHEAST': {
    region: 'Northeast US',
    suzetrigine_7day_forecast: 15000,
    suzetrigine_current_inventory: 22000,
    stockout_risk: 'LOW',
    trending_states: []
  },
  'MIDWEST': {
    region: 'Midwest US',
    suzetrigine_7day_forecast: 12000,
    suzetrigine_current_inventory: 14000,
    stockout_risk: 'MEDIUM',
    trending_states: ['Illinois', 'Ohio']
  }
};

const mockCryoDepots = [
  { id: 'CHI-CRYO', name: 'Chicago Cryo Depot', distance_from_ord: 12, available_slots: 28, drive_time_minutes: 25 },
  { id: 'MKE-CRYO', name: 'Milwaukee Cryo Facility', distance_from_ord: 85, available_slots: 15, drive_time_minutes: 95 },
  { id: 'IND-CRYO', name: 'Indianapolis Cryo Center', distance_from_ord: 180, available_slots: 42, drive_time_minutes: 185 }
];

// ============================================================
// REAL-TIME DATA TOOLS - For Agentic Scenario Generation
// ============================================================

// City coordinates for weather lookups
const cityCoordinates = {
  'boston': { lat: 42.36, lon: -71.06 },
  'chicago': { lat: 41.88, lon: -87.63 },
  'atlanta': { lat: 33.75, lon: -84.39 },
  'dallas': { lat: 32.78, lon: -96.80 },
  'denver': { lat: 39.74, lon: -104.99 },
  'los angeles': { lat: 34.05, lon: -118.24 },
  'san francisco': { lat: 37.77, lon: -122.42 },
  'memphis': { lat: 35.15, lon: -90.05 },
  'miami': { lat: 25.76, lon: -80.19 },
  'seattle': { lat: 47.61, lon: -122.33 },
  'phoenix': { lat: 33.45, lon: -112.07 },
  'minneapolis': { lat: 44.98, lon: -93.27 },
  'detroit': { lat: 42.33, lon: -83.05 },
  'new york': { lat: 40.71, lon: -74.01 },
  'philadelphia': { lat: 39.95, lon: -75.17 },
  'indianapolis': { lat: 39.77, lon: -86.16 },
  'milwaukee': { lat: 43.04, lon: -87.91 },
  'cincinnati': { lat: 39.10, lon: -84.51 }
};

// Get weather data from OpenWeatherMap
async function getWeather(city) {
  try {
    const cityLower = city.toLowerCase();
    const coords = cityCoordinates[cityLower];
    
    if (!coords) {
      return { success: false, error: `City "${city}" not found in database` };
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'OpenWeatherMap API key not configured' };
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=imperial`
    );

    const data = response.data;
    return {
      success: true,
      data: {
        city: city,
        temperature_f: Math.round(data.main.temp),
        feels_like_f: Math.round(data.main.feels_like),
        conditions: data.weather[0].description,
        wind_mph: Math.round(data.wind.speed),
        humidity: data.main.humidity,
        visibility_miles: Math.round((data.visibility || 10000) / 1609),
        alerts: data.weather[0].main === 'Thunderstorm' || 
                data.weather[0].main === 'Snow' || 
                data.wind.speed > 30 ? 
                `WEATHER ALERT: ${data.weather[0].description}` : null
      }
    };
  } catch (error) {
    console.error('Weather API error:', error.message);
    return { success: false, error: error.message };
  }
}

// Search news using Perplexity
async function searchNews(query) {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'Perplexity API key not configured' };
    }

    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant. Provide concise, factual summaries of recent news. Focus on the last 7 days. Include specific dates, numbers, and names when available. Keep response under 300 words.'
          },
          {
            role: 'user',
            content: `Find recent news about: ${query}. Focus on events from the last week that could impact pharmaceutical supply chains, logistics, or healthcare operations.`
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      data: {
        query: query,
        summary: response.data.choices[0].message.content,
        searched_at: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Perplexity API error:', error.message);
    return { success: false, error: error.message };
  }
}

// Execute real-time tool calls
async function executeRealTimeTool(toolName, args) {
  switch (toolName) {
    case 'get_weather':
      return await getWeather(args.city);
    case 'search_news':
      return await searchNews(args.query);
    default:
      return { success: false, error: `Unknown tool: ${toolName}` };
  }
}

// Gemini tool definitions for real-time data
const realTimeTools = [
  {
    name: 'get_weather',
    description: 'Get current weather conditions for a US city. Use this to create realistic weather-based scenarios. Returns temperature, conditions, wind, and any active weather alerts.',
    parameters: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'City name (e.g., "Chicago", "Boston", "Denver")'
        }
      },
      required: ['city']
    }
  },
  {
    name: 'search_news',
    description: 'Search for recent news on a topic. Use this to find current events that could impact the scenario, such as supply chain disruptions, weather events, regulatory changes, or pharma industry news.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g., "pharmaceutical supply chain disruptions", "Vertex Pharmaceuticals news", "airport delays weather")'
        }
      },
      required: ['query']
    }
  }
];

// Agent loop for real-time data gathering
async function runAgentLoop(basePrompt, role, difficulty) {
  const maxIterations = 5;
  let toolResults = [];
  let iteration = 0;

  // Initial prompt asking Gemini to decide what data it needs
  const planningPrompt = `You are creating a training scenario for a ${role} at ${difficulty} difficulty.

Before generating the scenario, you have access to real-time data tools:
1. get_weather(city) - Get current weather for any major US city
2. search_news(query) - Search recent news for relevant events

Think about what real-time data would make your scenario more realistic and current. You might want to:
- Check weather in cities relevant to your scenario (for weather-related delays)
- Search for recent pharma/supply chain news to incorporate current events
- Look for any recent Vertex Pharmaceuticals news

Decide which tools to call (0-3 calls recommended). Respond with a JSON array of tool calls:
[
  {"tool": "get_weather", "args": {"city": "Chicago"}},
  {"tool": "search_news", "args": {"query": "pharmaceutical supply chain"}}
]

Or respond with [] if you don't need any real-time data for this scenario.

Respond with ONLY the JSON array, no other text.`;

  try {
    // Ask Gemini what tools it wants to use
    const planResponse = await geminiModel.generateContent(planningPrompt);
    let planText = planResponse.response.text().trim();
    
    // Clean up response
    if (planText.startsWith('```json')) planText = planText.slice(7);
    if (planText.startsWith('```')) planText = planText.slice(3);
    if (planText.endsWith('```')) planText = planText.slice(0, -3);
    planText = planText.trim();

    // Parse tool calls
    let toolCalls = [];
    try {
      const jsonMatch = planText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        toolCalls = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.log('No valid tool calls parsed, proceeding without real-time data');
      toolCalls = [];
    }

    // Execute each tool call
    for (const call of toolCalls) {
      if (iteration >= maxIterations) break;
      
      console.log(`Agent calling tool: ${call.tool}`, call.args);
      const result = await executeRealTimeTool(call.tool, call.args);
      toolResults.push({
        tool: call.tool,
        args: call.args,
        result: result
      });
      iteration++;
    }

  } catch (error) {
    console.error('Agent planning error:', error.message);
    // Continue without real-time data
  }

  return toolResults;
}

// ============================================================
// TOOL DEFINITIONS - For Claude's agentic capabilities
// ============================================================
const tools = [
  {
    name: 'check_flight_status',
    description: 'Check the real-time status of a shipment flight. Returns location, delays, cargo details, and ETAs.',
    input_schema: {
      type: 'object',
      properties: {
        flight_id: {
          type: 'string',
          description: 'The flight/shipment ID (e.g., VX-CGT-001)'
        }
      },
      required: ['flight_id']
    }
  },
  {
    name: 'check_inventory_levels',
    description: 'Check inventory levels at a specific distribution center or depot.',
    input_schema: {
      type: 'object',
      properties: {
        location_id: {
          type: 'string',
          description: 'The location ID (e.g., BOS-DC, MEM-HUB, CHI-DEPOT)'
        }
      },
      required: ['location_id']
    }
  },
  {
    name: 'get_demand_signals',
    description: 'Get demand forecasting signals for a region, including stockout risk assessment.',
    input_schema: {
      type: 'object',
      properties: {
        region: {
          type: 'string',
          description: 'The region to check (SOUTHEAST, NORTHEAST, MIDWEST, SOUTHWEST, WEST)'
        }
      },
      required: ['region']
    }
  },
  {
    name: 'find_nearest_cryo_depot',
    description: 'Find the nearest cryopreservation depot to a given airport for emergency cell storage.',
    input_schema: {
      type: 'object',
      properties: {
        airport_code: {
          type: 'string',
          description: 'The 3-letter airport code (e.g., ORD, BOS, LAX)'
        }
      },
      required: ['airport_code']
    }
  },
  {
    name: 'retrieve_sop',
    description: 'Retrieve the relevant Standard Operating Procedure for a given situation.',
    input_schema: {
      type: 'object',
      properties: {
        sop_type: {
          type: 'string',
          description: 'Type of SOP needed: CRYO_EMERGENCY, DEMAND_SPIKE, FLIGHT_DELAY, COI_VERIFICATION, TECH_TRANSFER'
        }
      },
      required: ['sop_type']
    }
  }
];

// ============================================================
// TOOL EXECUTION
// ============================================================
function executeTool(toolName, toolInput) {
  switch (toolName) {
    case 'check_flight_status':
      const flight = mockFlightData[toolInput.flight_id];
      if (flight) {
        return { success: true, data: flight };
      }
      return { success: false, error: `Flight ${toolInput.flight_id} not found` };

    case 'check_inventory_levels':
      const inventory = mockInventoryData[toolInput.location_id];
      if (inventory) {
        return { success: true, data: inventory };
      }
      return { success: false, error: `Location ${toolInput.location_id} not found` };

    case 'get_demand_signals':
      const demand = mockDemandSignals[toolInput.region.toUpperCase()];
      if (demand) {
        return { success: true, data: demand };
      }
      return { success: false, error: `Region ${toolInput.region} not found` };

    case 'find_nearest_cryo_depot':
      // Simulate finding nearest depot based on airport
      if (toolInput.airport_code === 'ORD') {
        return { success: true, data: { airport: 'ORD', nearby_depots: mockCryoDepots } };
      }
      return { success: true, data: { airport: toolInput.airport_code, nearby_depots: [mockCryoDepots[0]] } };

    case 'retrieve_sop':
      const sops = {
        'CRYO_EMERGENCY': {
          title: 'SOP-CGT-007: Cryopreservation Emergency Protocol',
          steps: [
            '1. Verify Chain of Identity (COI) documentation',
            '2. Contact nearest cryo depot within 30-minute drive radius',
            '3. Initiate ground transport with temperature monitoring',
            '4. Notify Patient Coordinator and update patient record',
            '5. Document all actions in QMS within 2 hours',
            '6. Escalate to VP Quality if expiry risk >50%'
          ],
          critical_note: 'Patient cells MUST maintain -150°C. Max out-of-cryo time: 4 hours.'
        },
        'DEMAND_SPIKE': {
          title: 'SOP-SCM-012: Demand Surge Response',
          steps: [
            '1. Validate demand signal against historical baseline',
            '2. Check inter-depot transfer feasibility',
            '3. Calculate optimal redistribution using S&OP model',
            '4. Initiate transfer orders with 24-hour priority',
            '5. Notify regional sales team of potential constraints',
            '6. Update demand planning system'
          ],
          critical_note: 'Suzetrigine safety stock: 14-day supply minimum per region.'
        },
        'FLIGHT_DELAY': {
          title: 'SOP-LOG-003: Transportation Delay Protocol',
          steps: [
            '1. Assess cargo type and time-sensitivity',
            '2. For CGT: Initiate CRYO_EMERGENCY if delay >2 hours',
            '3. For Small Molecule: Recalculate delivery windows',
            '4. Notify downstream stakeholders',
            '5. Evaluate alternative routing options',
            '6. Document delay in TMS system'
          ],
          critical_note: 'CGT shipments have priority override authority.'
        },
        'COI_VERIFICATION': {
          title: 'SOP-CGT-001: Chain of Identity Verification',
          steps: [
            '1. Scan patient barcode on outer container',
            '2. Verify against electronic batch record',
            '3. Confirm patient name, DOB, and unique identifier',
            '4. Cross-reference with manufacturing site release',
            '5. Document verification with timestamp and operator ID',
            '6. Any mismatch = STOP and escalate immediately'
          ],
          critical_note: 'COI failure = potential wrong patient administration. Zero tolerance.'
        },
        'TECH_TRANSFER': {
          title: 'SOP-QA-019: Technology Transfer Data Handling',
          steps: [
            '1. Receive unstructured data package from R&D',
            '2. Use AI extraction tool to parse parameters',
            '3. Validate extracted values against source',
            '4. Human review required for critical process parameters',
            '5. Load validated data to MES system',
            '6. Document any manual corrections'
          ],
          critical_note: '21 CFR Part 11 requires full audit trail on all data transformations.'
        }
      };
      const sop = sops[toolInput.sop_type];
      if (sop) {
        return { success: true, data: sop };
      }
      return { success: false, error: `SOP type ${toolInput.sop_type} not found` };

    default:
      return { success: false, error: `Unknown tool: ${toolName}` };
  }
}

// ============================================================
// SYSTEM PROMPT - The "Brain" of the simulator
// ============================================================
const SYSTEM_PROMPT = `You are the AI Game Master for the Vertex Pharmaceuticals Supply Chain Flight Simulator - a training tool for supply chain professionals.

YOUR ROLE:
- Generate realistic crisis scenarios based on Vertex's actual supply chain models
- Guide trainees through decision-making with escalating complexity
- Use your tools to provide real-time data during scenarios
- Grade responses against pharmaceutical industry best practices

VERTEX'S THREE SUPPLY CHAIN MODELS:

1. SMALL MOLECULE (Cystic Fibrosis - Trikafta):
   - Continuous Manufacturing at Boston Seaport facility
   - PAT (Process Analytical Technology) sensor monitoring
   - Focus: Predictive maintenance, yield optimization
   - Key metrics: OEE, batch cycle time, API purity

2. CELL & GENE THERAPY (Casgevy - Sickle Cell):
   - Vein-to-Vein autologous process (patient's own cells)
   - CRITICAL: Chain of Identity (COI) must be maintained
   - Cryopreservation at -150°C, strict time limits
   - Flight logistics are life-or-death
   - Key metrics: Cell viability, COI compliance, vein-to-vein time

3. ACUTE PAIN LAUNCH (Suzetrigine - VX-548):
   - High-volume retail launch (new product)
   - Demand sensing and forecasting critical
   - Shelf availability at pharmacies
   - Key metrics: Fill rate, stockout rate, demand accuracy

REGULATORY CONTEXT:
- All decisions must be auditable (21 CFR Part 11)
- Human-in-the-Loop (HITL) required for critical decisions
- Simulate operating within a "Walled Garden" private VPC

GRADING CRITERIA:
When grading responses, evaluate against:
1. Patient Safety (for CGT) / Product Integrity
2. Regulatory Compliance (GxP, Part 11)
3. Communication (stakeholder notification)
4. Documentation (audit trail)
5. Escalation (knowing when to involve leadership)
6. Use of SOPs and established procedures

DIFFICULTY LEVELS:
- BEGINNER: Single issue, clear solution path, more hints
- INTERMEDIATE: Multiple factors, some ambiguity, time pressure
- EXPERT: Cascading failures, competing priorities, minimal guidance

When generating scenarios:
- Use specific Vertex product names and terminology
- Reference realistic locations and systems
- Include relevant flight IDs, patient IDs, depot codes
- Create genuine time pressure where appropriate

When the user submits a response:
- Use tools to validate their proposed actions
- Grade on A/B/C/D scale with specific feedback
- Highlight what they got right AND what they missed
- Reference specific SOPs they should have considered`;

// ============================================================
// API ENDPOINTS
// ============================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Generate a new scenario
app.post('/api/scenario/generate', async (req, res) => {
  try {
    const { role, difficulty, useRealTimeData } = req.body;

    let realTimeContext = '';
    let toolsUsed = [];

    // If real-time data is enabled, run the agent loop
    if (useRealTimeData) {
      console.log('🤖 Agent mode enabled - gathering real-time data...');
      
      const toolResults = await runAgentLoop(SCENARIO_CONTEXT, role, difficulty);
      toolsUsed = toolResults;
      
      if (toolResults.length > 0) {
        realTimeContext = `

## REAL-TIME DATA (gathered by AI agent - incorporate this into your scenario)

The AI agent searched for current information to make this scenario realistic. Use this data:

${toolResults.map(tr => {
  if (tr.result.success) {
    return `### ${tr.tool.toUpperCase()} - ${JSON.stringify(tr.args)}
${JSON.stringify(tr.result.data, null, 2)}`;
  } else {
    return `### ${tr.tool.toUpperCase()} - Failed: ${tr.result.error}`;
  }
}).join('\n\n')}

IMPORTANT: Incorporate the real-time data above into your scenario naturally. For example:
- If weather data shows a storm, use that actual weather condition
- If news mentions supply chain disruptions, weave that into the scenario
- Reference actual conditions to make the scenario feel current and realistic
- You can adjust details but keep the core real-world elements
`;
        console.log(`✅ Agent gathered ${toolResults.length} data sources`);
      }
    }

    const prompt = `${SCENARIO_CONTEXT}${realTimeContext}

NOW GENERATE A NEW SCENARIO:
- Role: ${role}
- Difficulty: ${difficulty.toUpperCase()}
${useRealTimeData ? '- IMPORTANT: This scenario should incorporate the real-time data provided above' : ''}

Remember:
- Generate completely fresh flight IDs, patient IDs, and circumstances
- All data must be consistent with the briefing
- Include only relevant data (don't pad with unrelated flights/depots)
- Match the difficulty level for time pressure and hints
- For Quality Engineer: Focus on CGT/Casgevy scenarios with cryo emergencies
- For Supply Chain Planner: Focus on demand spikes, inventory issues, or launch challenges
${useRealTimeData ? '- Incorporate actual weather conditions and news events from the real-time data' : ''}

Respond with ONLY the JSON object. No markdown, no explanation, just valid JSON.`;

    const response = await geminiModel.generateContent(prompt);
    const textContent = response.response.text();
    let scenarioData;
    
    try {
      // Clean up response - remove markdown code blocks if present
      let cleanedResponse = textContent.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.slice(7);
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.slice(3);
      }
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.slice(0, -3);
      }
      cleanedResponse = cleanedResponse.trim();
      
      // Parse JSON
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scenarioData = JSON.parse(jsonMatch[0]);
        
        // Validate required fields
        if (!scenarioData.alert_title || !scenarioData.briefing || !scenarioData.scenario_data) {
          throw new Error('Missing required scenario fields');
        }
        
        // If cryo_expiry_minutes is set, calculate actual expiry time
        if (scenarioData.scenario_data?.cryo_expiry_minutes) {
          const expiryTime = new Date(Date.now() + scenarioData.scenario_data.cryo_expiry_minutes * 60 * 1000).toISOString();
          
          // Add expiry to relevant flight(s)
          if (scenarioData.scenario_data.flights) {
            Object.keys(scenarioData.scenario_data.flights).forEach(flightId => {
              const flight = scenarioData.scenario_data.flights[flightId];
              if (flight.patient_id || 
                  flight.cargo?.toLowerCase().includes('cell') || 
                  flight.cargo?.toLowerCase().includes('casgevy') ||
                  flight.cargo?.toLowerCase().includes('autologous')) {
                flight.cryo_expiry = expiryTime;
              }
            });
          }
          scenarioData.scenario_data.cryo_expiry_time = expiryTime;
        }

        // Add metadata about real-time data usage
        if (useRealTimeData && toolsUsed.length > 0) {
          scenarioData.real_time_data = {
            enabled: true,
            tools_used: toolsUsed.map(t => ({ tool: t.tool, args: t.args, success: t.result.success })),
            generated_at: new Date().toISOString()
          };
        }
        
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (e) {
      console.error('Failed to parse scenario:', e);
      console.error('Raw response:', textContent);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to generate valid scenario. Please try again.',
        debug: process.env.NODE_ENV === 'development' ? textContent : undefined
      });
    }

    res.json({ success: true, scenario: scenarioData });

  } catch (error) {
    console.error('Scenario generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Process user response and continue simulation
app.post('/api/scenario/respond', async (req, res) => {
  try {
    const { conversationHistory, userResponse, scenario } = req.body;

    const messages = [
      ...conversationHistory,
      { role: 'user', content: userResponse }
    ];

    // Build conversation string for Gemini
    const conversationText = messages.map(m => {
      const role = m.role === 'user' ? 'User' : 'Assistant';
      const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
      return `${role}: ${content}`;
    }).join('\n\n');

    const prompt = `${SYSTEM_PROMPT}

AVAILABLE DATA (use this to inform your responses):
Flight Data: ${JSON.stringify(mockFlightData, null, 2)}
Inventory Data: ${JSON.stringify(mockInventoryData, null, 2)}
Demand Signals: ${JSON.stringify(mockDemandSignals, null, 2)}
Cryo Depots: ${JSON.stringify(mockCryoDepots, null, 2)}

CURRENT SCENARIO:
${JSON.stringify(scenario, null, 2)}

CONVERSATION SO FAR:
${conversationText}

Continue the simulation. Respond to the user's latest input. Reference the available data when relevant to make your response realistic and specific. Guide them through the scenario, ask probing questions, or provide feedback on their decisions.`;

    const response = await geminiModel.generateContent(prompt);
    const textContent = response.response.text();

    // Update conversation history
    const updatedMessages = [
      ...messages,
      { role: 'assistant', content: textContent }
    ];

    res.json({
      success: true,
      response: textContent,
      conversationHistory: updatedMessages,
      assistantContent: [{ type: 'text', text: textContent }]
    });

  } catch (error) {
    console.error('Response processing error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Grade user's final response
app.post('/api/scenario/grade', async (req, res) => {
  try {
    const { conversationHistory, scenario } = req.body;

    const gradingPrompt = `Based on this simulation conversation, provide a final grade and detailed feedback.

Original scenario checklist (for your reference): ${JSON.stringify(scenario.ideal_response_checklist || [])}

Provide your assessment as JSON:
{
  "grade": "A|B|C|D",
  "score": 85,
  "summary": "One sentence overall assessment",
  "strengths": ["what they did well"],
  "improvements": ["what they missed or could improve"],
  "sop_references": ["relevant SOPs they should review"],
  "coaching_tips": ["specific actionable advice"]
}`;

    const messages = [
      ...conversationHistory,
      { role: 'user', content: gradingPrompt }
    ];

    // Combine system prompt with conversation for Gemini
    const fullPrompt = `${SYSTEM_PROMPT}\n\nConversation:\n${messages.map(m => `${m.role}: ${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`).join('\n')}`;
    
    const response = await geminiModel.generateContent(fullPrompt);
    const textContent = response.response.text();
    let gradeData;

    try {
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        gradeData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (e) {
      gradeData = { raw_response: textContent.text };
    }

    res.json({ success: true, grade: gradeData });

  } catch (error) {
    console.error('Grading error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================
// TEST PREP ENDPOINTS
// ============================================================

// Load flashcards
const flashcardsData = require('./data/flashcards.json');

// Get all flashcards (for reference)
app.get('/api/flashcards', (req, res) => {
  res.json({ success: true, data: flashcardsData.flashcards });
});

// Get categories
app.get('/api/flashcards/categories', (req, res) => {
  const categories = [...new Set(flashcardsData.flashcards.map(f => f.category))];
  res.json({ success: true, categories });
});

// Generate a test
app.post('/api/test/generate', async (req, res) => {
  try {
    const { length, categories, weakAreas, difficulty, questionFormat } = req.body;
    
    // Filter flashcards by category if specified
    let availableCards = flashcardsData.flashcards;
    if (categories && categories.length > 0) {
      availableCards = availableCards.filter(c => categories.includes(c.category));
    }
    
    // Prioritize weak areas if specified
    if (weakAreas && weakAreas.length > 0) {
      const weakCards = availableCards.filter(c => weakAreas.includes(c.category));
      const otherCards = availableCards.filter(c => !weakAreas.includes(c.category));
      // 70% weak area questions, 30% other
      const weakCount = Math.floor(length * 0.7);
      const otherCount = length - weakCount;
      availableCards = [
        ...shuffleArray(weakCards).slice(0, weakCount),
        ...shuffleArray(otherCards).slice(0, otherCount)
      ];
    }
    
    // Shuffle and select cards
    const selectedCards = shuffleArray(availableCards).slice(0, Math.min(length, availableCards.length));
    
    // Determine question format instructions
    let formatInstructions;
    if (questionFormat === 'multiple_choice') {
      formatInstructions = '- 100% multiple choice (4 options, one correct)';
    } else if (questionFormat === 'free_text') {
      formatInstructions = '- 100% free text (short answer requiring typed response)';
    } else {
      formatInstructions = '- 60% multiple choice (4 options, one correct)\n- 40% free text (short answer)';
    }

    // Generate questions using AI
    const questionsPrompt = `You are a test generator for a Vertex Pharmaceuticals supply chain training platform.

Based on these flashcards, generate ${length} test questions. Question format:
${formatInstructions}

For each question, also generate:
- A difficulty level (easy, medium, hard)
- An "interview_style" boolean - true if it's a behavioral/situational question

FLASHCARD DATA:
${JSON.stringify(selectedCards, null, 2)}

IMPORTANT GUIDELINES:
1. Don't just copy flashcard fronts as questions - rephrase and add context
2. Add 2-3 questions that combine multiple concepts or require deeper thinking
3. Add 1-2 "interview-style" questions like "How would you explain X to a non-technical stakeholder?"
4. Make multiple choice distractors plausible but clearly wrong to experts
5. Vary difficulty: 30% easy, 50% medium, 20% hard

Return ONLY valid JSON array:
[
  {
    "id": 1,
    "type": "multiple_choice",
    "category": "category name",
    "difficulty": "easy|medium|hard",
    "interview_style": false,
    "question": "Question text?",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correct_answer": "A",
    "explanation": "Why this is correct...",
    "source_flashcard_id": 1
  },
  {
    "id": 2,
    "type": "free_text",
    "category": "category name",
    "difficulty": "medium",
    "interview_style": true,
    "question": "Question text?",
    "ideal_answer": "Key points that should be covered...",
    "explanation": "Detailed explanation...",
    "source_flashcard_id": 2
  }
]`;

    const response = await geminiModel.generateContent(questionsPrompt);
    const textContent = response.response.text();
    let questions;
    
    try {
      const jsonMatch = textContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found');
      }
    } catch (e) {
      console.error('Failed to parse questions:', e);
      return res.status(500).json({ success: false, error: 'Failed to generate questions' });
    }

    res.json({ success: true, questions });

  } catch (error) {
    console.error('Test generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Grade test answers
app.post('/api/test/grade', async (req, res) => {
  try {
    const { questions, answers } = req.body;
    
    const gradingPrompt = `You are a strict but fair grader for a Vertex Pharmaceuticals supply chain training test.

Grade each answer. Be realistic - don't give full credit for partial answers.

QUESTIONS AND ANSWERS:
${questions.map((q, i) => `
Question ${i + 1} (${q.type}, ${q.difficulty}, Category: ${q.category}):
${q.question}
${q.type === 'multiple_choice' ? `Options: ${q.options.join(', ')}\nCorrect Answer: ${q.correct_answer}` : `Ideal Answer: ${q.ideal_answer}`}

User's Answer: ${answers[i]?.answer || 'NO ANSWER'}
Time Taken: ${answers[i]?.timeTaken || 0} seconds
Confidence: ${answers[i]?.confidence || 'not rated'}/5
`).join('\n---\n')}

For each answer, provide:
1. Score (0-100)
2. Is correct (boolean)
3. Specific feedback
4. What was missed (if anything)

Also provide:
- Overall score (weighted by difficulty: easy=1x, medium=1.5x, hard=2x)
- Category scores (average per category)
- Weak areas (categories below 70%)
- Study recommendations

GRADING STANDARDS:
- Multiple choice: 100 if correct, 0 if wrong
- Free text: Grade on completeness, accuracy, use of correct terminology
  - 90-100: Complete, accurate, uses proper terms
  - 70-89: Mostly correct, missing minor details
  - 50-69: Partially correct, missing key concepts
  - Below 50: Incorrect or too vague

CRITICAL - FEEDBACK REQUIREMENTS:
For ANY answer scoring below 90, provide THOROUGH educational feedback that:
1. Explains the correct answer in detail (2-3 sentences minimum)
2. Explains WHY this matters in a Vertex/pharma context
3. Provides a memory tip or real-world example to help remember
4. For free text: acknowledges what they got right before explaining what was missed

Example of GOOD feedback for a wrong answer:
"The correct answer is RAG (Retrieval-Augmented Generation). RAG works by first retrieving relevant documents from a vector database, then injecting that context into the prompt before the LLM generates a response. This is critical at Vertex because it allows AI systems to reference current SOPs and batch records without hallucinating outdated information. Memory tip: Think 'RAG = Research And Ground' - the AI researches first, then grounds its answer in real data."

Example of BAD feedback (too brief):
"Incorrect. The answer is RAG."

Return ONLY valid JSON:
{
  "overall_score": 85,
  "overall_grade": "B+",
  "total_correct": 15,
  "total_questions": 20,
  "time_analysis": {
    "average_seconds": 45,
    "rushed_answers": 2,
    "hesitant_answers": 3
  },
  "category_scores": {
    "Category Name": { "score": 85, "correct": 5, "total": 6 }
  },
  "weak_areas": ["Category 1", "Category 2"],
  "strong_areas": ["Category 3"],
  "answers": [
    {
      "question_id": 1,
      "score": 100,
      "is_correct": true,
      "feedback": "Correct!",
      "missed": null
    }
  ],
  "study_recommendations": [
    "Focus on X because...",
    "Review the concept of Y..."
  ],
  "mastery_level": {
    "score": 75,
    "feedback": "You show good knowledge but need to work on..."
  }
}`;

    const response = await geminiModel.generateContent(gradingPrompt);
    const textContent = response.response.text();
    let gradeData;
    
    try {
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        gradeData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (e) {
      console.error('Failed to parse grade:', e);
      return res.status(500).json({ success: false, error: 'Failed to grade test' });
    }

    res.json({ success: true, grade: gradeData });

  } catch (error) {
    console.error('Grading error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Teach a concept
app.post('/api/test/teach', async (req, res) => {
  try {
    const { category, concepts } = req.body;
    
    // Get relevant flashcards
    const relevantCards = flashcardsData.flashcards.filter(f => 
      f.category === category || concepts.some(c => f.front.toLowerCase().includes(c.toLowerCase()))
    );

    const teachPrompt = `You are a helpful tutor for a Vertex Pharmaceuticals supply chain training program.

The user is weak in: ${category}
Specific concepts they struggled with: ${concepts.join(', ')}

Relevant knowledge base:
${JSON.stringify(relevantCards, null, 2)}

Provide a clear, concise teaching session that:
1. Explains the core concepts in simple terms
2. Uses analogies where helpful
3. Connects concepts to real Vertex business context
4. Provides memory tricks or frameworks
5. Ends with 2-3 quick self-check questions

Keep it conversational and encouraging. Format with markdown.`;

    const response = await geminiModel.generateContent(teachPrompt);
    const textContent = response.response.text();

    res.json({ success: true, lesson: textContent });

  } catch (error) {
    console.error('Teaching error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to shuffle array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get mock data for visualization panels
app.get('/api/data/flights', (req, res) => {
  res.json({ success: true, data: mockFlightData });
});

app.get('/api/data/inventory', (req, res) => {
  res.json({ success: true, data: mockInventoryData });
});

app.get('/api/data/demand', (req, res) => {
  res.json({ success: true, data: mockDemandSignals });
});

// Catch-all: serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Vertex Simulator running on port ${PORT}`);
});
