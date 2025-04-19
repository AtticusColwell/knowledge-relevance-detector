import { useState, useEffect } from 'react';

const RelevanceVisualizer = ({ 
  result, 
  primaryEntities, 
  secondaryEntities,
  showSemanticSimilarity = true // New prop to control display
}) => {
  const [sharedEntities, setSharedEntities] = useState([]);
  const [sharedKeywords, setSharedKeywords] = useState([]);
  const [uniquePrimaryEntities, setUniquePrimaryEntities] = useState([]);
  const [uniqueSecondaryEntities, setUniqueSecondaryEntities] = useState([]);
  
  useEffect(() => {
    if (result && primaryEntities && secondaryEntities) {
      // Find shared entities by comparing arrays
      const shared = primaryEntities.filter(entity =>
        secondaryEntities.some(secEntity => 
          secEntity.toLowerCase() === entity.toLowerCase()
        )
      );
      setSharedEntities(shared);
      
      // Find unique entities
      const uniquePrimary = primaryEntities.filter(entity => 
        !secondaryEntities.some(secEntity => 
          secEntity.toLowerCase() === entity.toLowerCase()
        )
      );
      setUniquePrimaryEntities(uniquePrimary);
      
      const uniqueSecondary = secondaryEntities.filter(entity => 
        !primaryEntities.some(primEntity => 
          primEntity.toLowerCase() === entity.toLowerCase()
        )
      );
      setUniqueSecondaryEntities(uniqueSecondary);
      
      // Extract shared keywords from explanation
      const keywordsMatch = result.explanation.match(/share keywords related to: ([^.]+)/);
      if (keywordsMatch) {
        setSharedKeywords(keywordsMatch[1].split(', ').filter(k => k !== '...'));
      }
    }
  }, [result, primaryEntities, secondaryEntities]);
  
  if (!result) return null;
  
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
            {uniquePrimaryEntities.length === 0 && (
              <li className="text-sm italic text-gray-500">No unique entities detected</li>
            )}
          </ul>
        </div>
        
        <div className="w-1/3 bg-purple-50 p-4 rounded-md mx-2">
          <h4 className="font-medium text-purple-800 mb-2">Shared Knowledge</h4>
          <div>
            <p className="text-sm font-medium mb-1">Entities:</p>
            <ul className="list-disc pl-5">
              {sharedEntities.map((entity, index) => (
                <li key={`shared-entity-${index}`} className="text-sm mb-1">{entity}</li>
              ))}
              {sharedEntities.length === 0 && (
                <li className="text-sm italic text-gray-500">No shared entities detected</li>
              )}
            </ul>
          </div>
          
          {sharedKeywords.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium mb-1">Keywords:</p>
              <ul className="list-disc pl-5">
                {sharedKeywords.map((keyword, index) => (
                  <li key={`shared-keyword-${index}`} className="text-sm mb-1">{keyword}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="w-1/3 bg-green-50 p-4 rounded-md">
          <h4 className="font-medium text-green-800 mb-2">Secondary Person&apos;s Unique Knowledge</h4>
          <ul className="list-disc pl-5">
            {uniqueSecondaryEntities.map((entity, index) => (
              <li key={`secondary-${index}`} className="text-sm mb-1">{entity}</li>
            ))}
            {uniqueSecondaryEntities.length === 0 && (
              <li className="text-sm italic text-gray-500">No unique entities detected</li>
            )}
          </ul>
        </div>
      </div>
      
      <div className="mt-6 bg-gray-50 p-4 rounded-md">
        <h4 className="font-medium mb-2">Relevance Metrics</h4>
        <div className="flex justify-between">
          <div className={showSemanticSimilarity ? "w-1/3" : "w-1/2"}>
            <p className="text-sm mb-1">Entity Overlap</p>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full" 
                style={{ width: `${(result.components?.entityOverlap || 0) * 100}%` }}
              />
            </div>
            <p className="text-xs text-right mt-1">{((result.components?.entityOverlap || 0) * 100).toFixed(1)}%</p>
          </div>
          
          <div className={showSemanticSimilarity ? "w-1/3 mx-2" : "w-1/2 ml-2"}>
            <p className="text-sm mb-1">Keyword Similarity</p>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-600 rounded-full" 
                style={{ width: `${(result.components?.keywordOverlap || 0) * 100}%` }}
              />
            </div>
            <p className="text-xs text-right mt-1">{((result.components?.keywordOverlap || 0) * 100).toFixed(1)}%</p>
          </div>
          
          {showSemanticSimilarity && (
            <div className="w-1/3">
              <p className="text-sm mb-1">Semantic Similarity</p>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600 rounded-full" 
                  style={{ width: `${(result.components?.semanticSimilarity || 0) * 100}%` }}
                />
              </div>
              <p className="text-xs text-right mt-1">{((result.components?.semanticSimilarity || 0) * 100).toFixed(1)}%</p>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <p className="text-sm mb-1">Overall Relevance Score</p>
          <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                result.score > 0.7 ? 'bg-green-600' : 
                result.score > (showSemanticSimilarity ? 0.35 : 0.3) ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${result.score * 100}%` }}
            />
          </div>
          <p className="text-xs text-right mt-1">{(result.score * 100).toFixed(1)}%</p>
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
      
      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <h4 className="font-medium mb-2">Analysis Explanation</h4>
        <p className="text-sm">{result.explanation}</p>
      </div>
    </div>
  );
};

export default RelevanceVisualizer;