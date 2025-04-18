import { useState } from 'react';

const SAMPLE_DATA = [
  {
    id: 'high-relevance',
    name: 'High Relevance Example',
    primary: `We completed the financial audit for Q2 2025. The audit found that our AWS cloud costs increased by 34% due to the new recommendation engine. Microsoft has approached us for a potential partnership on their Azure platform which could reduce our costs. Sarah Johnson from the product team mentioned we should discuss this at the next board meeting.`,
    secondary: `I'm preparing the Q2 financial review presentation for the board meeting next week. Need to include cost breakdown for all cloud services including AWS. Sarah Johnson said she would provide input on the product roadmap section. Also need to research alternative cloud providers for cost comparison.`,
  },
  {
    id: 'medium-relevance',
    name: 'Medium Relevance Example',
    primary: `The development team has identified a performance issue with the database queries in our recommendation system. The slow queries appear during peak traffic hours (2-4pm) and are affecting page load times. We're considering implementing a caching layer using Redis to mitigate the issue.`,
    secondary: `I'm working on the customer satisfaction report for Q2. Our NPS scores dropped by 3 points in the afternoon hours, with customers mentioning slow loading times as a primary complaint. We should discuss this with the technical team to understand if there are any known performance issues.`,
  },
  {
    id: 'low-relevance',
    name: 'Low Relevance Example',
    primary: `The marketing team just finalized the new campaign for our consumer product line. The focus will be on sustainability and eco-friendly packaging. We've hired a new design agency to help with the creative assets. The campaign launches next month on social media platforms.`,
    secondary: `Our engineering team is working on resolving the critical performance issues in the backend database. We've identified that the query optimization layer needs refactoring. John suggested we might need to upgrade our PostgreSQL instance to handle the increased load from the recommendation engine.`,
  },
];

const SampleData = ({ onApplySample }) => {
  const [expanded, setExpanded] = useState(false);
  
  const handleApplySample = (sample) => {
    onApplySample(sample.primary, sample.secondary);
    setExpanded(false);
  };
  
  return (
    <div className="mb-6">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-5 w-5 mr-1 transition-transform ${expanded ? 'transform rotate-90' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Sample Test Cases
      </button>
      
      {expanded && (
        <div className="mt-3 bg-gray-50 p-4 rounded-md shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Click a sample to load it:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SAMPLE_DATA.map((sample) => (
              <div 
                key={sample.id}
                onClick={() => handleApplySample(sample)}
                className="bg-white p-3 rounded-md border border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors"
              >
                <h4 className="font-medium text-blue-800 mb-1">{sample.name}</h4>
                <p className="text-xs text-gray-500 truncate">{sample.primary.substring(0, 50)}...</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SampleData;