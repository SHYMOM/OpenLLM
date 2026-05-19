import { Router } from 'express';
import { getDb } from '../db/index.js';
import crypto from 'crypto';

export const chatsRouter = Router();

// Get all chats
chatsRouter.get('/', (req, res) => {
  const db = getDb();
  const chats = db.prepare('SELECT * FROM chats ORDER BY updated_at DESC').all();
  res.json(chats);
});

// Create a new chat
chatsRouter.post('/', (req, res) => {
  const { title } = req.body;
  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO chats (id, title) VALUES (?, ?)').run(id, title || 'New Chat');
  const chat = db.prepare('SELECT * FROM chats WHERE id = ?').get(id);
  res.json(chat);
});

// Get messages for a chat
chatsRouter.get('/:id/messages', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const rawMessages = db.prepare('SELECT * FROM chat_messages WHERE chat_id = ? ORDER BY created_at ASC').all(id) as any[];
  
  const messages = rawMessages.map(msg => {
    let parsedMeta = undefined;
    if (msg.meta) {
      try {
        parsedMeta = JSON.parse(msg.meta);
      } catch (e) {
        console.error('Failed to parse message meta:', e);
      }
    }
    return {
      ...msg,
      meta: parsedMeta
    };
  });
  
  res.json(messages);
});

// Add a message to a chat
chatsRouter.post('/:id/messages', (req, res) => {
  const { id } = req.params;
  const { role, content, meta } = req.body;
  const db = getDb();
  const messageId = crypto.randomUUID();
  const metaString = meta ? JSON.stringify(meta) : null;
  
  const insert = db.transaction(() => {
    db.prepare('INSERT INTO chat_messages (id, chat_id, role, content, meta) VALUES (?, ?, ?, ?, ?)').run(messageId, id, role, content, metaString);
    db.prepare('UPDATE chats SET updated_at = datetime(\'now\') WHERE id = ?').run(id);
  });
  
  insert();
  
  const message = db.prepare('SELECT * FROM chat_messages WHERE id = ?').get(messageId) as any;
  if (message.meta) {
    message.meta = JSON.parse(message.meta);
  }
  res.json(message);
});

// Update chat title
chatsRouter.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const db = getDb();
  db.prepare('UPDATE chats SET title = ?, updated_at = datetime(\'now\') WHERE id = ?').run(title, id);
  const chat = db.prepare('SELECT * FROM chats WHERE id = ?').get(id);
  res.json(chat);
});

// Delete a chat
chatsRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  const db = getDb();
  db.prepare('DELETE FROM chats WHERE id = ?').run(id);
  res.json({ success: true });
});
