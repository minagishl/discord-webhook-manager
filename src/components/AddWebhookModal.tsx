import { useState } from 'preact/hooks';
import type { SavedWebhook } from '../types';
import { parseWebhookUrl, getWebhookWithToken, getErrorMessage } from '../api';
import { Modal, FormField, Input, Button, Alert } from './UI';

interface AddWebhookModalProps {
  onAdd: (webhook: SavedWebhook) => void;
  onClose: () => void;
}

export function AddWebhookModal({ onAdd, onClose }: AddWebhookModalProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a webhook URL.');
      return;
    }

    const parsed = parseWebhookUrl(trimmed);
    if (!parsed) {
      setError(
        'Invalid Discord webhook URL. Expected format: https://discord.com/api/webhooks/{id}/{token}',
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const wh = await getWebhookWithToken(parsed.id, parsed.token);
      const saved: SavedWebhook = {
        id: wh.id,
        token: parsed.token,
        name: wh.name ?? 'Unnamed Webhook',
        avatar: wh.avatar,
        channel_id: wh.channel_id,
        guild_id: wh.guild_id ?? null,
        url: trimmed,
        addedAt: Date.now(),
      };
      onAdd(saved);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title="Add Webhook"
      onClose={onClose}
      footer={
        <div class="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={loading}>
            {loading ? 'Verifying…' : 'Add Webhook'}
          </Button>
        </div>
      }
    >
      <div>
        {error && (
          <div class="mb-4">
            <Alert
              type="error"
              message={error}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        <FormField
          label="Webhook URL"
          required
          hint="Your webhook URL from Discord channel settings. It will be verified before adding."
        >
          <Input
            value={url}
            onInput={setUrl}
            placeholder="https://discord.com/api/webhooks/…"
            disabled={loading}
          />
        </FormField>

        <div class="bg-[#23a559]/10 border border-[#23a559]/40 rounded p-3 mt-2">
          <p class="text-[#23a559] text-xs font-semibold mb-1">
            Your webhook URL stays on your device
          </p>
          <p class="text-[#949ba4] text-xs leading-relaxed">
            Webhook URLs are saved only in your browser's{' '}
            <code class="bg-[#1e1f22] px-1 rounded font-mono">
              localStorage
            </code>
            . No data is sent to any external server — all requests go directly
            from your browser to the Discord API.
          </p>
        </div>

        <div class="bg-[#2b2d31] rounded p-3 mt-2">
          <p class="text-[#b5bac1] text-xs font-semibold mb-1.5">
            How to get your webhook URL:
          </p>
          <ol class="text-[#949ba4] text-xs list-decimal list-inside space-y-1">
            <li>Open Discord channel settings</li>
            <li>Go to Integrations → Webhooks</li>
            <li>Create or select a webhook</li>
            <li>Click "Copy Webhook URL"</li>
          </ol>
        </div>
      </div>
    </Modal>
  );
}
