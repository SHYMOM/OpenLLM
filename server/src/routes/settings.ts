import { Router } from 'express';
import type { Request, Response } from 'express';
import { getUnifiedApiKey, regenerateUnifiedKey, setSetting, getAdminPassword, getSetting } from '../db/index.js';

export const settingsRouter = Router();

// Get the unified API key
settingsRouter.get('/api-key', (_req: Request, res: Response) => {
  res.json({ apiKey: getUnifiedApiKey() });
});

// Regenerate the unified API key
settingsRouter.post('/api-key/regenerate', (_req: Request, res: Response) => {
  const newKey = regenerateUnifiedKey();
  res.json({ apiKey: newKey });
});

// Change admin password
settingsRouter.post('/password', (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  
  const actualPassword = getAdminPassword();
  
  if (currentPassword !== actualPassword) {
    return res.status(401).json({ error: { message: 'Current access code is incorrect.' } });
  }
  
  if (!newPassword || newPassword.length < 1) {
    return res.status(400).json({ error: { message: 'New access code cannot be empty.' } });
  }
  
  setSetting('admin_password', newPassword);
  res.json({ success: true });
});

// Get global memory
settingsRouter.get('/global-memory', (_req: Request, res: Response) => {
  const memory = getSetting('global_memory', '');
  res.json({ memory });
});

// Set global memory
settingsRouter.post('/global-memory', (req: Request, res: Response) => {
  const { memory } = req.body;
  setSetting('global_memory', memory || '');
  res.json({ success: true });
});
