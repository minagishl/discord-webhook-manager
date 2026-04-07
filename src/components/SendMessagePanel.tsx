import { useState } from 'preact/hooks';
import type {
  SavedWebhook,
  DiscordEmbed,
  EmbedField,
  ExecuteWebhookParams,
  DiscordMessage,
} from '../types';
import { executeWebhook, getErrorMessage } from '../api';
import { FormField, Input, Textarea, Button, Alert } from './UI';
import { MessagePreview } from './MessagePreview';
import { X, ChevronRight } from 'lucide-preact';

interface SendMessagePanelProps {
  webhook: SavedWebhook;
}

type SendMode = 'simple' | 'embed';

export function SendMessagePanel({ webhook }: SendMessagePanelProps) {
  const [mode, setMode] = useState<SendMode>('simple');

  // Simple message
  const [content, setContent] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [tts, setTts] = useState(false);
  const [threadId, setThreadId] = useState('');
  const [wait, setWait] = useState(true);
  const [files, setFiles] = useState<File[]>([]);

  // Embed builder
  const [embeds, setEmbeds] = useState<DiscordEmbed[]>([]);
  const [editingEmbed, setEditingEmbed] =
    useState<DiscordEmbed>(createEmptyEmbed());

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<DiscordMessage | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  function createEmptyEmbed(): DiscordEmbed {
    return {
      title: '',
      description: '',
      url: '',
      color: undefined,
      author: { name: '', url: '', icon_url: '' },
      footer: { text: '', icon_url: '' },
      image: { url: '' },
      thumbnail: { url: '' },
      fields: [],
    };
  }

  function addField() {
    setEditingEmbed((prev) => ({
      ...prev,
      fields: [...(prev.fields ?? []), { name: '', value: '', inline: false }],
    }));
  }

  function updateField(
    idx: number,
    key: keyof EmbedField,
    value: string | boolean,
  ) {
    setEditingEmbed((prev) => {
      const fields = [...(prev.fields ?? [])];
      fields[idx] = { ...fields[idx], [key]: value };
      return { ...prev, fields };
    });
  }

  function removeField(idx: number) {
    setEditingEmbed((prev) => ({
      ...prev,
      fields: (prev.fields ?? []).filter((_, i) => i !== idx),
    }));
  }

  function addEmbed() {
    const clean = cleanEmbed(editingEmbed);
    setEmbeds((prev) => [...prev, clean]);
    setEditingEmbed(createEmptyEmbed());
  }

  function removeEmbed(idx: number) {
    setEmbeds((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const selectedFiles = input.files ? Array.from(input.files) : [];
    setFiles(selectedFiles);
  }

  function cleanEmbed(embed: DiscordEmbed): DiscordEmbed {
    const result: DiscordEmbed = {};
    if (embed.title?.trim()) result.title = embed.title.trim();
    if (embed.description?.trim())
      result.description = embed.description.trim();
    if (embed.url?.trim()) result.url = embed.url.trim();
    if (embed.color != null) result.color = embed.color;
    if (embed.author?.name?.trim()) {
      result.author = { name: embed.author.name.trim() };
      if (embed.author.url?.trim()) result.author.url = embed.author.url.trim();
      if (embed.author.icon_url?.trim())
        result.author.icon_url = embed.author.icon_url.trim();
    }
    if (embed.footer?.text?.trim()) {
      result.footer = { text: embed.footer.text.trim() };
      if (embed.footer.icon_url?.trim())
        result.footer.icon_url = embed.footer.icon_url.trim();
    }
    if (embed.image?.url?.trim())
      result.image = { url: embed.image.url.trim() };
    if (embed.thumbnail?.url?.trim())
      result.thumbnail = { url: embed.thumbnail.url.trim() };
    if (embed.fields && embed.fields.length > 0) {
      result.fields = embed.fields
        .filter((f) => f.name.trim() && f.value.trim())
        .map((f) => ({
          name: f.name.trim(),
          value: f.value.trim(),
          inline: f.inline,
        }));
    }
    if (embed.timestamp?.trim()) result.timestamp = embed.timestamp.trim();
    return result;
  }

  async function handleSend() {
    const params: ExecuteWebhookParams = {};
    if (content.trim()) params.content = content.trim();
    if (username.trim()) params.username = username.trim();
    if (avatarUrl.trim()) params.avatar_url = avatarUrl.trim();
    if (tts) params.tts = true;
    if (threadId.trim()) params.thread_id = threadId.trim();

    const allEmbeds =
      mode === 'embed'
        ? [...embeds, cleanEmbed(editingEmbed)].filter(
            (e) => Object.keys(e).length > 0,
          )
        : embeds;

    if (allEmbeds.length > 0) params.embeds = allEmbeds;
    if (files.length > 0) params.files = files;

    if (
      !params.content &&
      (!params.embeds || params.embeds.length === 0) &&
      files.length === 0
    ) {
      setError('You must provide content, an embed, or at least one file.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setSentMessage(null);

    try {
      const msg = await executeWebhook(webhook.id, webhook.token, params, wait);
      if (msg) {
        setSentMessage(msg);
        setSuccessMsg(`Message sent! ID: ${msg.id}`);
      } else {
        setSuccessMsg('Message sent (no response body).');
      }
      setContent('');
      setFiles([]);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  // Build preview message
  const previewMessage: DiscordMessage | null = (() => {
    const allEmbeds =
      mode === 'embed'
        ? [...embeds, cleanEmbed(editingEmbed)].filter(
            (e) => Object.keys(e).length > 0,
          )
        : [];
    if (!content.trim() && allEmbeds.length === 0) return null;
    return {
      id: 'preview',
      channel_id: webhook.channel_id ?? '',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      edited_timestamp: null,
      tts: false,
      mention_everyone: false,
      mentions: [],
      mention_roles: [],
      attachments: [],
      embeds: allEmbeds,
    };
  })();

  return (
    <div class="flex flex-col h-full">
      {/* Mode switch */}
      <div class="px-6 pt-5 pb-0 shrink-0">
        <h1 class="text-[#f2f3f5] text-xl font-bold mb-4">Send Message</h1>
        <div class="flex gap-2 mb-4">
          {(['simple', 'embed'] as SendMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              class={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                mode === m
                  ? 'bg-[#5865f2] text-white'
                  : 'bg-[#383a40] text-[#949ba4] hover:text-[#dbdee1]'
              }`}
            >
              {m === 'simple' ? 'Simple Message' : 'Embed Builder'}
            </button>
          ))}
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-6 pb-6 space-y-0">
        {error && (
          <div class="mb-4">
            <Alert
              type="error"
              message={error}
              onDismiss={() => setError(null)}
            />
          </div>
        )}
        {successMsg && (
          <div class="mb-4">
            <Alert
              type="success"
              message={successMsg}
              onDismiss={() => setSuccessMsg(null)}
            />
          </div>
        )}

        {/* Common fields */}
        <div class="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Username Override">
            <Input
              value={username}
              onInput={setUsername}
              placeholder={webhook.name}
              disabled={loading}
            />
          </FormField>
          <FormField label="Avatar URL Override">
            <Input
              value={avatarUrl}
              onInput={setAvatarUrl}
              placeholder="https://…"
              disabled={loading}
            />
          </FormField>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <FormField label="Thread ID" hint="Send to a thread (optional)">
            <Input
              value={threadId}
              onInput={setThreadId}
              placeholder="Thread snowflake ID"
              disabled={loading}
            />
          </FormField>
          <FormField label="Options">
            <div class="flex flex-col gap-2 pt-1">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tts}
                  onChange={(e) =>
                    setTts((e.target as HTMLInputElement).checked)
                  }
                  class="w-4 h-4 rounded accent-[#5865f2]"
                />
                <span class="text-[#dbdee1] text-sm">TTS Message</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wait}
                  onChange={(e) =>
                    setWait((e.target as HTMLInputElement).checked)
                  }
                  class="w-4 h-4 rounded accent-[#5865f2]"
                />
                <span class="text-[#dbdee1] text-sm">Wait for response</span>
              </label>
            </div>
          </FormField>
        </div>

        {/* Content */}
        <FormField label="Message Content" hint="Up to 2000 characters">
          <Textarea
            value={content}
            onInput={setContent}
            placeholder="Enter your message…"
            rows={4}
            disabled={loading}
            maxLength={2000}
          />
          <div class="text-right text-xs text-[#4e5058] mt-1">
            {content.length}/2000
          </div>
        </FormField>

        <FormField
          label="Attachments"
          hint="Upload files to send with the message"
        >
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            disabled={loading}
            class="w-full bg-[#1e1f22] border border-[#1e1f22] text-[#dbdee1] rounded-sm px-3 py-2 text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-[#5865f2] file:text-white file:text-xs file:font-semibold hover:file:bg-[#4752c4] disabled:opacity-50"
          />
          {files.length > 0 && (
            <div class="mt-2 text-xs text-[#b5bac1] space-y-1">
              {files.map((file, index) => (
                <div key={`${file.name}-${index}`} class="truncate">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              ))}
            </div>
          )}
        </FormField>

        {/* Embed builder */}
        {mode === 'embed' && (
          <div class="space-y-4">
            {/* Existing embeds */}
            {embeds.map((embed, i) => (
              <div
                key={i}
                class="bg-[#2b2d31] rounded-lg p-4 flex items-center gap-3"
              >
                <div class="flex-1 text-sm text-[#dbdee1] truncate">
                  Embed {i + 1}:{' '}
                  {embed.title || embed.description || '(no title)'}
                </div>
                <Button variant="danger" onClick={() => removeEmbed(i)}>
                  Remove
                </Button>
              </div>
            ))}

            {/* Embed editor */}
            {embeds.length < 10 && (
              <div class="bg-[#2b2d31] rounded-lg p-5">
                <h3 class="text-[#f2f3f5] font-semibold text-sm uppercase tracking-wide mb-4">
                  {embeds.length === 0
                    ? 'Build Embed'
                    : `Embed ${embeds.length + 1}`}
                </h3>

                <div class="grid grid-cols-2 gap-4">
                  <FormField label="Title">
                    <Input
                      value={editingEmbed.title ?? ''}
                      onInput={(v) =>
                        setEditingEmbed((p) => ({ ...p, title: v }))
                      }
                      placeholder="Embed title"
                    />
                  </FormField>
                  <FormField label="URL">
                    <Input
                      value={editingEmbed.url ?? ''}
                      onInput={(v) =>
                        setEditingEmbed((p) => ({ ...p, url: v }))
                      }
                      placeholder="https://…"
                    />
                  </FormField>
                </div>

                <FormField label="Description">
                  <Textarea
                    value={editingEmbed.description ?? ''}
                    onInput={(v) =>
                      setEditingEmbed((p) => ({ ...p, description: v }))
                    }
                    placeholder="Embed description"
                    rows={3}
                  />
                </FormField>

                <div class="grid grid-cols-2 gap-4">
                  <FormField label="Color (hex)" hint="e.g. #5865F2">
                    <Input
                      value={
                        editingEmbed.color != null
                          ? `#${editingEmbed.color.toString(16).padStart(6, '0')}`
                          : ''
                      }
                      onInput={(v) => {
                        const hex = v.replace('#', '');
                        const num = parseInt(hex, 16);
                        setEditingEmbed((p) => ({
                          ...p,
                          color: isNaN(num) ? undefined : num,
                        }));
                      }}
                      placeholder="#5865F2"
                    />
                  </FormField>
                  <FormField label="Timestamp (ISO)">
                    <Input
                      value={editingEmbed.timestamp ?? ''}
                      onInput={(v) =>
                        setEditingEmbed((p) => ({ ...p, timestamp: v }))
                      }
                      placeholder={new Date().toISOString()}
                    />
                  </FormField>
                </div>

                {/* Author */}
                <h4 class="text-[#b5bac1] text-xs font-bold uppercase tracking-wide mt-3 mb-2">
                  Author
                </h4>
                <div class="grid grid-cols-3 gap-3">
                  <FormField label="Name">
                    <Input
                      value={editingEmbed.author?.name ?? ''}
                      onInput={(v) =>
                        setEditingEmbed((p) => ({
                          ...p,
                          author: { ...(p.author ?? { name: '' }), name: v },
                        }))
                      }
                      placeholder="Author name"
                    />
                  </FormField>
                  <FormField label="URL">
                    <Input
                      value={editingEmbed.author?.url ?? ''}
                      onInput={(v) =>
                        setEditingEmbed((p) => ({
                          ...p,
                          author: { ...(p.author ?? { name: '' }), url: v },
                        }))
                      }
                      placeholder="https://…"
                    />
                  </FormField>
                  <FormField label="Icon URL">
                    <Input
                      value={editingEmbed.author?.icon_url ?? ''}
                      onInput={(v) =>
                        setEditingEmbed((p) => ({
                          ...p,
                          author: {
                            ...(p.author ?? { name: '' }),
                            icon_url: v,
                          },
                        }))
                      }
                      placeholder="https://…"
                    />
                  </FormField>
                </div>

                {/* Footer */}
                <h4 class="text-[#b5bac1] text-xs font-bold uppercase tracking-wide mt-3 mb-2">
                  Footer
                </h4>
                <div class="grid grid-cols-2 gap-3">
                  <FormField label="Text">
                    <Input
                      value={editingEmbed.footer?.text ?? ''}
                      onInput={(v) =>
                        setEditingEmbed((p) => ({
                          ...p,
                          footer: { ...(p.footer ?? { text: '' }), text: v },
                        }))
                      }
                      placeholder="Footer text"
                    />
                  </FormField>
                  <FormField label="Icon URL">
                    <Input
                      value={editingEmbed.footer?.icon_url ?? ''}
                      onInput={(v) =>
                        setEditingEmbed((p) => ({
                          ...p,
                          footer: {
                            ...(p.footer ?? { text: '' }),
                            icon_url: v,
                          },
                        }))
                      }
                      placeholder="https://…"
                    />
                  </FormField>
                </div>

                {/* Images */}
                <div class="grid grid-cols-2 gap-3">
                  <FormField label="Image URL">
                    <Input
                      value={editingEmbed.image?.url ?? ''}
                      onInput={(v) =>
                        setEditingEmbed((p) => ({ ...p, image: { url: v } }))
                      }
                      placeholder="https://…"
                    />
                  </FormField>
                  <FormField label="Thumbnail URL">
                    <Input
                      value={editingEmbed.thumbnail?.url ?? ''}
                      onInput={(v) =>
                        setEditingEmbed((p) => ({
                          ...p,
                          thumbnail: { url: v },
                        }))
                      }
                      placeholder="https://…"
                    />
                  </FormField>
                </div>

                {/* Fields */}
                <h4 class="text-[#b5bac1] text-xs font-bold uppercase tracking-wide mt-3 mb-2">
                  Fields ({(editingEmbed.fields ?? []).length}/25)
                </h4>
                <div class="space-y-2 mb-3">
                  {(editingEmbed.fields ?? []).map((field, i) => (
                    <div
                      key={i}
                      class="bg-[#1e1f22] rounded p-3 flex gap-2 items-start"
                    >
                      <div class="flex-1 grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={field.name}
                          onInput={(e) =>
                            updateField(
                              i,
                              'name',
                              (e.target as HTMLInputElement).value,
                            )
                          }
                          placeholder="Field name"
                          class="bg-[#2b2d31] border border-[#383a40] text-[#dbdee1] rounded px-2 py-1 text-sm focus:outline-none focus:border-[#5865f2] placeholder-[#4e5058]"
                        />
                        <input
                          type="text"
                          value={field.value}
                          onInput={(e) =>
                            updateField(
                              i,
                              'value',
                              (e.target as HTMLInputElement).value,
                            )
                          }
                          placeholder="Field value"
                          class="bg-[#2b2d31] border border-[#383a40] text-[#dbdee1] rounded px-2 py-1 text-sm focus:outline-none focus:border-[#5865f2] placeholder-[#4e5058]"
                        />
                      </div>
                      <label class="flex items-center gap-1 text-xs text-[#949ba4] whitespace-nowrap pt-1.5">
                        <input
                          type="checkbox"
                          checked={field.inline}
                          onChange={(e) =>
                            updateField(
                              i,
                              'inline',
                              (e.target as HTMLInputElement).checked,
                            )
                          }
                          class="accent-[#5865f2]"
                        />
                        Inline
                      </label>
                      <button
                        onClick={() => removeField(i)}
                        class="text-[#f23f42] hover:text-red-300 text-sm mt-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                {(editingEmbed.fields ?? []).length < 25 && (
                  <Button variant="ghost" onClick={addField}>
                    + Add Field
                  </Button>
                )}

                <div class="flex justify-end mt-4">
                  <Button variant="ghost" onClick={addEmbed}>
                    + Add Embed to Message
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preview */}
        {previewMessage && (
          <div class="mt-6">
            <button
              onClick={() => setShowPreview((v) => !v)}
              class="text-[#949ba4] text-xs uppercase tracking-wide font-semibold flex items-center gap-1 hover:text-[#dbdee1] transition-colors mb-2"
            >
              <ChevronRight
                size={12}
                style={{
                  transform: showPreview ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s',
                }}
              />
              Message Preview
            </button>
            {showPreview && (
              <div class="bg-[#313338] rounded-lg py-3 border border-[#2b2d31]">
                <MessagePreview
                  message={previewMessage}
                  webhookId={webhook.id}
                  webhookAvatar={webhook.avatar}
                  webhookName={username.trim() || webhook.name}
                />
              </div>
            )}
          </div>
        )}

        {/* Send button */}
        <div class="flex justify-end pt-4">
          <Button onClick={handleSend} disabled={loading} class="px-8">
            {loading ? 'Sending…' : 'Send Message'}
          </Button>
        </div>

        {/* Last sent message */}
        {sentMessage && (
          <div class="mt-4 bg-[#2b2d31] rounded-lg p-4">
            <h3 class="text-[#b5bac1] text-xs font-bold uppercase tracking-wide mb-2">
              Sent Message
            </h3>
            <div class="text-[#949ba4] text-xs mb-2">
              Message ID:{' '}
              <code class="bg-[#1e1f22] px-1 py-0.5 rounded font-mono text-[#dbdee1]">
                {sentMessage.id}
              </code>
            </div>
            <MessagePreview
              message={sentMessage}
              webhookId={webhook.id}
              webhookAvatar={webhook.avatar}
              webhookName={sentMessage.author?.username ?? webhook.name}
            />
          </div>
        )}
      </div>
    </div>
  );
}
