/*
 * IMPORTS
 */
import { jwtDecode } from "jwt-decode";
import _Apollo from "../lib/apollo";
import { gql } from "@apollo/client";
import { authLogger } from "./debug";
import { handleAuthError } from "./errorHandling";

/*
 * CONFIG
 */
const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    AccountTokenGenerate(refreshToken: $refreshToken) {
      accessToken
      refreshToken
      status
      message
    }
  }
`;

/*
 * HELPER FUNCTIONS
 */
function isTokenExpired(token) {
  if (!token) {
    authLogger.debug("Token validation failed - token not provided");
    return true;
  }

  try {
    const { exp } = jwtDecode(token);
    const isExpired = Date.now() >= exp * 1000;

    if (isExpired) {
      authLogger.warn("Access token has expired");
    }

    return isExpired;
  } catch (error) {
    authLogger.error("Failed to decode token", error);
    return true;
  }
}

/*
 * EXPORTS
 */
export async function runWithAuth(requestFn) {
  try {
    let accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (isTokenExpired(accessToken) && refreshToken) {
      authLogger.info("Refreshing expired access token");

      try {
        const response = await _Apollo.mutate({
          mutation: REFRESH_TOKEN,
          variables: { refreshToken },
        });

        const tokenData = response.data.AccountTokenGenerate;

        if (tokenData.status !== "SUCCESS") {
          throw new Error(tokenData.message || "Token refresh failed");
        }

        accessToken = tokenData.accessToken;
        const newRefreshToken = tokenData.refreshToken;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        authLogger.info("Access token refreshed successfully");
      } catch (refreshError) {
        authLogger.error("Token refresh failed", refreshError);

        // Clear invalid tokens
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        throw new Error(handleAuthError("REFRESH_FAILED"));
      }
    }

    return await requestFn();
  } catch (error) {
    authLogger.error("Authentication wrapper failed", error);
    throw error;
  }
}
