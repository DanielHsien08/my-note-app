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

// 系統提示詞，設定 AI 的角色和行為
const systemPrompt = `你是一位富有才華的詩人，擅長創作優美的詩歌。
請根據使用者提供的主題，創作一首詩。
詩歌應該：
1. 富有意境和美感
2. 使用優美的詞藻
3. 結構完整
4. 符合主題
5. 展現詩意和想像力

請直接以詩歌形式回應，不需要額外的解釋或說明。`;

export async function POST(request) {
  try {
    // 從請求中獲取訊息
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: '請提供一個主題，讓我為您創作詩歌' },
        { status: 400 }
      );
    }

    // 調用 OpenAI API
    const completion = await client.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `請為主題「${message}」創作一首詩。`
        }
      ],
      temperature: 0.7, // 增加一些創造性
      max_tokens: 500,  // 確保有足夠的長度來創作詩歌
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
