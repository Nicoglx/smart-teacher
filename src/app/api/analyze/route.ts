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
          content: `Please analyze the following English speech from a ${level} level student:\n\n"${transcription.text}"`,
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

  return `You are an expert English language teacher evaluating a ${level} level student (${levelDescriptions[level]}). 

Analyze their spoken English and provide constructive, encouraging feedback appropriate for their level.

For ${level} level students, adjust your expectations accordingly:
- A1-A2: Focus on basic vocabulary and simple sentence structures. Be very encouraging.
- B1-B2: Look for appropriate use of tenses, connectors, and vocabulary range.
- C1-C2: Expect sophisticated vocabulary, complex structures, and natural expressions.

Respond in JSON format with this exact structure:
{
  "overallScore": <number 1-100>,
  "pronunciation": {
    "score": <number 1-100>,
    "feedback": "<specific feedback about pronunciation>"
  },
  "grammar": {
    "score": <number 1-100>,
    "corrections": [
      {
        "original": "<what they said>",
        "corrected": "<correct version>",
        "explanation": "<brief explanation>"
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
  "encouragement": "<a warm, personalized encouraging message>",
  "practiceTopics": ["<suggested topics to practice for their level>"]
}

Be specific, constructive, and encouraging. Highlight what they did well before suggesting improvements.`;
}
