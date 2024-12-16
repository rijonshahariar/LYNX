// Define our supported languages with their IDs
const SUPPORTED_LANGUAGES = [
  { id: 54, name: 'C++' },
  { id: 92, name: 'Python' },
  { id: 93, name: 'JavaScript' },
  { id: 91, name: 'Java' }
];

export async function fetchLanguages() {
  try {
    // Return our supported languages directly
    return SUPPORTED_LANGUAGES;
  } catch (error) {
    console.error('Error fetching languages:', error);
    // Return the same supported languages as fallback
    return SUPPORTED_LANGUAGES;
  }
} 