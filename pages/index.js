import { useState } from 'react';
import Head from 'next/head';
import RelevanceVisualizer from '../components/RelevanceVisualizer';
import SampleData from '../components/SampleData';

export default function Home() {
  const [primaryText, setPrimaryText] = useState('');
  const [secondaryText, setSecondaryText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [primaryEntities, setPrimaryEntities] = useState([]);
  const [secondaryEntities, setSecondaryEntities] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Call the API route instead of directly using the functions
      const response = await fetch('/api/calculate-relevance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          primaryText,
          secondaryText
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to calculate relevance');
      }
      
      const data = await response.json();
      
      // Set state with the API response
      setResult(data.result);
      setPrimaryEntities(data.primaryEntities);
      setSecondaryEntities(data.secondaryEntities);
    } catch (error) {
      console.error('Error calculating relevance:', error);
      setResult({ 
        isRelevant: false, 
        score: 0, 
        explanation: `An error occurred: ${error.message}`,
        components: {
          keywordOverlap: 0,
          entityOverlap: 0,
          semanticSimilarity: 0
        }
      });
      setPrimaryEntities([]);
      setSecondaryEntities([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleApplySample = (primary, secondary) => {
    setPrimaryText(primary);
    setSecondaryText(secondary);
    setResult(null);
    setPrimaryEntities([]);
    setSecondaryEntities([]);
  };

  // Rest of your component remains the same
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Knowledge Relevance Detector</title>
        <meta name="description" content="Detect if information is relevant between two people" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        {/* Component content stays the same */}
        <h1 className="text-3xl font-bold text-center mb-8">
          Knowledge Relevance Detector
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <SampleData onApplySample={handleApplySample} />
          
          <form onSubmit={handleSubmit}>
            {/* Form content stays the same */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="primaryText" className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Person&apos;s Knowledge (What they know)
                </label>
                <textarea
                  id="primaryText"
                  value={primaryText}
                  onChange={(e) => setPrimaryText(e.target.value)}
                  rows={10}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter text representing what the primary person knows..."
                  required
                />
              </div>
              
              <div>
                <label htmlFor="secondaryText" className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Person&apos;s Knowledge (What they know)
                </label>
                <textarea
                  id="secondaryText"
                  value={secondaryText}
                  onChange={(e) => setSecondaryText(e.target.value)}
                  rows={10}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter text representing what the secondary person knows..."
                  required
                />
              </div>
            </div>
            
            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Analyzing with AI...' : 'Analyze Relevance'}
              </button>
            </div>
          </form>
          
          {result && (
            <div className="mt-8">
              <div className={`p-4 rounded-md ${result.isRelevant ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <h2 className="text-xl font-semibold mb-2">
                  Result: {result.isRelevant ? 'Relevant' : 'Not Relevant'}
                </h2>
                <p className="mb-2">
                  <span className="font-medium">Relevance Score:</span> {(result.score * 100).toFixed(1)}%
                </p>
                <div>
                  <span className="font-medium">Explanation:</span>
                  <p className="mt-1">{result.explanation}</p>
                </div>
                
                {result.isRelevant && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded">
                    <p className="font-medium text-blue-800">
                      Recommendation: The primary person should inform the secondary person about this information.
                    </p>
                  </div>
                )}
              </div>
              
              <RelevanceVisualizer 
                result={result} 
                primaryEntities={primaryEntities}
                secondaryEntities={secondaryEntities}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="container mx-auto px-4 py-6 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Knowledge Relevance Detector
      </footer>
    </div>
  );
}