import axios from "axios";
import { apiRequest, zoomApp } from "./zoom_app";
import crypto from "crypto";
import createError from "http-errors";

export function tokenRequest(params: any, id = "", secret = "") {
  const username = process.env.clientId as string;
  const password = process.env.clientSecret as string;

  return axios
    .post(
      zoomApp.host + "/oauth/token",
      {
        ...params,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        auth: {
          username,
          password,
        },
      }
    )
    .then(({ data }) => Promise.resolve(data));
}

// returns a base64 encoded url
const base64URL = (s: any) =>
  s
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

// returns a random string of format fmt
export const rand = (fmt: any, depth = 32) => crypto.randomBytes(depth).toString(fmt);

/**
 * Return the url, state and verifier for the Zoom App Install
 * @return {{verifier: string, state: string, url: module:url.URL}}
 */
export function getInstallURL() {
  const state = rand("base64");
  const verifier = rand("ascii");

  const digest = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64")
    .toString();

  const challenge = base64URL(digest);

  const url = new URL("/oauth/authorize", zoomApp.host);

  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", zoomApp.clientId);
  url.searchParams.set("redirect_uri", zoomApp.redirectUrl);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", state);

  return { url, state, verifier };
}

/**
 * Obtains an OAuth access token from Zoom
 * @param {string} code - Authorization code from user authorization
 * @param verifier - code_verifier for PKCE
 * @return {Promise}  Promise resolving to the access token object
 */
export async function getToken(code: string, verifier: any) {
  if (!code || typeof code !== "string")
    throw createError(500, "authorization code must be a valid string");

  if (!verifier || typeof verifier !== "string")
    throw createError(500, "code verifier code must be a valid string");

  return tokenRequest({
    code,
    code_verifier: verifier,
    redirect_uri: zoomApp.redirectUrl,
    grant_type: "authorization_code",
  });
}

/**
 * Return the DeepLink for opening Zoom
 * @param {string} token - Zoom App Access Token
 * @return {Promise}
 */
export function getDeeplink(token: string) {
  return apiRequest("POST", "/zoomapp/deeplink", token, {
    action: JSON.stringify({
      url: "/",
      role_name: "Owner",
      verified: 1,
      role_id: 0,
    }),
  } as any).then((data) => Promise.resolve(data.deeplink));
}
