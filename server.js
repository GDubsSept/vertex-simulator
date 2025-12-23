const express = require('express');
const cors = require('cors');
const path = require('path');
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

    const prompt = `${SYSTEM_PROMPT}

AVAILABLE DATA FOR SCENARIO GENERATION:
Flight Data: ${JSON.stringify(mockFlightData, null, 2)}
Inventory Data: ${JSON.stringify(mockInventoryData, null, 2)}
Demand Signals: ${JSON.stringify(mockDemandSignals, null, 2)}
Cryo Depots: ${JSON.stringify(mockCryoDepots, null, 2)}

Generate a new training scenario for a ${role} at ${difficulty} difficulty level.

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

    const response = await geminiModel.generateContent(prompt);
    const textContent = response.response.text();
    let scenarioData;
    
    try {
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scenarioData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (e) {
      scenarioData = { raw_response: textContent };
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
