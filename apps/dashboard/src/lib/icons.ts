/**
 * AIOS Dashboard - Icon System
 * Uses lucide-react for professional SVG icons
 * Pattern inspired by mmos icon-map.ts
 */

import {
  // Navigation & Layout
  LayoutDashboard,
  Kanban,
  Terminal,
  Settings,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,

  // Status & State
  Circle,
  CircleDot,
  CheckCircle2,
  Check,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  Loader2,
  Square,

  // Actions
  Play,
  Pause,
  RefreshCw,
  Search,
  Copy,
  ExternalLink,
  Plus,
  Minus,
  Trash2,
  Edit,
  Save,

  // Content
  FileText,
  FilePlus,
  FolderOpen,
  GitBranch,
  GitPullRequest,
  GitCommit,
  Archive,

  // Agents & Roles
  Bot,
  User,
  Users,
  Code,
  TestTube,
  Building2,
  BarChart3,
  Target,
  LineChart,
  Wrench,

  // UI Elements
  Sun,
  Moon,
  Monitor,
  ArrowDown,
  ArrowUp,
  GripVertical,
  MoreHorizontal,
  Info,
  Bell,
  MessageSquare,

  // Network & Connectivity
  Wifi,
  WifiOff,
  Globe,

  // GitHub
  Github,

  // Navigation/Maps
  Map,

  // Analytics/Insights
  TrendingUp,
  Activity,
  PieChart,
  Zap,

  // Context/Brain
  Brain,
  Layers,
  BookOpen,
  FileCode,
  type LucideIcon,
} from 'lucide-react';

// Icon name to component mapping
export const iconMap = {
  // Navigation
  dashboard: LayoutDashboard,
  kanban: Kanban,
  terminal: Terminal,
  settings: Settings,
  menu: Menu,
  close: X,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'chevron-up': ChevronUp,

  // Status
  circle: Circle,
  'circle-dot': CircleDot,
  'check-circle': CheckCircle2,
  check: Check,
  'x-circle': XCircle,
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  clock: Clock,
  loader: Loader2,
  square: Square,

  // Actions
  play: Play,
  pause: Pause,
  refresh: RefreshCw,
  search: Search,
  copy: Copy,
  'external-link': ExternalLink,
  plus: Plus,
  minus: Minus,
  trash: Trash2,
  edit: Edit,
  save: Save,

  // Content
  'file-text': FileText,
  'file-plus': FilePlus,
  folder: FolderOpen,
  'git-branch': GitBranch,
  'git-pull-request': GitPullRequest,
  'git-commit': GitCommit,
  archive: Archive,

  // Agents
  bot: Bot,
  user: User,
  users: Users,
  code: Code,
  'test-tube': TestTube,
  building: Building2,
  'bar-chart': BarChart3,
  target: Target,
  'line-chart': LineChart,
  wrench: Wrench,

  // UI
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
  'arrow-down': ArrowDown,
  'arrow-up': ArrowUp,
  'grip-vertical': GripVertical,
  'more-horizontal': MoreHorizontal,
  info: Info,
  bell: Bell,
  message: MessageSquare,

  // Network
  wifi: Wifi,
  'wifi-off': WifiOff,
  globe: Globe,

  // GitHub
  github: Github,

  // Maps
  map: Map,

  // Analytics/Insights
  'trending-up': TrendingUp,
  activity: Activity,
  'pie-chart': PieChart,
  zap: Zap,

  // Context/Brain
  brain: Brain,
  layers: Layers,
  'book-open': BookOpen,
  'file-code': FileCode,
} as const;

export type IconName = keyof typeof iconMap;

// Size classes mapping
export const iconSizes = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-6 w-6',
} as const;

export type IconSize = keyof typeof iconSizes;

// Export individual icons for direct imports
export {
  LayoutDashboard,
  Kanban,
  Terminal,
  Settings,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  Circle,
  CircleDot,
  CheckCircle2,
  Check,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  Loader2,
  Square,
  Play,
  Pause,
  RefreshCw,
  Search,
  Copy,
  ExternalLink,
  Plus,
  Minus,
  Trash2,
  Edit,
  Save,
  FileText,
  FilePlus,
  FolderOpen,
  GitBranch,
  GitPullRequest,
  GitCommit,
  Archive,
  Bot,
  User,
  Users,
  Code,
  TestTube,
  Building2,
  BarChart3,
  Target,
  LineChart,
  Wrench,
  Sun,
  Moon,
  Monitor,
  ArrowDown,
  ArrowUp,
  GripVertical,
  MoreHorizontal,
  Info,
  Bell,
  MessageSquare,
  Wifi,
  WifiOff,
  Globe,
  Github,
  Map,
  TrendingUp,
  Activity,
  PieChart,
  Zap,
  Brain,
  Layers,
  BookOpen,
  FileCode,
  type LucideIcon,
};
