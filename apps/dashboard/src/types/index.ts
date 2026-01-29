// AIOS Dashboard Types - PRD v1.4
// Professional design system - no emojis, icon names only

import type { IconName } from '@/lib/icons';

// ============ Story Types ============

export type StoryStatus =
  | 'backlog'
  | 'in_progress'
  | 'ai_review'
  | 'human_review'
  | 'pr_created'
  | 'done'
  | 'error';

export type StoryComplexity = 'simple' | 'standard' | 'complex';
export type StoryPriority = 'low' | 'medium' | 'high' | 'critical';
export type StoryCategory = 'feature' | 'fix' | 'refactor' | 'docs';
export type StoryType = 'epic' | 'story';

export interface Story {
  id: string;
  title: string;
  description: string;
  status: StoryStatus;
  type?: StoryType; // 'story' if not specified

  // Classification
  epicId?: string;
  complexity?: StoryComplexity;
  priority?: StoryPriority;
  category?: StoryCategory;

  // Agent association
  agentId?: AgentId;
  progress?: number;

  // Content
  acceptanceCriteria?: string[];
  technicalNotes?: string;

  // Metadata
  filePath: string;
  createdAt: string;
  updatedAt: string;
}

// ============ Agent Types ============

export type AgentId = 'dev' | 'qa' | 'architect' | 'pm' | 'po' | 'analyst' | 'devops';

export type AgentStatus = 'idle' | 'working' | 'waiting' | 'error';

export type AgentPhase = 'planning' | 'coding' | 'testing' | 'reviewing' | 'deploying';

export interface Agent {
  id: AgentId;
  name: string;
  icon: IconName;
  color: string;
  status: AgentStatus;
  currentStoryId?: string;
  phase?: AgentPhase;
  progress?: number;
  lastActivity?: string;
}

// ============ Project Types ============

export interface Project {
  id: string;
  name: string;
  path: string;
}

// ============ Status Types ============

export interface AiosStatus {
  version: string;
  updatedAt: string;
  connected: boolean;
  project: {
    name: string;
    path: string;
  } | null;
  activeAgent: {
    id: AgentId;
    name: string;
    activatedAt: string;
    currentStory?: string;
  } | null;
  session: {
    startedAt: string;
    commandsExecuted: number;
    lastCommand?: string;
  } | null;
  stories: {
    inProgress: string[];
    completed: string[];
  };
  rateLimit?: {
    used: number;
    limit: number;
    resetsAt?: string;
  };
}

// ============ Terminal Types ============

export type TerminalStatus = 'idle' | 'running' | 'error';

export interface TerminalSession {
  id: string;
  agentId: AgentId;
  name: string;
  model: string;
  apiType: string;
  workingDirectory: string;
  status: TerminalStatus;
  currentCommand?: string;
  storyId?: string;
}

// ============ Roadmap Types ============

export type RoadmapPriority = 'must_have' | 'should_have' | 'could_have' | 'wont_have';
export type RoadmapImpact = 'low' | 'medium' | 'high';
export type RoadmapEffort = 'low' | 'medium' | 'high';

export interface RoadmapItem {
  id: string;
  title: string;
  description?: string;
  priority: RoadmapPriority;
  impact: RoadmapImpact;
  effort: RoadmapEffort;
  category?: StoryCategory;
  tags?: string[];
  linkedStoryId?: string;
}

export const ROADMAP_PRIORITY_CONFIG: Record<RoadmapPriority, { label: string; color: string }> = {
  must_have: { label: 'Must Have', color: 'red' },
  should_have: { label: 'Should Have', color: 'yellow' },
  could_have: { label: 'Could Have', color: 'blue' },
  wont_have: { label: "Won't Have", color: 'gray' },
};

// ============ Sidebar Types ============

export type SidebarView =
  | 'kanban'
  | 'agents'
  | 'terminals'
  | 'monitor'
  | 'roadmap'
  | 'context'
  | 'ideas'
  | 'insights'
  | 'github'
  | 'worktrees'
  | 'settings';

export interface SidebarItem {
  id: SidebarView;
  label: string;
  icon: IconName;
  href: string;
  shortcut?: string;
}

// ============ Kanban Column Types ============

export interface KanbanColumn {
  id: StoryStatus;
  label: string;
  icon: IconName;
  color: string;
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'backlog', label: 'Backlog', icon: 'file-text', color: 'gray' },
  { id: 'in_progress', label: 'In Progress', icon: 'play', color: 'blue' },
  { id: 'ai_review', label: 'AI Review', icon: 'bot', color: 'purple' },
  { id: 'human_review', label: 'Human Review', icon: 'user', color: 'yellow' },
  { id: 'pr_created', label: 'PR Created', icon: 'git-pull-request', color: 'cyan' },
  { id: 'done', label: 'Done', icon: 'check-circle', color: 'green' },
  { id: 'error', label: 'Error', icon: 'x-circle', color: 'red' },
];

// ============ Agent Config ============

export interface AgentConfig {
  name: string;
  icon: IconName;
  color: string;
}

export const AGENT_CONFIG: Record<AgentId, AgentConfig> = {
  dev: { name: 'Dev', icon: 'code', color: 'var(--agent-dev)' },
  qa: { name: 'QA', icon: 'test-tube', color: 'var(--agent-qa)' },
  architect: { name: 'Architect', icon: 'building', color: 'var(--agent-architect)' },
  pm: { name: 'PM', icon: 'bar-chart', color: 'var(--agent-pm)' },
  po: { name: 'PO', icon: 'target', color: 'var(--agent-po)' },
  analyst: { name: 'Analyst', icon: 'line-chart', color: 'var(--agent-analyst)' },
  devops: { name: 'DevOps', icon: 'wrench', color: 'var(--agent-devops)' },
};

// ============ Sidebar Config ============

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'kanban', label: 'Kanban', icon: 'kanban', href: '/kanban', shortcut: 'K' },
  { id: 'agents', label: 'Agents', icon: 'bot', href: '/agents', shortcut: 'A' },
  { id: 'terminals', label: 'Terminals', icon: 'terminal', href: '/terminals', shortcut: 'T' },
  { id: 'monitor', label: 'Monitor', icon: 'activity', href: '/monitor', shortcut: 'M' },
  { id: 'insights', label: 'Insights', icon: 'trending-up', href: '/insights', shortcut: 'I' },
  { id: 'context', label: 'Context', icon: 'brain', href: '/context', shortcut: 'C' },
  { id: 'roadmap', label: 'Roadmap', icon: 'map', href: '/roadmap', shortcut: 'R' },
  { id: 'github', label: 'GitHub', icon: 'github', href: '/github', shortcut: 'G' },
  { id: 'settings', label: 'Settings', icon: 'settings', href: '/settings', shortcut: 'S' },
];

// ============ Status Colors (semantic) ============

export const STATUS_COLORS: Record<StoryStatus, string> = {
  backlog: 'text-muted-foreground',
  in_progress: 'text-blue-500',
  ai_review: 'text-purple-500',
  human_review: 'text-yellow-500',
  pr_created: 'text-cyan-500',
  done: 'text-green-500',
  error: 'text-red-500',
};

export const AGENT_STATUS_COLORS: Record<AgentStatus, string> = {
  idle: 'bg-muted-foreground',
  working: 'bg-green-500',
  waiting: 'bg-yellow-500',
  error: 'bg-red-500',
};
