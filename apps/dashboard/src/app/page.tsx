'use client';

import { useState, useCallback } from 'react';
import { useUIStore } from '@/stores/ui-store';
import { KanbanBoard } from '@/components/kanban';
import { StoryDetailModal } from '@/components/stories';
import { AgentMonitor } from '@/components/agents';
import { SettingsPanel } from '@/components/settings';
import { TerminalGrid } from '@/components/terminals';
import { GitHubPanel } from '@/components/github';
import { RoadmapView } from '@/components/roadmap';
import { InsightsPanel } from '@/components/insights';
import { ContextPanel } from '@/components/context';
import { MonitorPanel } from '@/components/monitor';
import { FAB, HelpFAB } from '@/components/ui/fab';
import { useStories } from '@/hooks/use-stories';
import type { Story, SidebarView } from '@/types';

export default function Home() {
  const { activeView } = useUIStore();
  const { isLoading, refresh } = useStories();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleStoryClick = useCallback((story: Story) => {
    setSelectedStory(story);
    setModalOpen(true);
  }, []);

  const handleNewStory = useCallback(() => {
    // TODO: Open new story modal
    console.log('Create new story');
  }, []);

  // Show FAB on views that support creation
  const showFAB = activeView === 'kanban' || activeView === 'roadmap';

  return (
    <div className="h-full relative">
      <ViewContent
        view={activeView}
        onStoryClick={handleStoryClick}
        onRefresh={refresh}
        isLoading={isLoading}
      />

      <StoryDetailModal
        story={selectedStory}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      {/* Floating Action Buttons */}
      {showFAB && (
        <FAB
          icon="plus"
          label={activeView === 'roadmap' ? 'New Feature' : 'New Story'}
          onClick={handleNewStory}
          position="bottom-left"
        />
      )}
      <HelpFAB />
    </div>
  );
}

interface ViewContentProps {
  view: SidebarView;
  onStoryClick: (story: Story) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

function ViewContent({ view, onStoryClick, onRefresh, isLoading }: ViewContentProps) {
  switch (view) {
    case 'kanban':
      return (
        <KanbanBoard
          onStoryClick={onStoryClick}
          onRefresh={onRefresh}
          isLoading={isLoading}
          className="h-full"
        />
      );

    case 'agents':
      return <AgentMonitor />;

    case 'settings':
      return <SettingsPanel />;

    case 'terminals':
      return <TerminalGrid />;

    case 'roadmap':
      return <RoadmapView />;

    case 'github':
      return <GitHubPanel />;

    case 'insights':
      return <InsightsPanel />;

    case 'context':
      return <ContextPanel />;

    case 'monitor':
      return <MonitorPanel className="h-full" />;

    default:
      return <PlaceholderView title={view} description="Coming soon" />;
  }
}

function PlaceholderView({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-medium text-foreground capitalize">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
