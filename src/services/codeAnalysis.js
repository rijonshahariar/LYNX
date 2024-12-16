const RAPIDAPI_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function analyzeCode(code, language) {
  try {
    const response = await fetch('https://chatgpt-42.p.rapidapi.com/gpt4', {
      method: 'POST',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: `Analyze the following ${language} code and only provide its time complexity, space complexity in bigO format and in with a single '\n':\n\n${code}`
          }
        ],
        web_access: false
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const result = await response.json();
    //console.log('API Response:', result); // Debug log

    if (result && result.result) {
      const complexities = result.result.split('\n');
      return {
        timeComplexity: complexities[0].trim(),
        spaceComplexity: complexities[1].trim(),
        explanation: result.result
      };
    }

    return {
      timeComplexity: "Could not determine",
      spaceComplexity: "Could not determine",
      explanation: "The analysis service did not provide a proper response."
    };

  } catch (error) {
    console.error('Error analyzing code:', error);
    return {
      timeComplexity: "Error occurred",
      spaceComplexity: "Error occurred",
      explanation: "Failed to analyze code complexity: " + error.message
    };
  }
} 