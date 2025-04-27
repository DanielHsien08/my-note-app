'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/services/firebase';
import { collection, addDoc, orderBy, query, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

export default function Home() {
    // 定義筆記清單狀態
    const [notes, setNotes] = useState([]);
    // 定義載入狀態
    const [isLoading, setIsLoading] = useState(true);
    // 定義登入狀態
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // 定義當前用戶ID
    const [currentUserId, setCurrentUserId] = useState(null);
    // 定義表單狀態
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        date: '',
        content: ''
    });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, noteId: null, noteTitle: '' });

    // 監聽認證狀態
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsLoggedIn(!!user);
            setCurrentUserId(user?.uid || null);
        });
        return () => unsubscribe();
    }, []);

    // 設置即時監聽
    useEffect(() => {
        if (!isLoggedIn || !currentUserId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        
        // 建立查詢 - 使用新的資料結構路徑
        const notesQuery = query(
            collection(db, `user-list/${currentUserId}/note-list`),
            orderBy('createdAt', 'desc')
        );
        
        // 設置監聽器
        const unsubscribe = onSnapshot(notesQuery, 
            (snapshot) => {
                // 處理資料更新
                const notesList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setNotes(notesList);
                setIsLoading(false);
            },
            (error) => {
                console.error('Error listening to notes:', error);
                alert('監聽筆記更新時發生錯誤');
                setIsLoading(false);
            }
        );

        // 清理函數：組件卸載時取消監聽
        return () => unsubscribe();
    }, [isLoggedIn, currentUserId]);

    // 處理表單輸入變化
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 處理表單提交
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUserId) {
            alert('請先登入');
            return;
        }

        try {
            const newNote = {
                ...formData,
                createdAt: new Date().toISOString()
            };

            // 將筆記儲存到新的資料結構路徑
            await addDoc(collection(db, `user-list/${currentUserId}/note-list`), newNote);
            
            // 重置表單
            setFormData({
                title: '',
                category: '',
                date: '',
                content: ''
            });

        } catch (error) {
            console.error('Error adding note:', error);
            alert('儲存筆記時發生錯誤，請稍後再試。');
        }
    };

    // 處理完成狀態切換
    const handleCompleteToggle = async (noteId, currentStatus) => {
        if (!currentUserId) return;
        
        try {
            const noteRef = doc(db, `user-list/${currentUserId}/note-list`, noteId);
            await updateDoc(noteRef, {
                completed: !currentStatus
            });
        } catch (error) {
            console.error('Error updating note status:', error);
            alert('更新筆記狀態時發生錯誤');
        }
    };

    // 處理刪除筆記
    const handleDeleteNote = async () => {
        if (!currentUserId || !deleteModal.noteId) return;
        
        try {
            const noteRef = doc(db, `user-list/${currentUserId}/note-list`, deleteModal.noteId);
            await deleteDoc(noteRef);
            setDeleteModal({ isOpen: false, noteId: null, noteTitle: '' });
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('刪除筆記時發生錯誤');
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="container mx-auto p-4 sm:p-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-6">
                        讓你的想法不再遺忘
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        使用我們的筆記軟體，隨時隨地記錄你的靈感與想法。<br />
                        簡單、快速、安全，讓你的創意永不流失。
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link 
                            href="/sign-in"
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-300"
                        >
                            立即登入
                        </Link>
                        <Link 
                            href="/register"
                            className="px-6 py-3 bg-white text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition duration-300"
                        >
                            註冊帳號
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6">
            {/* 刪除確認 Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">確認刪除</h3>
                        <p className="mb-6">確定要刪除筆記 "{deleteModal.noteTitle}" 嗎？此操作無法復原。</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setDeleteModal({ isOpen: false, noteId: null, noteTitle: '' })}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleDeleteNote}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                確認刪除
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* 第一張卡片 - 建立筆記表單 */}
                <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:col-span-1 row-span-2">
                    <h2 className="text-xl font-bold mb-4">建立新筆記</h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* 標題輸入 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                標題
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="請輸入標題"
                                required
                            />
                        </div>

                        {/* 分類選擇 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                分類
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            >
                                <option value="">請選擇分類</option>
                                <option value="important">重要</option>
                                <option value="urgent">緊急</option>
                                <option value="normal">普通</option>
                            </select>
                        </div>

                        {/* 日期選擇 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                日期
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>

                        {/* 詳細內容 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                詳細內容
                            </label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
                                placeholder="請輸入詳細內容"
                                required
                            ></textarea>
                        </div>

                        {/* 送出按鈕 */}
                        <button
                            type="submit"
                            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition duration-300"
                        >
                            建立筆記
                        </button>
                    </form>
                </div>

                {/* 載入中狀態 */}
                {isLoading ? (
                    <div className="lg:col-span-3 flex justify-center items-center">
                        <div className="text-gray-500">載入筆記中...</div>
                    </div>
                ) : notes.length === 0 ? (
                    <div className="lg:col-span-3 flex justify-center items-center">
                        <div className="text-gray-500">目前還沒有筆記</div>
                    </div>
                ) : (
                    /* 筆記清單容器 */
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* 筆記清單 */}
                        {notes.map(note => (
                            <div 
                                key={note.id} 
                                className={`bg-white rounded-lg shadow-[0_4px_12px_rgba(147,51,234,0.1)] p-4 sm:p-6 h-[250px] flex flex-col transition-all duration-300 hover:opacity-100 hover:-translate-y-1 opacity-90 border-2 ${
                                    note.completed 
                                        ? 'border-gray-300 hover:border-gray-400 bg-gray-50' 
                                        : 'border-purple-300 hover:border-purple-600'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center flex-1 mr-2">
                                        <input
                                            type="checkbox"
                                            checked={note.completed || false}
                                            onChange={() => handleCompleteToggle(note.id, note.completed || false)}
                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-2"
                                        />
                                        <h3 className={`text-xl font-semibold truncate ${
                                            note.completed ? 'line-through text-gray-400' : ''
                                        }`}>
                                            {note.title}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-sm flex-shrink-0 ${
                                            note.category === 'important' ? 'bg-red-100 text-red-800' :
                                            note.category === 'urgent' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {note.category === 'important' ? '重要' :
                                             note.category === 'urgent' ? '緊急' : '普通'}
                                        </span>
                                        <button
                                            onClick={() => setDeleteModal({ isOpen: true, noteId: note.id, noteTitle: note.title })}
                                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className={`text-sm mb-3 ${
                                    note.completed ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                    {note.date}
                                </div>
                                <p className={`flex-1 overflow-y-auto mb-3 ${
                                    note.completed ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                    {note.content}
                                </p>
                                <div className="text-xs text-gray-400 mt-auto pt-2 border-t">
                                    建立於 {new Date(note.createdAt).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
