import { Router } from 'express';
import { getAdminPassword } from '../db/index.js';

export const authRouter = Router();

authRouter.post('/verify', (req, res) => {
  const { password } = req.body;
  const actualPassword = getAdminPassword();

  if (password === actualPassword) {
    return res.json({ success: true });
  }

  res.status(401).json({
    error: {
      message: 'Invalid administration key.',
      type: 'authentication_error',
    },
  });
});
