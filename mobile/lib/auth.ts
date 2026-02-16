import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { Config } from "@/constants/Config";
import { authApi } from "./apiClient";

// Complete the auth session for web browser
WebBrowser.maybeCompleteAuthSession();

/**
 * Google OAuth Configuration
 */
const googleAuthConfig = {
  authorizationEndpoint: `${Config.API_URL}/api/auth/google`,
  tokenEndpoint: `${Config.API_URL}/api/auth/token`,
};

/**
 * Sign in with Google using Expo Auth Session
 */
export async function signInWithGoogle() {
  try {
    // Create redirect URI for Expo
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: "whatstheirtime",
      path: "auth/callback",
    });

    console.log("Redirect URI:", redirectUri);

    // Build the Google OAuth URL
    const authUrl = `${Config.API_URL}/api/auth/google?redirect_to=${encodeURIComponent(
      redirectUri
    )}`;

    // Open the browser for authentication
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === "success") {
      // Extract token from URL
      const url = result.url;
      const token = extractTokenFromUrl(url);

      if (token) {
        // Save token to SecureStore
        await authApi.saveToken(token);
        return { success: true, token };
      } else {
        return { success: false, error: "No token received" };
      }
    } else if (result.type === "cancel") {
      return { success: false, error: "User cancelled" };
    } else {
      return { success: false, error: "Authentication failed" };
    }
  } catch (error) {
    console.error("Sign in error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Extract token from callback URL
 */
function extractTokenFromUrl(url: string): string | null {
  try {
    // Parse URL to get query parameters
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    // Try different parameter names
    const token =
      params.get("token") ||
      params.get("access_token") ||
      params.get("session_token") ||
      null;

    // Also check hash fragment for SPA-style tokens
    if (!token && urlObj.hash) {
      const hashParams = new URLSearchParams(urlObj.hash.substring(1));
      return (
        hashParams.get("token") ||
        hashParams.get("access_token") ||
        hashParams.get("session_token") ||
        null
      );
    }

    return token;
  } catch (error) {
    console.error("Error parsing URL:", error);
    return null;
  }
}

/**
 * Sign out - clear token and session
 */
export async function signOut() {
  try {
    // Call backend sign out endpoint
    await fetch(`${Config.API_URL}/api/auth/signout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await authApi.getToken()}`,
      },
    });

    // Remove token from SecureStore
    await authApi.removeToken();

    return { success: true };
  } catch (error) {
    console.error("Sign out error:", error);
    // Still remove token even if backend call fails
    await authApi.removeToken();
    return { success: false, error: String(error) };
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await authApi.getToken();
  return !!token;
}

/**
 * Get current session/user info
 */
export async function getSession() {
  try {
    const token = await authApi.getToken();
    if (!token) {
      return null;
    }

    const response = await fetch(`${Config.API_URL}/api/auth/session`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const session = await response.json();
    return session;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}
