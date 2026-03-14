import { useState } from 'preact/hooks';
import type { SavedWebhook, TabId } from './types';
import {
  loadWebhooks,
  addWebhook,
  updateWebhook,
  removeWebhook,
} from './storage';
import { Sidebar, TabBar } from './components/Sidebar';
import { WebhookPanel } from './components/WebhookPanel';
import { SendMessagePanel } from './components/SendMessagePanel';
import { MessagesPanel } from './components/MessagesPanel';
import { AddWebhookModal } from './components/AddWebhookModal';
import { Webhook, Link, PlusCircle } from 'lucide-preact';

export function App() {
  const [webhooks, setWebhooks] = useState<SavedWebhook[]>(() =>
    loadWebhooks(),
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    () => loadWebhooks()[0]?.id ?? null,
  );
  const [activeTab, setActiveTab] = useState<TabId>('send');
  const [showAddModal, setShowAddModal] = useState(false);

  const selectedWebhook = webhooks.find((w) => w.id === selectedId) ?? null;

  function handleSelect(id: string) {
    setSelectedId(id);
  }

  function handleAdd(webhook: SavedWebhook) {
    const updated = addWebhook(webhook);
    setWebhooks(updated);
    setSelectedId(webhook.id);
    setShowAddModal(false);
  }

  function handleWebhookUpdated(updated: SavedWebhook) {
    const list = updateWebhook(updated.id, updated);
    setWebhooks(list);
  }

  function handleWebhookDeleted(id: string) {
    const list = removeWebhook(id);
    setWebhooks(list);
    setSelectedId(list[0]?.id ?? null);
  }

  return (
    <div class="flex h-screen bg-[#313338] text-[#dbdee1] overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        webhooks={webhooks}
        selectedId={selectedId}
        onSelect={handleSelect}
        onAddClick={() => setShowAddModal(true)}
      />

      {/* Main area */}
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        {selectedWebhook ? (
          <>
            {/* Channel header */}
            <div class="h-12 flex items-center px-4 border-b border-[#1e1f22] bg-[#313338] shadow-sm shrink-0">
              <Webhook size={20} class="text-[#949ba4] mr-2" />
              <span class="text-[#f2f3f5] font-semibold text-sm">
                {selectedWebhook.name}
              </span>
              <span class="text-[#4e5058] mx-2">|</span>
              <span class="text-[#949ba4] text-sm">Webhook Manager</span>
            </div>

            {/* Tab bar */}
            <TabBar active={activeTab} onChange={setActiveTab} />

            {/* Content */}
            <div class="flex-1 overflow-hidden flex flex-col">
              {activeTab === 'send' && (
                <SendMessagePanel webhook={selectedWebhook} />
              )}
              {activeTab === 'manage' && (
                <WebhookPanel
                  webhook={selectedWebhook}
                  onWebhookUpdated={handleWebhookUpdated}
                  onWebhookDeleted={handleWebhookDeleted}
                />
              )}
              {activeTab === 'messages' && (
                <MessagesPanel webhook={selectedWebhook} />
              )}
            </div>
          </>
        ) : (
          <EmptyState onAddClick={() => setShowAddModal(true)} />
        )}
      </div>

      {/* Add webhook modal */}
      {showAddModal && (
        <AddWebhookModal
          onAdd={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

function EmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div class="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
      {/* Discord-style wumpus area */}
      <div class="w-24 h-24 rounded-full bg-[#2b2d31] flex items-center justify-center">
        <Link size={48} class="text-[#4e5058]" />
      </div>
      <div>
        <h2 class="text-[#f2f3f5] text-xl font-bold mb-2">
          No Webhook Selected
        </h2>
        <p class="text-[#949ba4] text-sm max-w-sm">
          Add a Discord webhook URL to get started. You can send messages,
          manage webhook settings, and edit or delete messages.
        </p>
      </div>
      <button
        onClick={onAddClick}
        class="flex items-center gap-2 px-6 py-3 rounded-md bg-[#5865f2] hover:bg-[#4752c4] active:bg-[#3c45a5] text-white font-medium transition-colors"
      >
        <PlusCircle size={20} />
        Add Your First Webhook
      </button>
    </div>
  );
}
