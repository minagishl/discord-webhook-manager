import type { DiscordEmbed, DiscordMessage } from '../types';
import { getAvatarUrl } from '../api';

interface MessagePreviewProps {
  message: DiscordMessage;
  webhookId?: string;
  webhookAvatar?: string | null;
  webhookName?: string | null;
}

export function MessagePreview({
  message,
  webhookId,
  webhookAvatar,
  webhookName,
}: MessagePreviewProps) {
  const avatarUrl = webhookId
    ? getAvatarUrl(webhookId, webhookAvatar ?? null)
    : 'https://cdn.discordapp.com/embed/avatars/0.png';

  const displayName = webhookName ?? message.author?.username ?? 'Webhook';
  const ts = new Date(message.timestamp);
  const timeStr = ts.toLocaleString();

  return (
    <div class="flex gap-4 py-1 px-4 hover:bg-[#2e3035] group rounded-sm">
      <img
        src={avatarUrl}
        alt={displayName}
        class="w-10 h-10 rounded-full mt-0.5 shrink-0 object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src =
            'https://cdn.discordapp.com/embed/avatars/0.png';
        }}
      />
      <div class="flex-1 min-w-0">
        <div class="flex items-baseline gap-2 flex-wrap">
          <span class="text-[#f2f3f5] font-medium text-sm">{displayName}</span>
          <span class="text-[#4e5058] text-xs font-medium px-1 py-0.5 rounded bg-[#4e5058]/30 text-[#949ba4]">
            BOT
          </span>
          <span class="text-[#4e5058] text-xs">{timeStr}</span>
        </div>
        {message.content && (
          <p class="text-[#dbdee1] text-sm mt-0.5 whitespace-pre-wrap wrap-break-word">
            {message.content}
          </p>
        )}
        {message.embeds?.map((embed, i) => (
          <EmbedPreview key={i} embed={embed} />
        ))}
      </div>
    </div>
  );
}

interface EmbedPreviewProps {
  embed: DiscordEmbed;
}

function EmbedPreview({ embed }: EmbedPreviewProps) {
  const borderColor =
    embed.color != null
      ? `#${embed.color.toString(16).padStart(6, '0')}`
      : '#4f545c';

  return (
    <div
      class="mt-2 rounded-sm max-w-xl bg-[#2b2d31] border-l-4 flex gap-3 p-3"
      style={{ borderLeftColor: borderColor }}
    >
      <div class="flex-1 min-w-0">
        {embed.author && (
          <div class="flex items-center gap-2 mb-1">
            {embed.author.icon_url && (
              <img
                src={embed.author.icon_url}
                class="w-4 h-4 rounded-full"
                alt=""
              />
            )}
            <span class="text-[#dbdee1] text-xs font-medium">
              {embed.author.url ? (
                <a href={embed.author.url} class="hover:underline">
                  {embed.author.name}
                </a>
              ) : (
                embed.author.name
              )}
            </span>
          </div>
        )}
        {embed.title && (
          <div class="font-semibold text-sm text-[#00b0f4] mb-1">
            {embed.url ? (
              <a href={embed.url} class="hover:underline">
                {embed.title}
              </a>
            ) : (
              embed.title
            )}
          </div>
        )}
        {embed.description && (
          <p class="text-[#dbdee1] text-sm whitespace-pre-wrap wrap-break-word mb-2">
            {embed.description}
          </p>
        )}
        {embed.fields && embed.fields.length > 0 && (
          <div
            class="grid gap-2 mt-1"
            style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
          >
            {embed.fields.map((field, i) => (
              <div
                key={i}
                class="min-w-0"
                style={{ gridColumn: field.inline ? 'span 1' : 'span 3' }}
              >
                <div class="text-[#f2f3f5] text-xs font-bold mb-0.5">
                  {field.name}
                </div>
                <div class="text-[#dbdee1] text-xs whitespace-pre-wrap wrap-break-word">
                  {field.value}
                </div>
              </div>
            ))}
          </div>
        )}
        {embed.image?.url && (
          <img
            src={embed.image.url}
            class="mt-2 rounded max-w-full max-h-48 object-contain"
            alt=""
          />
        )}
        {embed.footer && (
          <div class="flex items-center gap-1.5 mt-2">
            {embed.footer.icon_url && (
              <img
                src={embed.footer.icon_url}
                class="w-4 h-4 rounded-full"
                alt=""
              />
            )}
            <span class="text-[#949ba4] text-xs">{embed.footer.text}</span>
            {embed.timestamp && (
              <span class="text-[#949ba4] text-xs">
                {' '}
                • {new Date(embed.timestamp).toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>
      {embed.thumbnail?.url && (
        <img
          src={embed.thumbnail.url}
          class="w-16 h-16 rounded object-cover shrink-0"
          alt=""
        />
      )}
    </div>
  );
}
