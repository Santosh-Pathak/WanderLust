import { Router } from 'express';
import {
  signUpWithEmail,
  signInWithEmail,
  openGoogleAuthWindow,
  signUpWithGoogle,
  signInWithGoogle,
  openGithubAuthWindow,
  signUpWithGithub,
  signInWithGithub,
  signOutUser,
  refreshTokenHandler,
} from '../controllers/auth-controller.js';
import { authenticate } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rate-limit.js';

const router = Router();

router.use(authRateLimit);

router.get('/google', openGoogleAuthWindow);
router.get('/google/signup/callback', signUpWithGoogle);
router.get('/google/signin/callback', signInWithGoogle);

router.get('/github', openGithubAuthWindow);
router.get('/github/signup/callback', signUpWithGithub);
router.get('/github/signin/callback', signInWithGithub);

router.post('/email-password/signup', signUpWithEmail);
router.post('/email-password/signin', signInWithEmail);

router.post('/refresh', refreshTokenHandler);
router.post('/signout', authenticate, signOutUser);

export default router;
