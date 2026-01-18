import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CEFRLevel, FeedbackResponse } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const level = formData.get('level') as CEFRLevel;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Step 1: Transcribe audio using Whisper
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

    // Step 2: Analyze with GPT-4
    const systemPrompt = getSystemPrompt(level);
    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Please analyze the following English speech from a ${level} level Spanish-speaking student:\n\n"${transcription.text}"`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const analysisContent = analysisResponse.choices[0].message.content;
    if (!analysisContent) {
      throw new Error('No analysis response received');
    }

    const analysis = JSON.parse(analysisContent) as Omit<FeedbackResponse, 'transcription'>;

    const feedback: FeedbackResponse = {
      transcription: transcription.text,
      ...analysis,
    };

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error analyzing audio:', error);
    return NextResponse.json(
      { error: 'Failed to analyze audio. Please try again.' },
      { status: 500 }
    );
  }
}

function getSystemPrompt(level: CEFRLevel): string {
  const levelDescriptions: Record<CEFRLevel, string> = {
    A1: 'absolute beginner who knows basic words and phrases',
    A2: 'elementary learner who can handle simple everyday situations',
    B1: 'intermediate learner who can express opinions on familiar topics',
    B2: 'upper-intermediate learner who can engage in complex conversations',
    C1: 'advanced learner who can express themselves fluently and spontaneously',
    C2: 'near-native speaker who should demonstrate precision and nuance',
  };

  return `You are an expert English language teacher evaluating a ${level} level Spanish-speaking student (${levelDescriptions[level]}). 

Analyze their spoken English and provide constructive, encouraging feedback appropriate for their level.

IMPORTANT: The student is a NATIVE SPANISH SPEAKER. Look for common pronunciation errors that Spanish speakers make:

COMMON PRONUNCIATION ISSUES TO DETECT:
1. **TH sounds**: "think" as "tink/sink", "the" as "de" → Look for words like "tink", "sink" (when context suggests "think"), "de/dis/dat"
2. **V vs B**: "very" as "berry", "have" as "hab" → Look for B where V should be
3. **SH vs CH**: "ship" as "chip", "shoes" as "choose" → Look for confusion between these
4. **Short/Long vowels**: "beach/bitch", "sheet/shit", "ship/sheep" → Critical differences!
5. **Word stress**: Wrong syllable emphasis in longer words
6. **Silent letters**: Pronouncing silent letters or missing them
7. **-ED endings**: "worked" (/t/), "played" (/d/), "wanted" (/ɪd/)
8. **H sound**: Dropping H ("happy" as "appy") or adding it ("is" as "his")
9. **J/Y confusion**: "yes" as "jes"
10. **R sound**: Spanish rolled R instead of English R

The transcription comes from speech recognition - if something seems odd or out of context, it might indicate a pronunciation error. For example:
- "I sink so" → probably "I think so" (TH issue)
- "I'm berry happy" → probably "I'm very happy" (V/B issue)

For ${level} level students, adjust your expectations accordingly:
- A1-A2: Focus on basic vocabulary, simple structures, and major pronunciation issues. Be very encouraging.
- B1-B2: Look for appropriate tenses, connectors, vocabulary range, and noticeable pronunciation issues.
- C1-C2: Expect sophisticated vocabulary, complex structures, natural expressions, and near-native pronunciation.

Respond in JSON format with this exact structure:
{
  "overallScore": <number 1-100>,
  "pronunciation": {
    "score": <number 1-100>,
    "feedback": "<specific feedback about pronunciation issues detected, with tips on how to improve. Mention specific sounds, tongue positions, etc. If transcription shows possible mishearings, explain what they probably meant to say>"
  },
  "grammar": {
    "score": <number 1-100>,
    "corrections": [
      {
        "original": "<what was transcribed - might include pronunciation-caused errors>",
        "corrected": "<correct version - what they probably meant>",
        "explanation": "<explanation - note if this might be a pronunciation issue vs grammar issue>"
      }
    ]
  },
  "vocabulary": {
    "score": <number 1-100>,
    "feedback": "<feedback on word choice and vocabulary range>",
    "suggestions": ["<alternative words or expressions they could use>"]
  },
  "fluency": {
    "score": <number 1-100>,
    "feedback": "<feedback on flow, pace, and naturalness>"
  },
  "encouragement": "<a warm, personalized encouraging message that acknowledges their effort>",
  "practiceTopics": ["<suggested topics or specific sounds to practice for their level>"]
}

Be specific, constructive, and encouraging. Highlight what they did well before suggesting improvements. For pronunciation feedback, give actionable tips (tongue position, mouth shape, etc.).`;
}
