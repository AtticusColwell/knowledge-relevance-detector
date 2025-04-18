import { useState, useEffect } from 'react';

const RelevanceVisualizer = ({ result }) => {
  const [sharedEntities, setSharedEntities] = useState([]);
  const [uniquePrimaryEntities, setUniquePrimaryEntities] = useState([]);
  const [uniqueSecondaryEntities, setUniqueSecondaryEntities] = useState([]);
  
  useEffect(() => {
    if (result) {
      // This is a simplified version - in a real app, you'd extract this data from the algorithm
      // For demo purposes, we'll parse the explanation to get entities
      const explanation = result.explanation;
      
      // Extract shared entities from explanation
      let shared = [];
      const entitiesMatch = explanation.match(/same entities: ([^.]+)/);
      const keywordsMatch = explanation.match(/share keywords related to: ([^.]+)/);
      
      if (entitiesMatch) shared = [...shared, ...entitiesMatch[1].split(', ')];
      if (keywordsMatch) shared = [...shared, ...keywordsMatch[1].split(', ')];
      
      setSharedEntities(shared);
      
      // For demo, generate some fake unique entities
      setUniquePrimaryEntities(['Project X', 'Annual report', 'Budget review']);
      setUniqueSecondaryEntities(['Team meeting', 'Client feedback', 'Marketing plan']);
    }
  }, [result]);
  
  if (!result) return null;
  
  // Safely extract percentages with fallbacks
  const getEntityOverlapPercentage = () => {
    const match = result.explanation.match(/Entity overlap: ([^%]+)/);
    return match && match[1] ? parseFloat(match[1]) : 0;
  };
  
  const getKeywordSimilarityPercentage = () => {
    const match = result.explanation.match(/Keyword similarity: ([^%]+)/);
    return match && match[1] ? parseFloat(match[1]) : 0;
  };
  
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">Knowledge Overlap Visualization</h3>
      
      <div className="flex justify-between items-start">
        <div className="w-1/3 bg-blue-50 p-4 rounded-md">
          <h4 className="font-medium text-blue-800 mb-2">Primary Person&apos;s Unique Knowledge</h4>
          <ul className="list-disc pl-5">
            {uniquePrimaryEntities.map((entity, index) => (
              <li key={`primary-${index}`} className="text-sm mb-1">{entity}</li>
            ))}
          </ul>
        </div>
        
        <div className="w-1/3 bg-purple-50 p-4 rounded-md mx-2">
          <h4 className="font-medium text-purple-800 mb-2">Shared Knowledge</h4>
          <ul className="list-disc pl-5">
            {sharedEntities.map((entity, index) => (
              <li key={`shared-${index}`} className="text-sm mb-1">{entity}</li>
            ))}
            {sharedEntities.length === 0 && (
              <li className="text-sm italic text-gray-500">No shared entities detected</li>
            )}
          </ul>
        </div>
        
        <div className="w-1/3 bg-green-50 p-4 rounded-md">
          <h4 className="font-medium text-green-800 mb-2">Secondary Person&apos;s Unique Knowledge</h4>
          <ul className="list-disc pl-5">
            {uniqueSecondaryEntities.map((entity, index) => (
              <li key={`secondary-${index}`} className="text-sm mb-1">{entity}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-6 bg-gray-50 p-4 rounded-md">
        <h4 className="font-medium mb-2">Relevance Metrics</h4>
        <div className="flex justify-between">
          <div>
            <p className="text-sm mb-1">Entity Overlap</p>
            <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full" 
                style={{ width: `${getEntityOverlapPercentage()}%` }}
              />
            </div>
          </div>
          
          <div>
            <p className="text-sm mb-1">Keyword Similarity</p>
            <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-600 rounded-full" 
                style={{ width: `${getKeywordSimilarityPercentage()}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {result.isRelevant && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm">
            <span className="font-bold">Recommendation:</span> The information from the primary person 
            should be shared with the secondary person as it&apos;s relevant to their work context.
          </p>
        </div>
      )}
    </div>
  );
};

export default RelevanceVisualizer;