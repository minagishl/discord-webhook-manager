import type {
  DiscordWebhook,
  DiscordMessage,
  ExecuteWebhookParams,
  ModifyWebhookParams,
} from './types';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

export function createDiscordAPIError(
  status: number,
  code: number,
  message: string,
): Error & { status: number; code: number } {
  const err = new Error(message) as Error & { status: number; code: number };
  err.name = 'DiscordAPIError';
  err.status = status;
  err.code = code;
  return err;
}

export type DiscordAPIError = ReturnType<typeof createDiscordAPIError>;

export function isDiscordAPIError(e: unknown): e is DiscordAPIError {
  return e instanceof Error && e.name === 'DiscordAPIError';
}

export function getErrorMessage(e: unknown): string {
  if (isDiscordAPIError(e)) {
    return `Discord API Error ${e.status}: ${e.message}`;
  }
  if (e instanceof Error) return e.message;
  return 'An unexpected error occurred.';
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as unknown as T;
  const data = await res.json();
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? 'Unknown error';
    throw createDiscordAPIError(
      res.status,
      (data as { code?: number }).code ?? 0,
      msg,
    );
  }
  return data as T;
}

// Parse webhook URL into id + token
export function parseWebhookUrl(
  url: string,
): { id: string; token: string } | null {
  const match = url.match(
    /discord(?:app)?\.com\/api\/(?:v\d+\/)?webhooks\/(\d+)\/([A-Za-z0-9_\-.]+)/,
  );
  if (!match) return null;
  return { id: match[1], token: match[2] };
}

// GET /webhooks/{webhook.id}/{webhook.token}
export async function getWebhookWithToken(
  id: string,
  token: string,
): Promise<DiscordWebhook> {
  const res = await fetch(`${DISCORD_API_BASE}/webhooks/${id}/${token}`);
  return handleResponse<DiscordWebhook>(res);
}

// PATCH /webhooks/{webhook.id}/{webhook.token}
export async function modifyWebhookWithToken(
  id: string,
  token: string,
  params: Omit<ModifyWebhookParams, 'channel_id'>,
): Promise<DiscordWebhook> {
  const res = await fetch(`${DISCORD_API_BASE}/webhooks/${id}/${token}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return handleResponse<DiscordWebhook>(res);
}

// DELETE /webhooks/{webhook.id}/{webhook.token}
export async function deleteWebhookWithToken(
  id: string,
  token: string,
): Promise<void> {
  const res = await fetch(`${DISCORD_API_BASE}/webhooks/${id}/${token}`, {
    method: 'DELETE',
  });
  return handleResponse<void>(res);
}

// POST /webhooks/{webhook.id}/{webhook.token}?wait=true
export async function executeWebhook(
  id: string,
  token: string,
  params: ExecuteWebhookParams,
  wait = true,
): Promise<DiscordMessage | null> {
  const url = new URL(`${DISCORD_API_BASE}/webhooks/${id}/${token}`);
  if (wait) url.searchParams.set('wait', 'true');
  if (params.thread_id) {
    url.searchParams.set('thread_id', params.thread_id);
  }

  const { thread_id: _threadId, files, ...payload } = params;

  let res: Response;
  if (files && files.length > 0) {
    const formData = new FormData();
    formData.set('payload_json', JSON.stringify(payload));
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file, file.name);
    });
    res = await fetch(url.toString(), {
      method: 'POST',
      body: formData,
    });
  } else {
    res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  if (wait) {
    return handleResponse<DiscordMessage>(res);
  }
  await handleResponse<void>(res);
  return null;
}

// GET /webhooks/{webhook.id}/{webhook.token}/messages/{message.id}
export async function getWebhookMessage(
  id: string,
  token: string,
  messageId: string,
  threadId?: string,
): Promise<DiscordMessage> {
  const url = new URL(
    `${DISCORD_API_BASE}/webhooks/${id}/${token}/messages/${messageId}`,
  );
  if (threadId) url.searchParams.set('thread_id', threadId);
  const res = await fetch(url.toString());
  return handleResponse<DiscordMessage>(res);
}

// PATCH /webhooks/{webhook.id}/{webhook.token}/messages/{message.id}
export async function editWebhookMessage(
  id: string,
  token: string,
  messageId: string,
  params: Partial<ExecuteWebhookParams>,
  threadId?: string,
): Promise<DiscordMessage> {
  const url = new URL(
    `${DISCORD_API_BASE}/webhooks/${id}/${token}/messages/${messageId}`,
  );
  if (threadId) url.searchParams.set('thread_id', threadId);
  const res = await fetch(url.toString(), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return handleResponse<DiscordMessage>(res);
}

// DELETE /webhooks/{webhook.id}/{webhook.token}/messages/{message.id}
export async function deleteWebhookMessage(
  id: string,
  token: string,
  messageId: string,
  threadId?: string,
): Promise<void> {
  const url = new URL(
    `${DISCORD_API_BASE}/webhooks/${id}/${token}/messages/${messageId}`,
  );
  if (threadId) url.searchParams.set('thread_id', threadId);
  const res = await fetch(url.toString(), { method: 'DELETE' });
  return handleResponse<void>(res);
}

// Helper: build avatar URL from webhook
export function getAvatarUrl(
  id: string,
  avatar: string | null,
  size = 80,
): string {
  if (avatar)
    return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=${size}`;
  const defaultIndex = (BigInt(id) >> 22n) % 6n;
  return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
}
