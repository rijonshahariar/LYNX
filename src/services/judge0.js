const RAPIDAPI_KEY = 'f743bf2041msh4894c15dcbdbbd6p1dc678jsn4bfff64d2a1d';

async function getSubmission(tokenId) {
  const url = `https://judge0-ce.p.rapidapi.com/submissions/${tokenId}?base64_encoded=true&fields=*`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    },
  };

  const response = await fetch(url, options);
  const result = await response.text();
  return JSON.parse(result);
}

export async function makeSubmission({ code, language, callback, stdin }) {
  const url = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false&fields=*';
  
  // Prepare the submission data
  const submissionData = {
    source_code: btoa(unescape(encodeURIComponent(code))),
    language_id: parseInt(language),
    stdin: stdin ? btoa(unescape(encodeURIComponent(stdin))) : '',
    expected_output: null
  };

  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': "judge0-ce.p.rapidapi.com",
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(submissionData)
  };

  try {
    callback({ apiStatus: "loading" });
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.text();
    const data = JSON.parse(result);
    
    if (!data.token) {
      throw new Error('No submission token received');
    }

    let statusCode = 1;
    let apiSubmissionResult;
    let retries = 0;
    const maxRetries = 10;

    while ((statusCode === 1 || statusCode === 2) && retries < maxRetries) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        apiSubmissionResult = await getSubmission(data.token);
        statusCode = apiSubmissionResult.status?.id || 0;
        retries++;
      } catch (error) {
        console.error('Status check error:', error);
        if (retries >= maxRetries) {
          callback({
            apiStatus: "error",
            message: "Maximum retries reached. Please try again.",
          });
          return;
        }
      }
    }

    if (apiSubmissionResult) {
      callback({ apiStatus: "success", data: apiSubmissionResult });
    }
  } catch (error) {
    console.error('Submission error:', error);
    callback({
      apiStatus: "error",
      message: error.message || 'Failed to execute code',
    });
  }
} 