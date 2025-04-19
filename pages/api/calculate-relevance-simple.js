import { calculateRelevance, extractSimpleEntities } from '../../utils/simpleRelevanceAlgorithm';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { primaryText, secondaryText } = req.body;
    
    if (!primaryText || !secondaryText) {
      return res.status(400).json({ error: 'Both primaryText and secondaryText are required' });
    }
    
    // Extract entities (we need to export this function in simpleRelevanceAlgorithm.js)
    const primaryEntities = extractSimpleEntities(primaryText);
    const secondaryEntities = extractSimpleEntities(secondaryText);
    
    // Calculate relevance
    const result = await calculateRelevance(primaryText, secondaryText);
    
    // Add components property for consistency with visualization
    result.components = {
      keywordOverlap: result.explanation.match(/Keyword similarity: ([^%]+)/)[1] / 100,
      entityOverlap: result.explanation.match(/Entity overlap: ([^%]+)/)[1] / 100
    };
    
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