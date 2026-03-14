import type { SavedWebhook } from './types';

const STORAGE_KEY = 'discord_webhooks';

export function loadWebhooks(): SavedWebhook[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedWebhook[];
  } catch {
    return [];
  }
}

export function saveWebhooks(webhooks: SavedWebhook[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(webhooks));
}

export function addWebhook(webhook: SavedWebhook): SavedWebhook[] {
  const current = loadWebhooks();
  // Avoid duplicates by id
  const filtered = current.filter((w) => w.id !== webhook.id);
  const updated = [...filtered, webhook];
  saveWebhooks(updated);
  return updated;
}

export function updateWebhook(
  id: string,
  changes: Partial<SavedWebhook>,
): SavedWebhook[] {
  const current = loadWebhooks();
  const updated = current.map((w) => (w.id === id ? { ...w, ...changes } : w));
  saveWebhooks(updated);
  return updated;
}

export function removeWebhook(id: string): SavedWebhook[] {
  const current = loadWebhooks();
  const updated = current.filter((w) => w.id !== id);
  saveWebhooks(updated);
  return updated;
}
