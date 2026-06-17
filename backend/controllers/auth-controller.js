import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../middleware/error-handler.js';
import { accessCookieOptions, refreshCookieOptions } from '../utils/cookie_options.js';
import {
  loginOauthUser,
  loginWithEmail,
  refreshAccessToken,
  registerOauthUser,
  registerWithEmail,
  revokeRefreshToken,
  exchangeGoogleCode,
  exchangeGithubCode,
  fetchGoogleUser,
  fetchGithubUser,
} from '../services/auth-service.js';

const sendAuthResponse = (res, payload, message) => {
  res.cookie('access_token', payload.accessToken, accessCookieOptions);
  res.cookie('refresh_token', payload.refreshToken, refreshCookieOptions);
  ApiResponse.success(res, {
    data: {
      user: payload.user,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
    },
    message,
  });
};

export const signUpWithEmail = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'All fields are required' });
  }
  const payload = await registerWithEmail({ name, email, password });
  sendAuthResponse(res, payload, RESPONSE_MESSAGES.USERS.SIGNED_UP);
});

export const signInWithEmail = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Both email and password are required' });
  }
  const payload = await loginWithEmail({ email, password });
  sendAuthResponse(res, payload, RESPONSE_MESSAGES.USERS.SIGNED_IN);
});

export const openGoogleAuthWindow = (req, res) => {
  const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth?';
  const params = new URLSearchParams({
    client_id: process.env.GAUTH_CLIENT_ID,
    redirect_uri: process.env.REDIRECTION_URL,
    state: 'google-auth-provider',
    scope: 'profile email',
    response_type: 'code',
  });
  res.redirect(googleAuthUrl + params.toString());
};

export const signUpWithGoogle = asyncHandler(async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: RESPONSE_MESSAGES.USERS.CODE_NOT_FOUND });
  }
  const tokenData = await exchangeGoogleCode(code);
  const userInfo = await fetchGoogleUser(tokenData.access_token);
  const { email, name } = userInfo;
  const payload = await registerOauthUser({ name, email });
  sendAuthResponse(res, payload, RESPONSE_MESSAGES.USERS.SIGNED_UP);
});

export const signInWithGoogle = asyncHandler(async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: RESPONSE_MESSAGES.USERS.CODE_NOT_FOUND });
  }
  const tokenData = await exchangeGoogleCode(code);
  const userInfo = await fetchGoogleUser(tokenData.access_token);
  const { email } = userInfo;
  const payload = await loginOauthUser({ email });
  sendAuthResponse(res, payload, RESPONSE_MESSAGES.USERS.SIGNED_IN);
});

export const openGithubAuthWindow = (req, res) => {
  const githubAuthUrl = 'https://github.com/login/oauth/authorize?';
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.REDIRECTION_URL,
    state: 'github-auth-provider',
    scope: 'user:read user:email',
    response_type: 'code',
  });
  res.redirect(githubAuthUrl + params.toString());
};

export const signUpWithGithub = asyncHandler(async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: RESPONSE_MESSAGES.USERS.CODE_NOT_FOUND });
  }
  const tokenData = await exchangeGithubCode(code);
  const userInfo = await fetchGithubUser(tokenData.access_token);
  if (!userInfo.email) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "Your GitHub account's email is not publicly available" });
  }
  const { name, email } = userInfo;
  const payload = await registerOauthUser({ name, email });
  sendAuthResponse(res, payload, RESPONSE_MESSAGES.USERS.SIGNED_UP);
});

export const signInWithGithub = asyncHandler(async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: RESPONSE_MESSAGES.USERS.CODE_NOT_FOUND });
  }
  const tokenData = await exchangeGithubCode(code);
  const userInfo = await fetchGithubUser(tokenData.access_token);
  const { name, email } = userInfo;
  const payload = await loginOauthUser({ email });
  sendAuthResponse(res, payload, RESPONSE_MESSAGES.USERS.SIGNED_IN);
});

export const signOutUser = asyncHandler(async (req, res) => {
  await revokeRefreshToken(req.user?._id);
  res.cookie('access_token', '', { maxAge: 1 });
  res.cookie('refresh_token', '', { maxAge: 1 });
  ApiResponse.success(res, { message: RESPONSE_MESSAGES.USERS.SIGNED_OUT });
});

export const refreshTokenHandler = asyncHandler(async (req, res) => {
  const payload = await refreshAccessToken(req.cookies?.refresh_token || req.body.refreshToken);
  sendAuthResponse(res, payload, 'Token refreshed');
});
