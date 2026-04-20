import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Resolve API key: user's personal key → platform fallback → error
    const userRecord = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { geminiApiKey: true },
    });
    const apiKey = userRecord?.geminiApiKey ?? process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'No Gemini API key configured. Please add your key in Settings.' },
        { status: 400 }
      );
    }
    const genAI = new GoogleGenAI({ apiKey });

    const body = await request.json();
    const {
      title,
      brief,
      platform,
      contentGoal,
      targetAudience,
      customAudience,
      writingTone,
      contentLength,
      customWordCount,
      outputLanguage,
      ctaType,
      hashtagPreference,
      customHashtags,
      keywords,
      wordsToAvoid,
      negativeConstraints,
      emojiEnabled,
      image,
    } = body;

    // Build word count instruction
    let wordCountInstruction = '';
    if (contentLength === 'Short') wordCountInstruction = '50–80 words';
    else if (contentLength === 'Medium') wordCountInstruction = '80–150 words';
    else if (contentLength === 'Long') wordCountInstruction = '150–300 words';
    else if (contentLength === 'Extended') wordCountInstruction = '300–500 words';
    else if (contentLength === 'Custom' && customWordCount)
      wordCountInstruction = `exactly ${customWordCount} words`;

    // Build language instruction
    let langInstruction = 'English';
    if (outputLanguage === 'Myanmar (Burmese)') langInstruction = 'Myanmar (Burmese)';
    else if (outputLanguage === 'English + Myanmar')
      langInstruction = 'a mix of English and Myanmar (Burmese)';
    else if (outputLanguage === 'Business English') langInstruction = 'formal Business English';

    const audience = customAudience
      ? `${targetAudience} - specifically: ${customAudience}`
      : targetAudience;

    // Build constraints
    const constraints: string[] = [];
    if (negativeConstraints) {
      const items =
        typeof negativeConstraints === 'string'
          ? negativeConstraints.split(',')
          : negativeConstraints;
      constraints.push(...items.map((c: string) => `- ${c.trim()}`));
    }
    if (wordsToAvoid) constraints.push(`- Avoid these words/phrases: ${wordsToAvoid}`);

    const hashtagInstr = customHashtags
      ? `Include these specific hashtags: ${customHashtags}`
      : hashtagPreference === 'None' || !hashtagPreference
        ? 'Do not include hashtags'
        : hashtagPreference === 'Minimal (1–3)'
          ? 'Include 1–3 relevant hashtags'
          : hashtagPreference === 'Standard (3–5)'
            ? 'Include 3–5 relevant hashtags'
            : 'Include 5–8 relevant hashtags';

    const prompt = `You are an expert social media content writer. Generate a high-quality ${platform} post with these specifications:

Title/Topic: ${title}
Brief/Context: ${brief}
Platform: ${platform}
Content Goal: ${contentGoal}
Target Audience: ${audience}
Writing Tone: ${writingTone}
Word Count: ${wordCountInstruction}
Output Language: ${langInstruction}
${ctaType && ctaType !== 'No CTA' ? `Call-to-Action: ${ctaType}` : 'No CTA required'}
Hashtags: ${hashtagInstr}
${keywords ? `Keywords to Include: ${keywords}` : ''}
Emojis: ${emojiEnabled ? 'Use relevant emojis appropriately' : 'Do not use emojis'}
${image ? '\nImage Context: Refer to the provided image for visual details, products, and branding.' : ''}
${constraints.length > 0 ? `\nConstraints:\n${constraints.join('\n')}` : ''}

Generate ONLY the content text, no explanations or meta-commentary. The content should be ready to post directly.`;

    const response = await genAI.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview', // Switching to stable 2.0 Flash (2.5 is not yet globally stable)
      contents: image ? [prompt, { inlineData: image }] : prompt,
    });
    const text = response.text;

    return NextResponse.json({ content: text });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
