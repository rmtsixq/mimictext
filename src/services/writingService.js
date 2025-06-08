import { getLatestAnalysis } from './userAnalysisService';

const WRITING_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3';
const WRITING_API_KEY = process.env.REACT_APP_HUGGINGFACE_API_KEY_WRITING;

export async function generateText(prompt, userId) {
  try {
    // Check if API key is available
    if (!WRITING_API_KEY) {
      throw new Error('Hugging Face API key is missing. Please add REACT_APP_HUGGINGFACE_API_KEY_WRITING to your .env file');
    }

    // Get user's latest writing analysis
    const latestAnalysis = await getLatestAnalysis(userId);
    if (!latestAnalysis) {
      throw new Error('No writing analysis found for the user');
    }

    // Extract English proficiency if present
    let englishLevel = '';
    const match = latestAnalysis.analysis.match(/English Proficiency: ([^\n]+)(?:\n|$)/i);
    if (match) {
      englishLevel = match[1].trim();
    }

    // Format the prompt with system and user messages
    const formattedPrompt = `<s>[INST] <<SYS>>\nYou are a writing assistant that mimics the user's writing style while following these specific guidelines:\n\n1. Write in clear, direct English - no beating around the bush\n2. Include specific examples and numbers when relevant (e.g., \"We achieved 20% conversion with X campaign\")\n3. Share personal experiences when appropriate (\"When I tried this, I got this result...\")\n4. Use simple, natural language - avoid fancy words and empty embellishments\n5. Vary sentence structures - avoid repetitive patterns\n6. Provide clear, actionable answers\n7. Create logical flow between sentences\n8. Use up-to-date, accurate information\n9. Write in a natural, human tone\n10. Make the reader feel like they're reading from someone with real experience\n\nBased on the following analysis of the user's writing style:\n${latestAnalysis.analysis}\n\nIMPORTANT: Always respond in English, regardless of the input language.\n${englishLevel ? `Match the user's English proficiency level: ${englishLevel}.` : ''}\nGenerate text that matches this style while following these guidelines.\n<</SYS>>\n\n${prompt} [/INST]</s>`;

    console.log('Sending request to Hugging Face API...');
    const response = await fetch(WRITING_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WRITING_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: formattedPrompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.2,
          return_full_text: false,
          do_sample: true
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API Response:', response.status, response.statusText);
      console.error('Error Data:', errorData);
      throw new Error(
        `Failed to generate text: ${response.status} ${response.statusText}${
          errorData ? ` - ${JSON.stringify(errorData)}` : ''
        }`
      );
    }

    const data = await response.json();
    console.log('API Response Data:', data);

    if (!data || !data[0] || !data[0].generated_text) {
      throw new Error('Invalid response format from API');
    }

    // Clean up the response text
    let generatedText = data[0].generated_text;
    // Remove the prompt from the response if it's included
    if (generatedText.includes(formattedPrompt)) {
      generatedText = generatedText.replace(formattedPrompt, '').trim();
    }
    // Remove any remaining system message markers
    generatedText = generatedText.replace(/\[INST\]|\[\/INST\]|<<SYS>>|<<\/SYS>>/g, '').trim();

    return generatedText;
  } catch (error) {
    console.error('Error generating text:', error);
    throw error;
  }
} 