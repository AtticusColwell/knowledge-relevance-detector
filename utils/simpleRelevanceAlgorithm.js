/**
 * Calculate relevance between primary and secondary person's knowledge
 * @param {string} primaryText - Text representing what the primary person knows
 * @param {string} secondaryText - Text representing what the secondary person knows
 * @returns {Object} - Relevance score and explanation
 */
export async function calculateRelevance(primaryText, secondaryText) {
    // 1. Extract keywords
    const primaryKeywords = extractKeywords(primaryText);
    const secondaryKeywords = extractKeywords(secondaryText);
    
    // 2. Extract simple entities
    const primaryEntities = extractSimpleEntities(primaryText);
    const secondaryEntities = extractSimpleEntities(secondaryText);
    
    // 3. Calculate keyword overlap
    const keywordOverlap = calculateOverlap(primaryKeywords, secondaryKeywords);
    
    // 4. Calculate entity overlap
    const entityOverlap = calculateOverlap(primaryEntities, secondaryEntities);
    
    // 5. Combine scores
    const relevanceScore = (keywordOverlap * 0.6) + (entityOverlap * 0.4);
    
    // 6. Generate explanation
    const explanation = generateExplanation(
      primaryKeywords, 
      secondaryKeywords,
      primaryEntities,
      secondaryEntities,
      keywordOverlap,
      entityOverlap,
      relevanceScore
    );
    
    return {
      isRelevant: relevanceScore > 0.3, // Threshold can be adjusted
      score: relevanceScore,
      explanation
    };
  }
  
  /**
   * Extract keywords from text
   * @param {string} text - Input text
   * @returns {Array} - Array of keywords
   */
  export function extractKeywords(text) {
    // Convert to lowercase and remove punctuation
    const cleanText = text.toLowerCase().replace(/[^\w\s]/g, '');
    
    // Split into words
    const words = cleanText.split(/\s+/);
    
    // Remove common stop words
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
      'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 
      'to', 'from', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 
      'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 
      'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 
      'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 
      'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now'
    ]);
    
    // Filter out stop words and very short words
    const keywords = words.filter(word => 
      !stopWords.has(word) && word.length > 2
    );
    
    // Count word frequencies
    const wordFrequency = {};
    keywords.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    
    // Sort by frequency and return top keywords
    return Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(entry => entry[0]);
  }
  
  /**
   * Extract simple entities using regex patterns
   * @param {string} text - Input text
   * @returns {Array} - Array of potential entities
   */
  export function extractSimpleEntities(text) {
    const entities = [];
    
    // Extract capitalized phrases (potential proper nouns)
    const properNounRegex = /\b[A-Z][a-z]+ (?:[A-Z][a-z]+ )*[A-Z][a-z]+\b/g;
    const properNouns = text.match(properNounRegex) || [];
    
    // Extract potential dates 
    const dateRegex = /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/gi;
    const dates = text.match(dateRegex) || [];
    
    // Extract potential percentages or statistics
    const statsRegex = /\b\d+(?:\.\d+)?%\b|\b\d+(?:\.\d+)? percent\b/gi;
    const stats = text.match(statsRegex) || [];
    
    // Extract potential money amounts
    const moneyRegex = /\$\d+(?:,\d{3})*(?:\.\d{2})?|\b\d+(?:,\d{3})*(?:\.\d{2})? dollars\b/gi;
    const money = text.match(moneyRegex) || [];
    
    // Combine all entities
    return [...new Set([...properNouns, ...dates, ...stats, ...money])];
  }
  
  /**
   * Calculate overlap between two arrays
   * @param {Array} array1 - First array
   * @param {Array} array2 - Second array
   * @returns {number} - Overlap score (0-1)
   */
  export function calculateOverlap(array1, array2) {
    if (array1.length === 0 || array2.length === 0) return 0;
    
    // Convert to lowercase for case-insensitive comparison
    const set1 = new Set(array1.map(item => typeof item === 'string' ? item.toLowerCase() : item));
    const set2 = new Set(array2.map(item => typeof item === 'string' ? item.toLowerCase() : item));
    
    // Find intersection
    const intersection = new Set([...set1].filter(item => set2.has(item)));
    
    // Calculate Jaccard similarity
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }
  
  /**
   * Generate explanation for the relevance score
   * @param {Array} primaryKeywords - Primary keywords
   * @param {Array} secondaryKeywords - Secondary keywords
   * @param {Array} primaryEntities - Primary entities
   * @param {Array} secondaryEntities - Secondary entities
   * @param {number} keywordOverlap - Keyword overlap score
   * @param {number} entityOverlap - Entity overlap score
   * @param {number} relevanceScore - Final relevance score
   * @returns {string} - Explanation text
   */
  export function generateExplanation(
    primaryKeywords,
    secondaryKeywords,
    primaryEntities,
    secondaryEntities,
    keywordOverlap,
    entityOverlap,
    relevanceScore
  ) {
    // Find shared keywords
    const sharedKeywords = primaryKeywords.filter(keyword => 
        secondaryKeywords.includes(keyword)
      );
      
      // Find shared entities
      const sharedEntities = primaryEntities.filter(entity =>
        secondaryEntities.some(secEntity => 
          secEntity.toLowerCase() === entity.toLowerCase()
        )
      );
      
      let explanation = '';
      
      if (relevanceScore > 0.7) {
        explanation = 'High relevance detected. ';
      } else if (relevanceScore > 0.3) {
        explanation = 'Moderate relevance detected. ';
      } else {
        explanation = 'Low relevance detected. ';
      }
      
      if (sharedEntities.length > 0) {
        explanation += `Both texts mention the same entities: ${sharedEntities.slice(0, 5).join(', ')}${sharedEntities.length > 5 ? '...' : ''}. `;
      }
      
      if (sharedKeywords.length > 0) {
        explanation += `Both texts share keywords related to: ${sharedKeywords.slice(0, 7).join(', ')}${sharedKeywords.length > 7 ? '...' : ''}. `;
      }
      
      explanation += `Entity overlap: ${(entityOverlap * 100).toFixed(1)}%. `;
      explanation += `Keyword similarity: ${(keywordOverlap * 100).toFixed(1)}%.`;
      
      return explanation;
  }