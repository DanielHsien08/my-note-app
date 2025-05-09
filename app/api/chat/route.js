import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 檢查 API 金鑰是否存在
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined in environment variables');
}

// 初始化 OpenAI 客戶端
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 系統提示詞，恢復為原始或中性設定
const systemPrompt = `You are a helpful AI assistant.`; // 或者您可以將其設置為空字符串 ""，讓 OpenAI 使用其默認行為

export async function POST(request) {
  try {
    // 從請求中獲取訊息
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required.' }, // 恢復為原始錯誤提示
        { status: 400 }
      );
    }

    // 調用 OpenAI API
    const completion = await client.chat.completions.create({
      model: "gpt-4.1", // 您可以根據需要調整模型
      messages: [
        {
          role: "system",
          content: systemPrompt // 使用更新後的 systemPrompt
        },
        {
          role: "user",
          content: message 
        }
      ],
      temperature: 0.7, 
      max_tokens: 500,
    });

    // 獲取 AI 回應
    const aiResponse = completion.choices[0].message.content;

    // 返回 AI 回應
    return NextResponse.json({ 
      response: aiResponse 
    });

  } catch (error) {
    console.error('OpenAI API Error:', error);

    // 根據錯誤類型返回不同的錯誤訊息
    if (error.name === 'AuthenticationError') {
      return NextResponse.json(
        { error: 'OpenAI API 金鑰驗證失敗，請檢查環境變數設定' },
        { status: 401 }
      );
    }

    if (error.name === 'RateLimitError') {
      return NextResponse.json(
        { error: '已達到 API 使用限制，請稍後再試' },
        { status: 429 }
      );
    }

    if (error.name === 'APIError') {
      return NextResponse.json(
        { error: 'OpenAI API 服務暫時無法使用，請稍後再試' },
        { status: 503 }
      );
    }

    // 其他錯誤
    return NextResponse.json(
      { error: '處理請求時發生錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}
