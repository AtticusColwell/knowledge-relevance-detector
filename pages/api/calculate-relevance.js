import { calculateRelevance, extractSimpleEntities } from '../../utils/llmEnhancedRelevanceAlgorithm';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { primaryText, secondaryText } = req.body;
    
    // Validate input
    if (!primaryText || !secondaryText) {
      return res.status(400).json({ error: 'Both primaryText and secondaryText are required' });
    }
    
    // Get API key from server environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }
    
    // Extract entities
    const primaryEntities = extractSimpleEntities(primaryText);
    const secondaryEntities = extractSimpleEntities(secondaryText);
    
    // Calculate relevance
    const result = await calculateRelevance(primaryText, secondaryText, apiKey);
    
    // Return both the result and the extracted entities
    return res.status(200).json({ 
      result,
      primaryEntities,
      secondaryEntities
    });
  } catch (error) {
    console.error('Error calculating relevance:', error);
    return res.status(500).json({ 
      error: 'Failed to calculate relevance',
      message: error.message 
    });
  }
}