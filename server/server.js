const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS allowing Vite dev server
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json());

// Main proxy endpoint
app.post('/api/claude', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Prompt is required' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: 'Groq API key is not configured. Please add GROQ_API_KEY to your server/.env file.'
    });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq API Error (Status ${response.status}):`, errorText);
      return res.status(response.status).json({
        success: false,
        error: `Groq API returned status ${response.status}. ${errorText}`
      });
    }

    const responseData = await response.json();

    if (!responseData.choices || responseData.choices.length === 0 || !responseData.choices[0].message) {
      return res.status(500).json({
        success: false,
        error: 'Received empty content from Groq API'
      });
    }

    const rawText = responseData.choices[0].message.content;
    console.log('Raw text response from Groq:', rawText);

    // Parse response text to extract JSON
    let cleanedText = rawText.trim();

    // Remove markdown code fences if present (e.g. ```json or ```)
    cleanedText = cleanedText.replace(/^```json\s*/i, '');
    cleanedText = cleanedText.replace(/^```\s*/, '');
    cleanedText = cleanedText.replace(/\s*```$/, '');

    // Fallback: extract substring between first '{' and last '}' if Groq returned additional text
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
    }

    try {
      const parsedJSON = JSON.parse(cleanedText);
      return res.json({ success: true, data: parsedJSON });
    } catch (parseError) {
      console.error('Failed to parse JSON. Raw content was:', rawText);
      console.error('Cleaned content was:', cleanedText);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse AI response as valid JSON.',
        rawData: rawText
      });
    }

  } catch (error) {
    console.error('Server error calling Groq API:', error);
    return res.status(500).json({
      success: false,
      error: `Internal server error: ${error.message}`
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
