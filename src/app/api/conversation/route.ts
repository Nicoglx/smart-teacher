import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CEFRLevel, ConversationMessage } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Velocidad del habla según el nivel (0.25 a 4.0, donde 1.0 es normal)
const SPEECH_SPEED: Record<CEFRLevel, number> = {
  A1: 0.85,  // Más lento para principiantes
  A2: 0.88,
  B1: 0.92,
  B2: 0.96,
  C1: 1.0,   // Velocidad normal para avanzados
  C2: 1.0,
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const level = formData.get('level') as CEFRLevel;
    const historyJson = formData.get('history') as string;
    
    const history: ConversationMessage[] = historyJson ? JSON.parse(historyJson) : [];

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Step 1: Transcribe user's audio using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
    });

    if (!transcription.text || transcription.text.trim() === '') {
      return NextResponse.json(
        { error: 'No speech detected in the audio' },
        { status: 400 }
      );
    }

    // Step 2: Generate conversational response with corrections using GPT-4
    const systemPrompt = getConversationSystemPrompt(level);
    
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: transcription.text },
    ];

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.8,
      max_tokens: 400,
    });

    const responseText = chatResponse.choices[0].message.content || '';

    // Step 3: Convert response to speech using TTS with adjusted speed
    const speechSpeed = SPEECH_SPEED[level] || 1.0;
    
    const speechResponse = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: responseText,
      response_format: 'mp3',
      speed: speechSpeed,
    });

    // Convert audio to base64
    const audioBuffer = await speechResponse.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({
      transcription: transcription.text,
      response: responseText,
      audioBase64,
    });
  } catch (error) {
    console.error('Error in conversation:', error);
    return NextResponse.json(
      { error: 'Failed to process conversation. Please try again.' },
      { status: 500 }
    );
  }
}

function getConversationSystemPrompt(level: CEFRLevel): string {
  const levelGuidance: Record<CEFRLevel, string> = {
    A1: `For A1 students:
- Use very simple vocabulary and short sentences
- Correct ALL errors gently, as they are still learning basics
- Provide the correct form clearly: "We say 'I am happy', not 'I is happy'"
- Speak slowly and repeat key phrases
- Use pauses between ideas (use commas and periods)`,
    A2: `For A2 students:
- Use simple but natural language
- Correct common grammar mistakes (verb tenses, articles, prepositions)
- Give brief explanations: "Remember, we use 'went' for past tense of 'go'"
- Encourage their progress
- Keep sentences short and clear`,
    B1: `For B1 students:
- Use everyday vocabulary and some idiomatic expressions
- Correct errors in tense usage, word order, and common mistakes
- Offer alternatives: "That's understandable, but a more natural way would be..."
- Help them sound more natural
- Use moderate sentence length`,
    B2: `For B2 students:
- Use rich, natural language
- Focus on nuanced corrections (subtle grammar, word choice, collocations)
- Suggest more sophisticated alternatives when appropriate
- Point out when something is "correct but unnatural"`,
    C1: `For C1 students:
- Speak naturally with advanced vocabulary
- Only correct subtle errors or awkward phrasing
- Suggest more elegant or precise expressions
- Focus on native-like fluency and style`,
    C2: `For C2 students:
- Speak as you would with a native speaker
- Only mention very subtle issues or stylistic improvements
- Discuss nuances in meaning and register
- Treat them as near-native speakers`,
  };

  return `You are a friendly, supportive English conversation partner and teacher having a natural conversation with a ${level} level student.

YOUR TEACHING STYLE - VERY IMPORTANT:
You seamlessly blend corrections INTO your conversational responses. You are like a helpful friend who happens to be an English teacher - you chat naturally while gently correcting mistakes.

${levelGuidance[level]}

HOW TO STRUCTURE YOUR RESPONSES:
1. First, acknowledge what they said and respond naturally to continue the conversation
2. If there were errors, weave corrections naturally into your response
3. Keep the conversation flowing - always end with a question or prompt

CORRECTION EXAMPLES:

Example 1 (A1-A2 student says "Yesterday I go to the park"):
"Oh nice! You WENT to the park yesterday - remember, 'go' becomes 'went' in the past! 🙂 What did you do there? Did you go alone or with friends?"

Example 2 (B1 student says "I am agree with you"):
"I'm glad we're on the same page! By the way, in English we just say 'I agree' without 'am' - it's a common mistake! So, what else do you think about this topic?"

Example 3 (B2 student says "I made a party last weekend"):
"Sounds fun! Quick note: we say 'threw a party' or 'had a party' rather than 'made a party' in English. So tell me more - what was the occasion? Who came?"

Example 4 (C1 student says "It's a really good film, I think it worth watching"):
"I totally agree, it's fantastic! Just a small thing - we'd say 'it's worth watching' or 'I think it's worth watching'. Anyway, what was your favorite scene?"

IMPORTANT RULES:
- ALWAYS respond in English (you're helping them practice!)
- Be warm, encouraging, and conversational - NOT like a strict teacher
- Make corrections feel natural, not like a lecture
- Use phrases like: "By the way...", "Quick tip:", "Just so you know...", "A more natural way would be..."
- If they made NO errors, just have a normal conversation and praise their English naturally
- Keep responses concise (3-5 sentences) so conversation flows naturally
- ALWAYS ask a follow-up question to keep them talking
- Use occasional emojis to keep it friendly 😊
${level === 'A1' || level === 'A2' ? '- Use SHORT sentences with CLEAR pauses between them' : ''}

You're their conversation buddy who helps them improve naturally through practice!`;
}
