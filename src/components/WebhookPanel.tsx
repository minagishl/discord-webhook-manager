import { useState } from 'preact/hooks';
import type { SavedWebhook } from '../types';
import {
  modifyWebhookWithToken,
  deleteWebhookWithToken,
  getAvatarUrl,
  getErrorMessage,
} from '../api';
import { FormField, Input, Button, Alert } from './UI';

interface WebhookPanelProps {
  webhook: SavedWebhook;
  onWebhookUpdated: (updated: SavedWebhook) => void;
  onWebhookDeleted: (id: string) => void;
}

export function WebhookPanel({
  webhook,
  onWebhookUpdated,
  onWebhookDeleted,
}: WebhookPanelProps) {
  const [name, setName] = useState(webhook.name ?? '');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const currentAvatarUrl = getAvatarUrl(webhook.id, webhook.avatar, 128);

  async function handleSave() {
    if (!name.trim()) {
      setError('Webhook name is required.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const params: { name?: string; avatar?: string | null } = {
        name: name.trim(),
      };
      if (avatarUrl.trim()) {
        // Convert image URL to base64 data URI if needed
        params.avatar = avatarUrl.trim();
      }
      const updated = await modifyWebhookWithToken(
        webhook.id,
        webhook.token,
        params,
      );
      onWebhookUpdated({
        ...webhook,
        name: updated.name ?? webhook.name,
        avatar: updated.avatar,
      });
      setSuccess('Webhook updated successfully!');
      setAvatarUrl('');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    setError(null);
    try {
      await deleteWebhookWithToken(webhook.id, webhook.token);
      onWebhookDeleted(webhook.id);
    } catch (e) {
      setError(getErrorMessage(e));
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-2xl">
        <h1 class="text-[#f2f3f5] text-xl font-bold mb-6">Manage Webhook</h1>

        {error && (
          <div class="mb-4">
            <Alert
              type="error"
              message={error}
              onDismiss={() => setError(null)}
            />
          </div>
        )}
        {success && (
          <div class="mb-4">
            <Alert
              type="success"
              message={success}
              onDismiss={() => setSuccess(null)}
            />
          </div>
        )}

        {/* Webhook info card */}
        <div class="bg-[#2b2d31] rounded-lg p-5 mb-6 flex items-start gap-5">
          <img
            src={currentAvatarUrl}
            alt={webhook.name}
            class="w-20 h-20 rounded-full object-cover shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://cdn.discordapp.com/embed/avatars/0.png';
            }}
          />
          <div class="flex-1 min-w-0">
            <div class="text-[#f2f3f5] font-bold text-lg truncate">
              {webhook.name}
            </div>
            <div class="text-[#949ba4] text-sm mt-1">
              <span class="font-medium text-[#b5bac1]">ID:</span>{' '}
              <code class="bg-[#1e1f22] px-1.5 py-0.5 rounded text-xs font-mono text-[#dbdee1]">
                {webhook.id}
              </code>
            </div>
            {webhook.channel_id && (
              <div class="text-[#949ba4] text-sm mt-1">
                <span class="font-medium text-[#b5bac1]">Channel ID:</span>{' '}
                <code class="bg-[#1e1f22] px-1.5 py-0.5 rounded text-xs font-mono text-[#dbdee1]">
                  {webhook.channel_id}
                </code>
              </div>
            )}
            {webhook.guild_id && (
              <div class="text-[#949ba4] text-sm mt-1">
                <span class="font-medium text-[#b5bac1]">Guild ID:</span>{' '}
                <code class="bg-[#1e1f22] px-1.5 py-0.5 rounded text-xs font-mono text-[#dbdee1]">
                  {webhook.guild_id}
                </code>
              </div>
            )}
            <div class="text-[#949ba4] text-sm mt-1">
              <span class="font-medium text-[#b5bac1]">Type:</span> Incoming
              Webhook
            </div>
          </div>
        </div>

        {/* Webhook URL */}
        <div class="bg-[#2b2d31] rounded-lg p-5 mb-6">
          <h2 class="text-[#f2f3f5] font-semibold text-sm uppercase tracking-wide mb-3">
            Webhook URL
          </h2>
          <div class="flex gap-2">
            <input
              type="text"
              value={webhook.url}
              readOnly
              class="flex-1 bg-[#1e1f22] border border-[#1e1f22] text-[#dbdee1] rounded-sm px-3 py-2 text-sm font-mono focus:outline-none select-all"
            />
            <Button
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText(webhook.url);
                setSuccess('URL copied to clipboard!');
              }}
            >
              Copy
            </Button>
          </div>
          <p class="text-[#da373c] text-xs mt-2">
            Keep this URL secret! Anyone with this URL can post messages to your
            channel.
          </p>
        </div>

        {/* Edit section */}
        <div class="bg-[#2b2d31] rounded-lg p-5 mb-6">
          <h2 class="text-[#f2f3f5] font-semibold text-sm uppercase tracking-wide mb-4">
            Edit Webhook
          </h2>

          <FormField label="Webhook Name" required>
            <Input
              value={name}
              onInput={setName}
              placeholder="Enter webhook name"
              disabled={loading}
            />
          </FormField>

          <FormField
            label="Avatar Image URL"
            hint="Paste a direct image URL. Leave blank to keep the current avatar."
          >
            <Input
              value={avatarUrl}
              onInput={setAvatarUrl}
              placeholder="https://example.com/avatar.png"
              disabled={loading}
            />
          </FormField>

          <div class="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Danger zone */}
        <div class="bg-[#2b2d31] rounded-lg p-5 border border-[#da373c]/40">
          <h2 class="text-[#f23f42] font-semibold text-sm uppercase tracking-wide mb-3">
            Danger Zone
          </h2>
          <p class="text-[#949ba4] text-sm mb-4">
            Permanently delete this webhook. This action cannot be undone.
          </p>
          {!showDeleteConfirm ? (
            <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
              Delete Webhook
            </Button>
          ) : (
            <div class="flex items-center gap-3">
              <span class="text-[#f23f42] text-sm font-medium">
                Are you sure?
              </span>
              <Button
                variant="danger"
                disabled={deleteLoading}
                onClick={handleDelete}
              >
                {deleteLoading ? 'Deleting…' : 'Yes, Delete'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
