export const TOKEN_NAMES = {
  ACCESS: "access_token",
  REFRESH: "refresh_token",
  LOGGED_IN: "is_logged_in",
} as const;

export interface ServerTokens {
  accessToken?: string;
  refreshToken?: string;
}

/** 서버 컨텍스트에서 토큰을 읽는다. Edge Runtime(middleware)에서는 사용 불가. */
export async function getTokens(): Promise<ServerTokens> {
  const { cookies } = await import("next/headers");
  const cookieStore = cookies();
  return {
    accessToken: cookieStore.get(TOKEN_NAMES.ACCESS)?.value,
    refreshToken: cookieStore.get(TOKEN_NAMES.REFRESH)?.value,
  };
}

/** 토큰이 하나라도 존재하면 true. 서버 컨텍스트 전용. */
export async function hasTokens(): Promise<boolean> {
  const { accessToken, refreshToken } = await getTokens();
  return !!accessToken || !!refreshToken;
}
