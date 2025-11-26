"use client";
import { io } from 'socket.io-client';

// This will only be executed on the client
export const socket = io('wss://ws.dev.fun/app-4129fba431f3c36d8469');
