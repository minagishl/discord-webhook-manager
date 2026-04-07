// Discord Webhook Types

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  public_flags?: number;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
}

export interface DiscordChannel {
  id: string;
  name: string;
}

export type WebhookType = 1 | 2 | 3;

export interface DiscordWebhook {
  id: string;
  type: WebhookType;
  guild_id?: string | null;
  channel_id: string | null;
  user?: DiscordUser;
  name: string | null;
  avatar: string | null;
  token?: string;
  application_id: string | null;
  source_guild?: DiscordGuild;
  source_channel?: DiscordChannel;
  url?: string;
}

// Embed structures
export interface EmbedFooter {
  text: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface EmbedImage {
  url: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface EmbedThumbnail {
  url: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface EmbedAuthor {
  name: string;
  url?: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: EmbedFooter;
  image?: EmbedImage;
  thumbnail?: EmbedThumbnail;
  author?: EmbedAuthor;
  fields?: EmbedField[];
}

// Message
export interface AllowedMentions {
  parse?: Array<'roles' | 'users' | 'everyone'>;
  roles?: string[];
  users?: string[];
  replied_user?: boolean;
}

export interface DiscordMessage {
  id: string;
  channel_id: string;
  author?: DiscordUser;
  content: string;
  timestamp: string;
  edited_timestamp: string | null;
  tts: boolean;
  mention_everyone: boolean;
  mentions: DiscordUser[];
  mention_roles: string[];
  attachments: MessageAttachment[];
  embeds: DiscordEmbed[];
  flags?: number;
  webhook_id?: string;
}

export interface MessageAttachment {
  id: string;
  filename: string;
  description?: string;
  content_type?: string;
  size: number;
  url: string;
  proxy_url: string;
  height?: number | null;
  width?: number | null;
}

// Execute webhook params
export interface ExecuteWebhookParams {
  content?: string;
  username?: string;
  avatar_url?: string;
  tts?: boolean;
  embeds?: DiscordEmbed[];
  files?: File[];
  allowed_mentions?: AllowedMentions;
  flags?: number;
  thread_name?: string;
  thread_id?: string;
}

// Modify webhook params
export interface ModifyWebhookParams {
  name?: string;
  avatar?: string | null;
  channel_id?: string;
}

// Saved webhook entry (local storage)
export interface SavedWebhook {
  id: string;
  token: string;
  name: string;
  avatar: string | null;
  channel_id: string | null;
  guild_id: string | null;
  url: string;
  addedAt: number;
}

export type TabId = 'send' | 'manage' | 'messages';

export interface AppState {
  savedWebhooks: SavedWebhook[];
  selectedWebhookId: string | null;
  activeTab: TabId;
}
