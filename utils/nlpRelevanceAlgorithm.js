// Relevance Detection Algorithm using NER and Topic Modeling

import * as natural from 'natural';
import nlp from 'compromise';
import { removeStopwords } from 'stopword';

/**
 * Calculate relevance between primary and secondary person's knowledge
 * @param {string} primaryText - Text representing what the primary person knows
 * @param {string} secondaryText - Text representing what the secondary person knows
 * @returns {Object} - Relevance score and explanation
 */
export async function calculateRelevance(primaryText, secondaryText) {
  // 1. Named Entity Recognition
  const primaryEntities = extractEntities(primaryText);
  const secondaryEntities = extractEntities(secondaryText);
  
  // 2. Topic Modeling
  const { primaryTopics, secondaryTopics } = performTopicModeling(primaryText, secondaryText);
  
  // 3. Calculate Entity Overlap
  const entityOverlap = calculateEntityOverlap(primaryEntities, secondaryEntities);
  
  // 4. Calculate Topic Similarity
  const topicSimilarity = calculateTopicSimilarity(primaryTopics, secondaryTopics);
  
  // 5. Combine scores
  const relevanceScore = (entityOverlap * 0.6) + (topicSimilarity * 0.4);
  
  // 6. Generate explanation
  const explanation = generateExplanation(
    primaryEntities, 
    secondaryEntities, 
    primaryTopics, 
    secondaryTopics, 
    entityOverlap, 
    topicSimilarity,
    relevanceScore
  );
  
  return {
    isRelevant: relevanceScore > 0.3, // Threshold can be adjusted
    score: relevanceScore,
    explanation
  };
}

/**
 * Extract named entities from text using compromise
 * @param {string} text - Input text
 * @returns {Object} - Object containing entities by category
 */
function extractEntities(text) {
  const doc = nlp(text);
  
  return {
    people: doc.people().out('array'),
    places: doc.places().out('array'),
    organizations: doc.organizations().out('array'),
    topics: extractKeyPhrases(text),
  };
}

/**
 * Extract key phrases/topics from text
 * @param {string} text - Input text
 * @returns {Array} - Array of key phrases
 */
function extractKeyPhrases(text) {
  // Tokenize and remove stopwords
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const filteredTokens = removeStopwords(tokens);
  
  // Use TF-IDF for keyword extraction
  const tfidf = new natural.TfIdf();
  tfidf.addDocument(filteredTokens);
  
  const keyPhrases = [];
  tfidf.listTerms(0).slice(0, 10).forEach(item => {
    keyPhrases.push(item.term);
  });
  
  return keyPhrases;
}

/**
 * Perform simple topic modeling on texts
 * @param {string} primaryText - Primary person's text
 * @param {string} secondaryText - Secondary person's text
 * @returns {Object} - Topics for both texts
 */
function performTopicModeling(primaryText, secondaryText) {
  // This is a simplified version of topic modeling
  // In a production system, you'd use a more sophisticated approach like LDA
  
  // Extract and tokenize
  const primaryTokens = tokenizeAndClean(primaryText);
  const secondaryTokens = tokenizeAndClean(secondaryText);
  
  // Use TF-IDF to identify important terms
  const tfidf = new natural.TfIdf();
  tfidf.addDocument(primaryTokens);
  tfidf.addDocument(secondaryTokens);
  
  // Extract top terms as topics
  const primaryTopics = [];
  tfidf.listTerms(0).slice(0, 15).forEach(item => {
    primaryTopics.push({ term: item.term, weight: item.tfidf });
  });
  
  const secondaryTopics = [];
  tfidf.listTerms(1).slice(0, 15).forEach(item => {
    secondaryTopics.push({ term: item.term, weight: item.tfidf });
  });
  
  return { primaryTopics, secondaryTopics };
}

/**
 * Helper function to tokenize and clean text
 * @param {string} text - Input text
 * @returns {Array} - Array of cleaned tokens
 */
function tokenizeAndClean(text) {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text.toLowerCase());
  return removeStopwords(tokens);
}

