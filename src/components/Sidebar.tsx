import type { ComponentChild } from 'preact';
import {
  PlusCircle,
  Send,
  Settings,
  MessageSquare,
  Lock,
  Github,
} from 'lucide-preact';
import type { SavedWebhook, TabId } from '../types';
import { getAvatarUrl } from '../api';

interface SidebarProps {
  webhooks: SavedWebhook[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddClick: () => void;
}

export function Sidebar({
  webhooks,
  selectedId,
  onSelect,
  onAddClick,
}: SidebarProps) {
  return (
    <div class="w-60 bg-[#2b2d31] flex flex-col h-full shrink-0">
      {/* Header */}
      <div class="px-4 py-3 border-b border-[#1e1f22] shadow-sm">
        <h2 class="text-[#f2f3f5] font-semibold text-sm uppercase tracking-wide select-none">
          Webhook Manager
        </h2>
      </div>

      {/* Webhook list */}
      <div class="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {webhooks.length === 0 && (
          <p class="text-[#949ba4] text-xs px-2 py-4 text-center">
            No webhooks added yet.
            <br />
            Click the + button below.
          </p>
        )}
        {webhooks.map((wh) => (
          <WebhookListItem
            key={wh.id}
            webhook={wh}
            selected={wh.id === selectedId}
            onClick={() => onSelect(wh.id)}
          />
        ))}
      </div>

      {/* Add button */}
      <div class="px-3 py-3 border-t border-[#1e1f22]">
        <button
          onClick={onAddClick}
          class="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-[#5865f2] hover:bg-[#4752c4] active:bg-[#3c45a5] text-white text-sm font-medium transition-colors"
        >
          <PlusCircle size={16} />
          Add Webhook
        </button>
      </div>

      {/* Footer */}
      <div class="px-3 pb-3 space-y-1.5">
        <div class="flex items-start gap-1.5 text-[#4e5058] text-xs leading-tight">
          <Lock size={11} class="shrink-0 mt-0.5" />
          <span>
            Webhook URLs are stored locally in your browser only. No data leaves
            your device.
          </span>
        </div>
        <a
          href="https://github.com/minagishl/discord-webhook-manager"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 text-[#4e5058] hover:text-[#949ba4] text-xs transition-colors"
        >
          <Github size={11} class="shrink-0" />
          <span>minagishl/discord-webhook-manager</span>
        </a>
      </div>
    </div>
  );
}

interface WebhookListItemProps {
  webhook: SavedWebhook;
  selected: boolean;
  onClick: () => void;
}

function WebhookListItem({ webhook, selected, onClick }: WebhookListItemProps) {
  const avatarUrl = getAvatarUrl(webhook.id, webhook.avatar, 40);

  return (
    <button
      onClick={onClick}
      class={`w-full flex items-center gap-3 px-2 py-1.5 rounded-md cursor-pointer group transition-colors ${
        selected
          ? 'bg-[#404249] text-[#f2f3f5]'
          : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'
      }`}
    >
      <img
        src={avatarUrl}
        alt={webhook.name}
        class="w-8 h-8 rounded-full shrink-0 object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src =
            'https://cdn.discordapp.com/embed/avatars/0.png';
        }}
      />
      <div class="flex-1 min-w-0 text-left">
        <div class="text-sm font-medium truncate">{webhook.name}</div>
        <div class="text-xs text-[#6d6f78] truncate">
          {webhook.guild_id
            ? `Guild: ${webhook.guild_id.slice(0, 8)}…`
            : 'No guild'}
        </div>
      </div>
    </button>
  );
}

// Tab bar shown inside main content area
interface TabBarProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export function TabBar({ active, onChange }: TabBarProps) {
  const tabs: { id: TabId; label: string; icon: ComponentChild }[] = [
    {
      id: 'send',
      label: 'Send Message',
      icon: <Send size={16} />,
    },
    {
      id: 'manage',
      label: 'Manage Webhook',
      icon: <Settings size={16} />,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: <MessageSquare size={16} />,
    },
  ];

  return (
    <div class="flex items-center gap-0 border-b border-[#1e1f22] px-4 bg-[#313338]">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          class={`flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
            active === t.id
              ? 'border-[#5865f2] text-[#f2f3f5]'
              : 'border-transparent text-[#949ba4] hover:text-[#dbdee1] hover:border-[#949ba4]'
          }`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}
