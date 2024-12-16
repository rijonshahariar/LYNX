const languageCodeMap = {
  cpp: 54,
  python: 92,
  javascript: 93,
  java: 91,
};

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = import.meta.env.VITE_RAPIDAPI_HOST;

async function getSubmission(tokenId) {
  const url = `https://${RAPIDAPI_HOST}/submissions/${tokenId}?base64_encoded=true&fields=*`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
    },
  };

  const response = await fetch(url, options);
  const result = await response.json();
  return result;
}

export async function makeSubmission({ code, language, callback, stdin }) {
  const url = `https://${RAPIDAPI_HOST}/submissions?base64_encoded=true&wait=false&fields=*`;
  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      language_id: languageCodeMap[language],
      source_code: btoa(code),
      stdin: btoa(stdin),
    }),
  };

  try {
    callback({ apiStatus: "loading" });
    const response = await fetch(url, options);
    const result = await response.json();
    const tokenId = result.token;
    
    let statusCode = 1; // in queue
    let apiSubmissionResult;
    
    while (statusCode === 1 || statusCode === 2) {
      try {
        apiSubmissionResult = await getSubmission(tokenId);
        statusCode = apiSubmissionResult.status.id;
      } catch (error) {
        callback({
          apiStatus: "error",
          message: JSON.stringify(error),
        });
        return;
      }
    }

    if (apiSubmissionResult) {
      callback({ apiStatus: "success", data: apiSubmissionResult });
    }
  } catch (error) {
    callback({
      apiStatus: "error",
      message: JSON.stringify(error),
    });
  }
} 