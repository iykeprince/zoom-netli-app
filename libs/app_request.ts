import axios, { AxiosError } from "axios";
import { apiRequest, encodeBase64, zoomApp } from "./zoom_app";
import crypto from "crypto";
import createError from "http-errors";

export function tokenRequest(params: any, id = "", secret = "") {
  const authToken = encodeBase64(`${id}:${secret}`);
  return axios
    .post(
      zoomApp.host + "/oauth/token",
      {
        ...params,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${authToken}`,
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
export const rand = (fmt: any, depth = 32) =>
  crypto.randomBytes(depth).toString(fmt);

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
    throw createError(500, "code verifier code must be a valid string")
  
  const clientId = zoomApp.clientId;
  const clientSecret = zoomApp.clientSecret;
  const authToken = encodeBase64(
    `sH_SoSfsTUVJNHQdWC9PA:hvzUQUEeOVPF63KYM3ZWzxnNaAhDVBKT`
  );
  console.log("clientId", clientId, clientSecret,  "Authorization", `Basic ${authToken}`,);
  console.log("param", {
    code,
    grant_type: "authorization_code",
    redirect_uri: zoomApp.redirectUrl,
    code_verifier: verifier,
  });
  try {
    const response = await axios.post(
      `https://zoom.us/oauth/token`,
      {
        code,
        grant_type: "authorization_code",
        redirect_uri: zoomApp.redirectUrl,
        code_verifier: verifier,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${authToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log("error", (error as AxiosError).response?.data);
  }
  // return tokenRequest(
  //   {
  //     code,
  //     code_verifier: verifier,
  //     redirect_uri: zoomApp.redirectUrl,
  //     grant_type: "authorization_code",
  //   },
  //   clientId,
  //   clientSecret
  // );
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
