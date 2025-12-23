import { Response } from 'express';
import { catchAsync } from '../../common/utils/catchAsync.js';
import { chatService } from './chat.service.js';
import { AuthRequest } from '../../middleware/auth.js';

export const createChat = catchAsync(async (req: AuthRequest, res: Response) => {
  const { fileId } = req.body;
  const chat = await chatService.createChat(req.user!.userId, fileId);
  res.status(201).json(chat);
});

export const getChats = catchAsync(async (req: AuthRequest, res: Response) => {
  const chats = await chatService.getUserChats(req.user!.userId);
  res.json(chats);
});

export const getChat = catchAsync(async (req: AuthRequest, res: Response) => {
  const chat = await chatService.getChat(req.params.id, req.user!.userId);
  res.json(chat);
});

export const sendMessage = catchAsync(async (req: AuthRequest, res: Response) => {
  const { content } = req.body;
  const result = await chatService.sendMessage(req.params.id, req.user!.userId, content);
  res.status(201).json(result);
});

export const deleteChat = catchAsync(async (req: AuthRequest, res: Response) => {
  await chatService.deleteChat(req.params.id, req.user!.userId);
  res.status(204).send();
});