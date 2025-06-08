import { HfInference } from '@huggingface/inference';

const HF_TOKEN = process.env.REACT_APP_HF_TOKEN;
if (!HF_TOKEN) {
  console.error('Hugging Face token is missing! Please add REACT_APP_HF_TOKEN to your .env file');
}

const hf = new HfInference(HF_TOKEN);

// Model listesi - sırayla denenecek (daha erişilebilir modeller)
const MODELS = [
  'mistralai/Mistral-7B-Instruct-v0.3',
  'deepseek-ai/DeepSeek-V3',
  'Qwen/Qwen2.5-7B-Instruct',
  'facebook/opt-1.3b',
  'facebook/opt-2.7b',
  'EleutherAI/gpt-neo-2.7B',
  'EleutherAI/gpt-neo-1.3B',
  'bigscience/bloom-560m',
  'bigscience/bloom-1b7'
];

let currentModelIndex = 0;

// Kredi hatası kontrolü
const isCreditError = (error) => {
  return error.message && (
    error.message.includes('exceeded your monthly included credits') ||
    error.message.includes('rate limit') ||
    error.message.includes('quota')
  );
};

// Bir sonraki modele geç
const getNextModel = () => {
  currentModelIndex = (currentModelIndex + 1) % MODELS.length;
  return MODELS[currentModelIndex];
};

export async function analyzeText(text) {
  if (!HF_TOKEN) {
    throw new Error('Hugging Face token is missing! Please add REACT_APP_HF_TOKEN to your .env file');
  }

  let attempts = 0;
  const maxAttempts = MODELS.length;

  while (attempts < maxAttempts) {
    try {
      const currentModel = MODELS[currentModelIndex];
      console.log(`Attempting with model: ${currentModel}`);

      const prompt = `Analyze the following text to understand the user's unique writing style. Focus on these aspects:
1.  Sentence Structure & Length: Are sentences short, long, complex, or simple? Does the user use varied sentence structures?
2.  Vocabulary & Diction: What kind of words does the user typically use (formal, informal, technical, descriptive, common)? Are there recurring phrases or expressions?
3.  Tone & Voice: Is the tone formal, informal, conversational, academic, humorous, serious, optimistic, pessimistic? What is the overall voice?
4.  Emphasis & Pacing: How does the user emphasize certain points (e.g., strong verbs, bolding, repetition, short sentences)? What is the rhythm or flow of the writing?
5.  Emotional Nuances: Are there subtle emotional undertones? How are emotions conveyed?
6.  Argumentation/Flow: How does the user structure arguments or convey information? Is it direct, narrative, persuasive?
7.  Key Characteristics for Mimicry: Based on the above, what are the most crucial elements to mimic to make a new text sound like it was written by this user? (Provide 3-5 bullet points for this section)
8.  English Proficiency: What is the user's English level? (beginner, intermediate, advanced). Give a short justification for your assessment.

Text to analyze:
${text}

Provide the analysis in a concise, bullet-point format, **without using bold markdown for headers (e.g., no **Sentence Structure:**) or leading asterisk symbols for list items (e.g., no * item).** Keep each point brief and focused.`;

      const response = await fetch(
        `https://api-inference.huggingface.co/models/${currentModel}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 500,
              temperature: 0.7,
              top_p: 0.9,
              repetition_penalty: 1.2,
            },
          }),
        }
      );

      if (!response.ok) {
        attempts++;
        currentModelIndex = (currentModelIndex + 1) % MODELS.length;
        continue;
      }

      const data = await response.json();
      return data[0].generated_text;
    } catch (error) {
      attempts++;
      currentModelIndex = (currentModelIndex + 1) % MODELS.length;
      if (attempts >= maxAttempts) throw error;
    }
  }
}

export async function generateText(prompt, style) {
  if (!HF_TOKEN) {
    throw new Error('Hugging Face token is missing! Please add REACT_APP_HF_TOKEN to your .env file');
  }

  let attempts = 0;
  const maxAttempts = MODELS.length;

  while (attempts < maxAttempts) {
    try {
      const currentModel = MODELS[currentModelIndex];
      console.log(`Attempting with model: ${currentModel}`);

    const response = await hf.textGeneration({
        model: currentModel,
        inputs: prompt,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.8,
        top_p: 0.9,
        repetition_penalty: 1.2,
        return_full_text: false,
        do_sample: true,
          stop: ["</s>"]
      }
    });

      return response.generated_text.trim();

  } catch (error) {
      console.error(`Error with model ${MODELS[currentModelIndex]}:`, error);
      
      if (isCreditError(error)) {
        console.log('Credit limit reached, trying next model...');
        getNextModel();
        attempts++;
        continue;
      }
      
    throw error;
  }
  }

  throw new Error('All models have reached their credit limits. Please try again later.');
} 