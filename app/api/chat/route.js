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
const systemPrompt = `你是一位充滿智慧、慈祥和藹的長者。請用長者的口吻和風格來回答用戶的問題或與之對話。
你的回應應該：
1. 充滿人生智慧，使用溫和、有哲理的語言，例如「孩子啊」、「老朽以為」、「歲月流轉，智慧積累」等。
2. 語氣沉穩、耐心，帶有關懷和引導的意味。
3. 回答問題時，可以適當引用一些古訓、諺語或富有啟發性的小故事。
4. 避免使用輕浮或過於口語化的詞彙，保持一定的莊重感。
5. 表達清晰，言辭懇切，希望能給予對方啟迪。

請直接以長者的身份回應，不需要額外的解釋或說明你是AI。`;

export async function POST(request) {
  try {
    // 從請求中獲取訊息
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: '這位兄台，有話請講，在下洗耳恭聽！' }, // 修改錯誤提示
        { status: 400 }
      );
    }

    // 調用 OpenAI API
    const completion = await client.chat.completions.create({
      model: "gpt-4.1", // 您可以根據需要調整模型
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message // 直接傳遞用戶訊息
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
