import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';
import { accessCookieOptions, refreshCookieOptions } from '../utils/cookie_options.js';
import {
  loginOauthUser,
  loginWithEmail,
  refreshAccessToken,
  registerOauthUser,
  registerWithEmail,
  revokeRefreshToken,
} from '../services/auth-service.js';
const { hash, compareSync } = bcrypt;
const { sign } = jwt;

const sendAuthResponse = (res, payload, message) => {
  res.cookie('access_token', payload.accessToken, accessCookieOptions);
  res.cookie('refresh_token', payload.refreshToken, refreshCookieOptions);
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    user: payload.user,
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  });
};

//REGULAR EMAIL PASSWORD STRATEGY
//1.Sign Up
export const signUpWithEmail = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new Error('All fields are required.');
    }
    const payload = await registerWithEmail({ name, email, password });
    sendAuthResponse(res, payload, RESPONSE_MESSAGES.USERS.SIGNED_UP);
  } catch (error) {
    res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

//2.Sign In
export const signInWithEmail = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error('Both email and password are required');
    }
    const payload = await loginWithEmail({ email, password });
    sendAuthResponse(res, payload, RESPONSE_MESSAGES.USERS.SIGNED_IN);
  } catch (error) {
    res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

//GOOGLE STRTEGY
//1.Open google auth window
export const openGoogleAuthWindow = (req, res, next) => {
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

//2.Sign Up
export const signUpWithGoogle = async (req, res, next) => {
  const code = req.query.code;
  if (!code) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: RESPONSE_MESSAGES.USERS.CODE_NOT_FOUND,
    });
  }
  const tokenUrl = process.env.GAUTH_TOKEN_URL;
  try {
    const tokenResponse = await axios.post(
      tokenUrl,
      {
        client_id: process.env.GAUTH_CLIENT_ID,
        client_secret: process.env.GAUTH_CLIENT_SECRET,
        code,
        redirect_uri: process.env.REDIRECTION_URL,
        grant_type: 'authorization_code',
      },
      {
        headers: { Accept: 'application/json' },
      }
    );
    const userInfo = await axios.get(process.env.GAUTH_USER_URL, {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` },
    });
    const { email, name } = userInfo.data;
    const payload = await registerOauthUser({ name, email });
    sendAuthResponse(res, payload, RESPONSE_MESSAGES.USERS.SIGNED_UP);
  } catch (error) {
    res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

//3.Sign In
export const signInWithGoogle = async (req, res, next) => {
  const code = req.query.code;
  if (!code) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: RESPONSE_MESSAGES.USERS.CODE_NOT_FOUND,
    });
  }
  const tokenUrl = process.env.GAUTH_TOKEN_URL;
  try {
    const tokenResponse = await axios.post(
      tokenUrl,
      {
        client_id: process.env.GAUTH_CLIENT_ID,
        client_secret: process.env.GAUTH_CLIENT_SECRET,
        code,
        redirect_uri: process.env.REDIRECTION_URL,
        grant_type: 'authorization_code',
      },
      {
        headers: { Accept: 'application/json' },
      }
    );
    const userInfo = await axios.get(process.env.GAUTH_USER_URL, {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` },
    });
    const { email, name } = userInfo.data;
    const payload = await loginOauthUser({ email });
    sendAuthResponse(res, payload, RESPONSE_MESSAGES.USERS.SIGNED_IN);
  } catch (error) {
    res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

//GITHUB STRATEGY
//1.Open Github auth window
export const openGithubAuthWindow = (req, res, next) => {
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

//2.Sign up
export const signUpWithGithub = async (req, res, next) => {
  const code = req.query.code;
  if (!code) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: RESPONSE_MESSAGES.USERS.CODE_NOT_FOUND,
    });
  }
  const tokenUrl = process.env.GITHUB_TOKEN_URL;
  try {
    const tokenResponse = await axios.post(
      tokenUrl,
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );
    const userInfo = await axios.get(process.env.GITHUB_USER_URL, {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` },
    });
    if (userInfo.data.email == null) {
      throw new Error("Your github account's email is not publically available.");
    }
    const { name, email } = userInfo.data;
    const payload = await registerOauthUser({ name, email });
    sendAuthResponse(res, payload, RESPONSE_MESSAGES.USERS.SIGNED_UP);
  } catch (error) {
    res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

//3.Sign In
export const signInWithGithub = async (req, res, next) => {
  const code = req.query.code;
  if (!code) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: RESPONSE_MESSAGES.USERS.CODE_NOT_FOUND,
    });
  }
  const tokenUrl = process.env.GITHUB_TOKEN_URL;
  try {
    const tokenResponse = await axios.post(
      tokenUrl,
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );
    const userInfo = await axios.get(process.env.GITHUB_USER_URL, {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` },
    });
    const { name, email } = userInfo.data;
    const payload = await loginOauthUser({ email });
    sendAuthResponse(res, payload, RESPONSE_MESSAGES.USERS.SIGNED_IN);
  } catch (error) {
    res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

//Sign Out
export const signOutUser = async (req, res, next) => {
  try {
    await revokeRefreshToken(req.user?._id);
    res.cookie('access_token', '', { maxAge: 1 });
    res.cookie('refresh_token', '', { maxAge: 1 });

    res.status(200).json({ success: true, message: RESPONSE_MESSAGES.USERS.SIGNED_OUT });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

export const refreshTokenHandler = async (req, res) => {
  try {
    const payload = await refreshAccessToken(req.cookies?.refresh_token || req.body.refreshToken);
    sendAuthResponse(res, payload, 'Token refreshed');
  } catch (error) {
    res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};
