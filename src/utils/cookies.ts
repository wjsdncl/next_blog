"use client";

const cookies = {
  get: (name: string) => {
    // 서버 환경인지 확인
    if (typeof document === "undefined") {
      return null; // 서버 환경에서는 null 반환
    }

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    // 값이 존재하는 경우에만 추출, 아닌 경우 null 반환
    if (parts.length === 2) {
      const cookiePart = parts.pop();
      if (cookiePart) {
        return cookiePart.split(";").shift() || null;
      }
    }
    return null;
  },

  set: (name: string, value: string, days: number) => {
    // 서버 환경에서 실행되지 않도록 확인
    if (typeof document === "undefined") {
      return;
    }

    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/;`;
  },

  remove: (name: string) => {
    // 서버 환경에서 실행되지 않도록 확인
    if (typeof document === "undefined") {
      return;
    }

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  },
};

export default cookies;
