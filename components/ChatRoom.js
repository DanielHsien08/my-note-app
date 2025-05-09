import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faSpinner, faRobot } from '@fortawesome/free-solid-svg-icons'; // 確保 faSpinner 已引入

const ChatRoom = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // 控制 spinner 的狀態

  // 監聽 isLoading 狀態變化，方便調試
  useEffect(() => {
    console.log('isLoading state changed to:', isLoading);
  }, [isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    console.log('handleSubmit: Setting isLoading to true'); // 調試日誌
    setIsLoading(true); // <<--- 關鍵：開始請求前，設置為 true
    setInput('');

    try {
      // 模擬 API 呼叫到後端
      // 在這裡替換成您實際的 API 請求邏輯
      // 例如:
      // const response = await fetch('/api/chat', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: input }),
      // });
      // if (!response.ok) {
      //   throw new Error('Network response was not ok');
      // }
      // const data = await response.json();
      // const botMessage = { sender: 'bot', text: data.reply };
      // setMessages(prevMessages => [...prevMessages, botMessage]);

      // 為了演示，這裡使用模擬延遲
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      const botMessage = { sender: 'bot', text: "這是來自後端的回應。" };
      setMessages(prevMessages => [...prevMessages, botMessage]);

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = { sender: 'bot', text: "抱歉，訊息發送失敗。" };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      console.log('handleSubmit: Setting isLoading to false'); // 調試日誌
      setIsLoading(false); // <<--- 關鍵：請求結束後（無論成功或失敗），設置為 false
    }
  };

  // console.log('ChatRoom render, isLoading:', isLoading); // 每次渲染時檢查 isLoading 狀態

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white shadow-xl rounded-lg flex flex-col">
      <div className="p-4 bg-blue-500 text-white rounded-t-lg">
        聊天室
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {msg.text}
            </span>
          </div>
        ))}
        {/* 可選：在訊息列表底部顯示更詳細的等候訊息 */}
        {isLoading && messages.length > 0 && messages[messages.length -1]?.sender === 'user' && (
          <div className="text-left mt-2">
            <span className="inline-block p-2 rounded-lg bg-gray-100 text-sm">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> 等候 AI 回應中...
            </span>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="輸入訊息..."
          disabled={isLoading} // 載入時禁用輸入框
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 disabled:bg-blue-300 w-12 flex items-center justify-center" // 確保按鈕有足夠寬度
          disabled={isLoading} // 載入時禁用按鈕
        >
          {isLoading ? (
            <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> // <<--- 關鍵：isLoading 為 true 時顯示 spinner
          ) : (
            <FontAwesomeIcon icon={faPaperPlane} /> // isLoading 為 false 時顯示發送圖示
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
