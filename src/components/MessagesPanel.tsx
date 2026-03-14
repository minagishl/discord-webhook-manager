import { useState } from 'preact/hooks';
import type {
  SavedWebhook,
  DiscordMessage,
  DiscordEmbed,
  ExecuteWebhookParams,
} from '../types';
import {
  getWebhookMessage,
  editWebhookMessage,
  deleteWebhookMessage,
  getErrorMessage,
} from '../api';
import { FormField, Input, Textarea, Button, Alert } from './UI';
import { MessagePreview } from './MessagePreview';

interface MessagesPanelProps {
  webhook: SavedWebhook;
}

type ViewState = 'lookup' | 'view' | 'edit';

export function MessagesPanel({ webhook }: MessagesPanelProps) {
  const [messageId, setMessageId] = useState('');
  const [threadId, setThreadId] = useState('');
  const [message, setMessage] = useState<DiscordMessage | null>(null);
  const [viewState, setViewState] = useState<ViewState>('lookup');

  // Edit state
  const [editContent, setEditContent] = useState('');
  const [editEmbedJson, setEditEmbedJson] = useState('');
  const [editJsonError, setEditJsonError] = useState<string | null>(null);

  // Async state
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleFetch() {
    if (!messageId.trim()) {
      setError('Please enter a message ID.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    setMessage(null);
    try {
      const msg = await getWebhookMessage(
        webhook.id,
        webhook.token,
        messageId.trim(),
        threadId.trim() || undefined,
      );
      setMessage(msg);
      setViewState('view');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  function startEdit() {
    if (!message) return;
    setEditContent(message.content ?? '');
    setEditEmbedJson(
      message.embeds?.length ? JSON.stringify(message.embeds, null, 2) : '',
    );
    setEditJsonError(null);
    setViewState('edit');
  }

  async function handleSaveEdit() {
    if (!message) return;
    setEditJsonError(null);

    const params: Partial<ExecuteWebhookParams> = {};
    if (editContent.trim() !== (message.content ?? '')) {
      params.content = editContent;
    }

    let parsedEmbeds: DiscordEmbed[] | undefined;
    if (editEmbedJson.trim()) {
      try {
        parsedEmbeds = JSON.parse(editEmbedJson.trim());
        if (!Array.isArray(parsedEmbeds)) {
          setEditJsonError('Embeds must be a JSON array.');
          return;
        }
        params.embeds = parsedEmbeds;
      } catch {
        setEditJsonError('Invalid JSON for embeds.');
        return;
      }
    } else if (message.embeds?.length) {
      params.embeds = [];
    }

    setEditLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await editWebhookMessage(
        webhook.id,
        webhook.token,
        message.id,
        params,
        threadId.trim() || undefined,
      );
      setMessage(updated);
      setViewState('view');
      setSuccess('Message updated successfully!');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    if (!message) return;
    setDeleteLoading(true);
    setError(null);
    try {
      await deleteWebhookMessage(
        webhook.id,
        webhook.token,
        message.id,
        threadId.trim() || undefined,
      );
      setMessage(null);
      setMessageId('');
      setViewState('lookup');
      setSuccess('Message deleted successfully!');
      setShowDeleteConfirm(false);
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
        <h1 class="text-[#f2f3f5] text-xl font-bold mb-6">
          Message Management
        </h1>

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

        {/* Lookup form */}
        <div class="bg-[#2b2d31] rounded-lg p-5 mb-6">
          <h2 class="text-[#f2f3f5] font-semibold text-sm uppercase tracking-wide mb-4">
            Fetch Message
          </h2>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <FormField label="Message ID" required>
              <Input
                value={messageId}
                onInput={setMessageId}
                placeholder="Message snowflake ID"
                disabled={loading}
              />
            </FormField>
            <FormField label="Thread ID" hint="Optional, for threaded messages">
              <Input
                value={threadId}
                onInput={setThreadId}
                placeholder="Thread snowflake ID"
                disabled={loading}
              />
            </FormField>
          </div>
          <Button onClick={handleFetch} disabled={loading}>
            {loading ? 'Fetching…' : 'Fetch Message'}
          </Button>
        </div>

        {/* Message view */}
        {message && viewState === 'view' && (
          <div class="bg-[#2b2d31] rounded-lg p-5 mb-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-[#f2f3f5] font-semibold text-sm uppercase tracking-wide">
                Message
              </h2>
              <div class="flex gap-2">
                <Button variant="ghost" onClick={startEdit}>
                  Edit
                </Button>
                {!showDeleteConfirm ? (
                  <Button
                    variant="danger"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="danger"
                      disabled={deleteLoading}
                      onClick={handleDelete}
                    >
                      {deleteLoading ? 'Deleting…' : 'Confirm Delete'}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Message metadata */}
            <div class="text-[#949ba4] text-xs mb-3 space-y-1">
              <div>
                ID:{' '}
                <code class="bg-[#1e1f22] px-1 py-0.5 rounded font-mono text-[#dbdee1]">
                  {message.id}
                </code>
              </div>
              <div>
                Channel:{' '}
                <code class="bg-[#1e1f22] px-1 py-0.5 rounded font-mono text-[#dbdee1]">
                  {message.channel_id}
                </code>
              </div>
              <div>Sent: {new Date(message.timestamp).toLocaleString()}</div>
              {message.edited_timestamp && (
                <div>
                  Edited: {new Date(message.edited_timestamp).toLocaleString()}
                </div>
              )}
            </div>

            <div class="border-t border-[#383a40] pt-3">
              <MessagePreview
                message={message}
                webhookId={webhook.id}
                webhookAvatar={webhook.avatar}
                webhookName={webhook.name}
              />
            </div>
          </div>
        )}

        {/* Edit form */}
        {message && viewState === 'edit' && (
          <div class="bg-[#2b2d31] rounded-lg p-5 mb-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-[#f2f3f5] font-semibold text-sm uppercase tracking-wide">
                Edit Message
              </h2>
              <Button variant="ghost" onClick={() => setViewState('view')}>
                Cancel
              </Button>
            </div>

            <FormField label="Content">
              <Textarea
                value={editContent}
                onInput={setEditContent}
                placeholder="Message content"
                rows={4}
                disabled={editLoading}
                maxLength={2000}
              />
              <div class="text-right text-xs text-[#4e5058] mt-1">
                {editContent.length}/2000
              </div>
            </FormField>

            <FormField
              label="Embeds (JSON Array)"
              hint="Paste an array of embed objects. Leave blank to remove all embeds."
            >
              <Textarea
                value={editEmbedJson}
                onInput={(v) => {
                  setEditEmbedJson(v);
                  setEditJsonError(null);
                }}
                placeholder='[{"title": "My Embed", "description": "…"}]'
                rows={6}
                disabled={editLoading}
              />
              {editJsonError && (
                <p class="text-[#f23f42] text-xs mt-1">{editJsonError}</p>
              )}
            </FormField>

            <div class="flex justify-end">
              <Button onClick={handleSaveEdit} disabled={editLoading}>
                {editLoading ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}

        {/* Info panel */}
        <div class="bg-[#2b2d31] rounded-lg p-5 text-[#949ba4] text-sm">
          <h3 class="text-[#f2f3f5] font-semibold text-xs uppercase tracking-wide mb-3">
            How to get a Message ID
          </h3>
          <ol class="list-decimal list-inside space-y-1.5 text-[#b5bac1]">
            <li>Enable Developer Mode in Discord settings (Advanced).</li>
            <li>Right-click any message sent by this webhook.</li>
            <li>Click "Copy Message ID".</li>
            <li>Paste the ID above and click Fetch Message.</li>
          </ol>
          <p class="mt-3 text-xs text-[#6d6f78]">
            Note: You can only fetch, edit, or delete messages that were sent by
            this specific webhook.
          </p>
        </div>
      </div>
    </div>
  );
}
