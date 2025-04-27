'use client';

import { useState } from 'react';
import { auth } from '@/services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import styles from './register.module.css';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email 為必填欄位';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '請輸入有效的 Email 格式';
    }

    if (!formData.password) {
      newErrors.password = '密碼為必填欄位';
    } else if (formData.password.length < 6) {
      newErrors.password = '密碼至少需要 6 個字元';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      alert('註冊成功！');
      router.push('/');
    } catch (error) {
      let errorMessage = '註冊失敗，請稍後再試。';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = '此 Email 已被註冊';
          break;
        case 'auth/invalid-email':
          errorMessage = '無效的 Email 格式';
          break;
        case 'auth/weak-password':
          errorMessage = '密碼強度不足';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = '此操作不被允許';
          break;
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className={styles.container}>
      <h1>註冊</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
          />
          {errors.email && <span className={styles.error}>{errors.email}</span>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">密碼</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={styles.input}
          />
          {errors.password && <span className={styles.error}>{errors.password}</span>}
        </div>

        <button type="submit" className={styles.button}>
          註冊
        </button>
      </form>
    </div>
  );
}
