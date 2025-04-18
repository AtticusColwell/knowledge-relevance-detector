import OpenAI from 'openai';

/**
 * Calculate relevance between primary and secondary person's knowledge
 * @param {string} primaryText - Text representing what the primary person knows
 * @param {string} secondaryText - Text representing what the secondary person knows
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<Object>} - Relevance score and explanation
 */
export async function calculateRelevance(primaryText, secondaryText, apiKey) {
    // Initialize OpenAI client
    const openai = new OpenAI({
        apiKey: apiKey
    });
    
    // 1. Extract keywords and entities
    const primaryKeywords = extractKeywords(primaryText);
    const secondaryKeywords = extractKeywords(secondaryText);
    const primaryEntities = extractSimpleEntities(primaryText);
    const secondaryEntities = extractSimpleEntities(secondaryText);
    
    // 2. Calculate traditional overlap scores
    const keywordOverlap = calculateOverlap(primaryKeywords, secondaryKeywords);
    const entityOverlap = calculateOverlap(primaryEntities, secondaryEntities);
    
    // 3. Get semantic similarity using OpenAI embeddings
    const semanticSimilarity = await calculateSemanticSimilarity(
        primaryText, 
        secondaryText, 
        openai, 
        keywordOverlap, 
        entityOverlap
    );
    
    // 4. Combine scores with weighted approach
    const relevanceScore = (keywordOverlap * 0.3) + (entityOverlap * 0.2) + (semanticSimilarity * 0.5);
    
    // 5. Generate explanation
    const explanation = generateEnhancedExplanation(
        primaryKeywords,
        secondaryKeywords,
        primaryEntities,
        secondaryEntities,
        keywordOverlap,
        entityOverlap,
        semanticSimilarity,
        relevanceScore
    );
    
    return {
        isRelevant: relevanceScore > 0.35,
        score: relevanceScore,
        explanation,
        components: {
            keywordOverlap,
            entityOverlap,
            semanticSimilarity
        }
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
 * Calculate semantic similarity using OpenAI embeddings
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @param {Object} openai - OpenAI client instance
 * @returns {Promise<number>} - Similarity score between 0-1
 */
async function calculateSemanticSimilarity(text1, text2, openai, keywordOverlap, entityOverlap) {
    try {
        // Get embeddings for both texts
        const response1 = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: truncateText(text1, 8000) // OpenAI has token limits
        });
        
        const response2 = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: truncateText(text2, 8000)
        });
        
        const embedding1 = response1.data[0].embedding;
        const embedding2 = response2.data[0].embedding;
        
        // Calculate cosine similarity between embeddings
        const similarity = cosineSimilarity(embedding1, embedding2);
        
        return similarity;
    } catch (error) {
        console.error("Error calculating semantic similarity:", error);
        // Fall back to traditional methods if API fails
        return (keywordOverlap * 0.6) + (entityOverlap * 0.4);
    }
}

/**
 * Calculate cosine similarity between two vectors
 * @param {Array<number>} vec1 - First vector
 * @param {Array<number>} vec2 - Second vector
 * @returns {number} - Similarity score between 0-1
 */
function cosineSimilarity(vec1, vec2) {
    // Ensure vectors are of the same length
    if (vec1.length !== vec2.length) {
        throw new Error("Vectors must be of the same length");
    }
    
    // Calculate dot product
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i];
        magnitude1 += vec1[i] * vec1[i];
        magnitude2 += vec2[i] * vec2[i];
    }
    
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    
    // Prevent division by zero
    if (magnitude1 === 0 || magnitude2 === 0) {
        return 0;
    }
    
    // Return cosine similarity
    return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Truncate text to approximately match token limit
 * @param {string} text - Input text
 * @param {number} maxTokens - Maximum number of tokens
 * @returns {string} - Truncated text
 */
function truncateText(text, maxTokens) {
    // Rough approximation: 1 token ≈ 4 characters in English
    const maxChars = maxTokens * 4;
    
    if (text.length <= maxChars) {
        return text;
    }
    
    return text.substring(0, maxChars);
}

/**
 * Generate enhanced explanation for the relevance score
 * @param {Array} primaryKeywords - Primary keywords
 * @param {Array} secondaryKeywords - Secondary keywords
 * @param {Array} primaryEntities - Primary entities
 * @param {Array} secondaryEntities - Secondary entities
 * @param {number} keywordOverlap - Keyword overlap score
 * @param {number} entityOverlap - Entity overlap score
 * @param {number} semanticSimilarity - Semantic similarity score
 * @param {number} relevanceScore - Final relevance score
 * @returns {string} - Explanation text
 */
function generateEnhancedExplanation(
    primaryKeywords,
    secondaryKeywords,
    primaryEntities,
    secondaryEntities,
    keywordOverlap,
    entityOverlap,
    semanticSimilarity,
    relevanceScore
) {
    // Find shared keywords and entities
    const sharedKeywords = primaryKeywords.filter(keyword => 
        secondaryKeywords.includes(keyword)
    );
    
    const sharedEntities = primaryEntities.filter(entity =>
        secondaryEntities.some(secEntity => 
            secEntity.toLowerCase() === entity.toLowerCase()
        )
    );
    
    let explanation = '';
    
    // Determine overall relevance level
    if (relevanceScore > 0.7) {
        explanation = 'High relevance detected. ';
    } else if (relevanceScore > 0.35) {
        explanation = 'Moderate relevance detected. ';
    } else {
        explanation = 'Low relevance detected. ';
    }
    
    // Add semantic analysis insight
    if (semanticSimilarity > 0.8) {
        explanation += 'The texts are highly semantically similar. ';
    } else if (semanticSimilarity > 0.5) {
        explanation += 'The texts share moderate semantic similarity. ';
    } else if (semanticSimilarity > 0.3) {
        explanation += 'The texts have some semantic relationship. ';
    } else {
        explanation += 'The texts have limited semantic connection. ';
    }
    
    // Add entity and keyword information
    if (sharedEntities.length > 0) {
        explanation += `Both texts mention the same entities: ${sharedEntities.slice(0, 5).join(', ')}${sharedEntities.length > 5 ? '...' : ''}. `;
    }
    
    if (sharedKeywords.length > 0) {
        explanation += `Both texts share keywords related to: ${sharedKeywords.slice(0, 7).join(', ')}${sharedKeywords.length > 7 ? '...' : ''}. `;
    }
    
    // Add scoring breakdown
    explanation += `Entity overlap: ${(entityOverlap * 100).toFixed(1)}%. `;
    explanation += `Keyword similarity: ${(keywordOverlap * 100).toFixed(1)}%. `;
    explanation += `Semantic similarity: ${(semanticSimilarity * 100).toFixed(1)}%.`;
    
    return explanation;
}