/**
 * Calculate entity overlap between primary and secondary entities
 * @param {Object} primaryEntities - Primary person's entities
 * @param {Object} secondaryEntities - Secondary person's entities
 * @returns {number} - Overlap score (0-1)
 */
function calculateEntityOverlap(primaryEntities, secondaryEntities) {
  // Flatten entity arrays
  const allPrimaryEntities = [
    ...primaryEntities.people,
    ...primaryEntities.places,
    ...primaryEntities.organizations,
    ...primaryEntities.topics
  ];
  
  const allSecondaryEntities = [
    ...secondaryEntities.people,
    ...secondaryEntities.places,
    ...secondaryEntities.organizations,
    ...secondaryEntities.topics
  ];
  
  // Find overlapping entities
  const overlapping = allPrimaryEntities.filter(entity => 
    allSecondaryEntities.some(secEntity => 
      secEntity.toLowerCase() === entity.toLowerCase()
    )
  );
  
  // Calculate Jaccard similarity
  const unionSize = new Set([...allPrimaryEntities, ...allSecondaryEntities]).size;
  return overlapping.length / unionSize;
}

/**
 * Calculate topic similarity
 * @param {Array} primaryTopics - Primary person's topics
 * @param {Array} secondaryTopics - Secondary person's topics
 * @returns {number} - Similarity score (0-1)
 */
function calculateTopicSimilarity(primaryTopics, secondaryTopics) {
  const primaryTerms = primaryTopics.map(t => t.term);
  const secondaryTerms = secondaryTopics.map(t => t.term);
  
  // Find overlapping topics
  const overlapping = primaryTerms.filter(term => 
    secondaryTerms.includes(term)
  );
  
  // Calculate cosine similarity (simplified)
  return overlapping.length / Math.sqrt(primaryTerms.length * secondaryTerms.length);
}

/**
 * Generate explanation for the relevance score
 * @param {Object} primaryEntities - Primary entities
 * @param {Object} secondaryEntities - Secondary entities
 * @param {Array} primaryTopics - Primary topics
 * @param {Array} secondaryTopics - Secondary topics
 * @param {number} entityOverlap - Entity overlap score
 * @param {number} topicSimilarity - Topic similarity score
 * @param {number} relevanceScore - Final relevance score
 * @returns {string} - Explanation text
 */
function generateExplanation(
  primaryEntities, 
  secondaryEntities, 
  primaryTopics, 
  secondaryTopics,
  entityOverlap,
  topicSimilarity,
  relevanceScore
) {
  // Find shared entities
  const sharedPeople = primaryEntities.people.filter(p => 
    secondaryEntities.people.includes(p)
  );
  
  const sharedOrgs = primaryEntities.organizations.filter(o => 
    secondaryEntities.organizations.includes(o)
  );
  
  const sharedPlaces = primaryEntities.places.filter(p => 
    secondaryEntities.places.includes(p)
  );
  
  const sharedTopics = primaryTopics
    .map(t => t.term)
    .filter(term => secondaryTopics.some(st => st.term === term));
  
  let explanation = '';
  
  if (relevanceScore > 0.7) {
    explanation = 'High relevance detected. ';
  } else if (relevanceScore > 0.3) {
    explanation = 'Moderate relevance detected. ';
  } else {
    explanation = 'Low relevance detected. ';
  }
  
  if (sharedPeople.length > 0) {
    explanation += `Both texts mention the same people: ${sharedPeople.join(', ')}. `;
  }
  
  if (sharedOrgs.length > 0) {
    explanation += `Both texts mention the same organizations: ${sharedOrgs.join(', ')}. `;
  }
  
  if (sharedPlaces.length > 0) {
    explanation += `Both texts mention the same places: ${sharedPlaces.join(', ')}. `;
  }
  
  if (sharedTopics.length > 0) {
    explanation += `Both texts share topics related to: ${sharedTopics.join(', ')}. `;
  }
  
  explanation += `Entity overlap: ${(entityOverlap * 100).toFixed(1)}%. `;
  explanation += `Topic similarity: ${(topicSimilarity * 100).toFixed(1)}%.`;
  
  return explanation;
}