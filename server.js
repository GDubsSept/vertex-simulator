const express = require('express');
const cors = require('cors');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static React build
app.use(express.static(path.join(__dirname, 'client/build')));

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

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
    const { role, difficulty } = req.body;

    const prompt = `Generate a new training scenario for a ${role} at ${difficulty} difficulty level.

Include:
1. A compelling "Alert" title (what happened)
2. Initial situation briefing (3-4 sentences)
3. Key data points the trainee should investigate
4. A hidden "ideal response" checklist for grading (do not reveal to user)

Format your response as JSON:
{
  "alert_title": "...",
  "alert_severity": "CRITICAL|HIGH|MEDIUM",
  "briefing": "...",
  "initial_data": {
    "flight_id": "..." (if applicable),
    "location": "...",
    "time_pressure": "...",
    "key_metrics": {}
  },
  "ideal_response_checklist": ["item1", "item2", ...],
  "hints": ["hint1", "hint2"] (more hints for beginner, fewer for expert)
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      tools: tools,
      messages: [{ role: 'user', content: prompt }]
    });

    // Handle tool use if Claude wants to check data while generating
    let finalResponse = response;
    let messages = [{ role: 'user', content: prompt }];

    while (finalResponse.stop_reason === 'tool_use') {
      const assistantMessage = { role: 'assistant', content: finalResponse.content };
      messages.push(assistantMessage);

      const toolResults = [];
      for (const block of finalResponse.content) {
        if (block.type === 'tool_use') {
          const result = executeTool(block.name, block.input);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result)
          });
        }
      }

      messages.push({ role: 'user', content: toolResults });

      finalResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        tools: tools,
        messages: messages
      });
    }

    // Extract text response
    const textContent = finalResponse.content.find(block => block.type === 'text');
    let scenarioData;
    
    try {
      // Try to parse JSON from the response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scenarioData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (e) {
      // If parsing fails, return raw text
      scenarioData = { raw_response: textContent.text };
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

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      tools: tools,
      messages: messages
    });

    // Handle tool use loop
    let finalResponse = response;
    let updatedMessages = [...messages];

    while (finalResponse.stop_reason === 'tool_use') {
      const assistantMessage = { role: 'assistant', content: finalResponse.content };
      updatedMessages.push(assistantMessage);

      const toolResults = [];
      const toolCalls = [];

      for (const block of finalResponse.content) {
        if (block.type === 'tool_use') {
          const result = executeTool(block.name, block.input);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result)
          });
          toolCalls.push({
            tool: block.name,
            input: block.input,
            result: result
          });
        }
      }

      updatedMessages.push({ role: 'user', content: toolResults });

      finalResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        tools: tools,
        messages: updatedMessages
      });
    }

    // Extract final text response
    const textContent = finalResponse.content.find(block => block.type === 'text');

    res.json({
      success: true,
      response: textContent?.text || '',
      conversationHistory: updatedMessages,
      assistantContent: finalResponse.content
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

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: messages
    });

    const textContent = response.content.find(block => block.type === 'text');
    let gradeData;

    try {
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
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
