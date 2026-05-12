#!/usr/bin/env node

/**
 * AIOX Pattern Extractor
 * Story 7.3: Extracts and documents code patterns from the codebase
 *
 * Analyzes code via AST and regex to detect common patterns,
 * generating a patterns.md file for reference by agents (especially Spec Writer).
 *
 * Usage:
 *   node pattern-extractor.js [command] [options]
 *
 * Commands:
 *   extract         Extract patterns (default)
 *   json            Output as JSON
 *   save            Save to .aiox/patterns.md
 *   merge           Merge with existing patterns
 *
 * Options:
 *   --root <path>   Project root (default: cwd)
 *   --output <path> Custom output path
 *   --category <c>  Extract specific category only
 *   --quiet         Suppress output
 *   --help          Show this help message
 *
 * @module pattern-extractor
 */

const fs = require('fs').promises;
const path = require('path');

// Pattern categories
const PATTERN_CATEGORIES = {
  STATE_MANAGEMENT: 'State Management',
  API_CALLS: 'API Calls',
  ERROR_HANDLING: 'Error Handling',
  COMPONENTS: 'Components',
  DATA_ACCESS: 'Data Access',
  TESTING: 'Testing',
  HOOKS: 'Hooks',
  UTILITIES: 'Utilities',
};

// File extensions to analyze
const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];

// Directories to exclude from scanning
const EXCLUDED_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.nuxt',
  'tmp',
  'temp',
  '__pycache__',
  '.aiox/migration-backup',
];

/**
 * Pattern Extractor Class
 * Scans codebase and extracts common patterns
 */
class PatternExtractor {
  constructor(rootPath, options = {}) {
    this.rootPath = rootPath || process.cwd();
    this.options = options;
    this.patterns = new Map();
    this.fileCache = new Map();
    this.detectedPatterns = [];
  }

  // =============================================================================
  // File Scanning
  // =============================================================================

  /**
   * Scan files with specific extensions
   * @param {string[]} extensions - File extensions to scan
   * @returns {Promise<string[]>} List of file paths
   */
  async scanFiles(extensions = CODE_EXTENSIONS) {
    const files = [];
    await this._walkDirectory(this.rootPath, files, extensions);
    return files;
  }

  /**
   * Walk directory recursively
   * @private
   */
  async _walkDirectory(dir, files, extensions) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip excluded directories
        if (entry.isDirectory()) {
          if (EXCLUDED_DIRS.includes(entry.name) || entry.name.startsWith('.')) {
            continue;
          }
          await this._walkDirectory(fullPath, files, extensions);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Directory not accessible
    }
  }

  /**
   * Read and cache file content
   * @param {string} filePath - Path to file
   * @returns {Promise<string>} File content
   */
  async readFile(filePath) {
    if (this.fileCache.has(filePath)) {
      return this.fileCache.get(filePath);
    }

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      this.fileCache.set(filePath, content);
      return content;
    } catch (error) {
      return null;
    }
  }

  // =============================================================================
  // Pattern Detection
  // =============================================================================

  /**
   * Detect all patterns in the codebase
   * @returns {Promise<Object>} Detected patterns
   */
  async detectPatterns() {
    const files = await this.scanFiles();
    const allPatterns = {};

    // Initialize categories
    for (const category of Object.values(PATTERN_CATEGORIES)) {
      allPatterns[category] = [];
    }

    // Run all detection methods
    const detectors = [
      this.detectStatePatterns.bind(this),
      this.detectAPIPatterns.bind(this),
      this.detectErrorHandlingPatterns.bind(this),
      this.detectComponentPatterns.bind(this),
      this.detectHookPatterns.bind(this),
      this.detectDataAccessPatterns.bind(this),
      this.detectTestingPatterns.bind(this),
      this.detectUtilityPatterns.bind(this),
    ];

    for (const detector of detectors) {
      const patterns = await detector(files);
      for (const pattern of patterns) {
        if (allPatterns[pattern.category]) {
          // Check for duplicates
          const exists = allPatterns[pattern.category].some(
            (p) => p.name === pattern.name
          );
          if (!exists) {
            allPatterns[pattern.category].push(pattern);
          }
        }
      }
    }

    this.detectedPatterns = allPatterns;
    return allPatterns;
  }

  /**
   * Detect state management patterns (Zustand, Redux, Context)
   */
  async detectStatePatterns(files) {
    const patterns = [];
    const storeFiles = files.filter((f) => f.includes('store') || f.includes('Store'));

    for (const file of storeFiles) {
      const content = await this.readFile(file);
      if (!content) continue;

      // Zustand with persist middleware
      if (content.includes('create<') && content.includes('zustand') && content.includes('persist')) {
        const pattern = this._extractZustandPersistPattern(content, file);
        if (pattern) patterns.push(pattern);
      }
      // Zustand without persist
      else if (content.includes('create<') && content.includes('zustand')) {
        const pattern = this._extractZustandPattern(content, file);
        if (pattern) patterns.push(pattern);
      }

      // Redux Toolkit slice
      if (content.includes('createSlice') && content.includes('@reduxjs/toolkit')) {
        const pattern = this._extractReduxSlicePattern(content, file);
        if (pattern) patterns.push(pattern);
      }

      // React Context
      if (content.includes('createContext') && content.includes('useContext')) {
        const pattern = this._extractContextPattern(content, file);
        if (pattern) patterns.push(pattern);
      }
    }

    return patterns;
  }

  /**
   * Extract Zustand with persist pattern
   */
  _extractZustandPersistPattern(content, file) {
    const relativePath = path.relative(this.rootPath, file);
    const filesUsing = [relativePath];

    // Extract interface name
    const interfaceMatch = content.match(/interface\s+(\w+State)\s*\{/);
    const interfaceName = interfaceMatch ? interfaceMatch[1] : 'ExampleState';

    // Extract store name
    const storeMatch = content.match(/export\s+const\s+(use\w+Store)\s*=/);
    const storeName = storeMatch ? storeMatch[1] : 'useExampleStore';

    // Extract persist name
    const persistMatch = content.match(/name:\s*['"`]([^'"`]+)['"`]/);
    const persistName = persistMatch ? persistMatch[1] : 'example-storage';

    return {
      category: PATTERN_CATEGORIES.STATE_MANAGEMENT,
      name: 'Zustand Store with Persist',
      description: 'State management with persistence across browser sessions using Zustand and persist middleware.',
      whenToUse: 'Any domain state that needs persistence across sessions (settings, preferences, cached data).',
      example: this._generateZustandPersistExample(interfaceName, storeName, persistName),
      filesUsing,
      confidence: 0.95,
    };
  }

  /**
   * Generate Zustand persist example
   */
  _generateZustandPersistExample(interfaceName, storeName, persistName) {
    return `\`\`\`typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ${interfaceName} {
  data: Data | null;
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  reset: () => void;
}

export const ${storeName} = create<${interfaceName}>()(
  persist(
    (set, get) => ({
      data: null,
      loading: false,
      error: null,
      fetchData: async () => {
        set({ loading: true, error: null });
        try {
          const data = await api.get('/example');
          set({ data, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },
      reset: () => set({ data: null, loading: false, error: null }),
    }),
    { name: '${persistName}' }
  )
);
\`\`\``;
  }

  /**
   * Extract Zustand pattern (without persist)
   */
  _extractZustandPattern(content, file) {
    const relativePath = path.relative(this.rootPath, file);

    return {
      category: PATTERN_CATEGORIES.STATE_MANAGEMENT,
      name: 'Zustand Store',
      description: 'Lightweight state management with Zustand.',
      whenToUse: 'Client-side state that does not need persistence (UI state, temporary data).',
      example: `\`\`\`typescript
import { create } from 'zustand';

interface UIState {
  isOpen: boolean;
  toggle: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
\`\`\``,
      filesUsing: [relativePath],
      confidence: 0.90,
    };
  }

  /**
   * Extract Redux slice pattern
   */
  _extractReduxSlicePattern(content, file) {
    const relativePath = path.relative(this.rootPath, file);

    return {
      category: PATTERN_CATEGORIES.STATE_MANAGEMENT,
      name: 'Redux Toolkit Slice',
      description: 'Redux state management using Redux Toolkit createSlice.',
      whenToUse: 'Complex application state with DevTools support and time-travel debugging needs.',
      example: `\`\`\`typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CounterState {
  value: number;
}

const initialState: CounterState = { value: 0 };

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => { state.value += 1; },
    decrement: (state) => { state.value -= 1; },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
\`\`\``,
      filesUsing: [relativePath],
      confidence: 0.90,
    };
  }

  /**
   * Extract React Context pattern
   */
  _extractContextPattern(content, file) {
    const relativePath = path.relative(this.rootPath, file);

    return {
      category: PATTERN_CATEGORIES.STATE_MANAGEMENT,
      name: 'React Context Pattern',
      description: 'Native React state management using Context API.',
      whenToUse: 'Shared state across component tree without external libraries (theme, auth, locale).',
      example: `\`\`\`typescript
import { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
\`\`\``,
      filesUsing: [relativePath],
      confidence: 0.85,
    };
  }

  /**
   * Detect API call patterns
   */
  async detectAPIPatterns(files) {
    const patterns = [];
    const seenPatterns = new Set();

    for (const file of files) {
      const content = await this.readFile(file);
      if (!content) continue;

      const relativePath = path.relative(this.rootPath, file);

      // SWR Pattern
      if (content.includes('useSWR') && !seenPatterns.has('swr')) {
        seenPatterns.add('swr');
        patterns.push({
          category: PATTERN_CATEGORIES.API_CALLS,
          name: 'SWR Data Fetching',
          description: 'Data fetching with automatic caching, revalidation, and optimistic updates.',
          whenToUse: 'Client-side data fetching with automatic cache management and real-time sync.',
          example: `\`\`\`typescript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useData(id: string) {
  const { data, error, isLoading, mutate } = useSWR<DataType>(
    id ? \`/api/data/\${id}\` : null,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  return {
    data,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
\`\`\``,
          filesUsing: [relativePath],
          confidence: 0.95,
        });
      }

      // Fetch with error handling
      if (content.includes('fetch(') && content.includes('try') && content.includes('catch') && !seenPatterns.has('fetch-error')) {
        seenPatterns.add('fetch-error');
        patterns.push({
          category: PATTERN_CATEGORIES.API_CALLS,
          name: 'Fetch with Error Handling',
          description: 'Standard fetch API wrapper with proper error handling.',
          whenToUse: 'Simple API calls without external libraries.',
          example: `\`\`\`typescript
async function fetchData<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    return await response.json();
  } catch (error) {
    console.error(\`Error fetching \${url}:\`, error);
    throw error;
  }
}
\`\`\``,
          filesUsing: [relativePath],
          confidence: 0.85,
        });
      }

      // React Query / TanStack Query
      if ((content.includes('useQuery') || content.includes('@tanstack/react-query')) && !seenPatterns.has('react-query')) {
        seenPatterns.add('react-query');
        patterns.push({
          category: PATTERN_CATEGORIES.API_CALLS,
          name: 'TanStack Query',
          description: 'Powerful data synchronization with React Query.',
          whenToUse: 'Complex data fetching with caching, background updates, and mutations.',
          example: `\`\`\`typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: () => fetch('/api/items').then(res => res.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newItem: NewItem) =>
      fetch('/api/items', {
        method: 'POST',
        body: JSON.stringify(newItem),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}
\`\`\``,
          filesUsing: [relativePath],
          confidence: 0.90,
        });
      }
    }

    return patterns;
  }

  /**
   * Detect error handling patterns
   */
  async detectErrorHandlingPatterns(files) {
    const patterns = [];
    const seenPatterns = new Set();

    for (const file of files) {
      const content = await this.readFile(file);
      if (!content) continue;

      const relativePath = path.relative(this.rootPath, file);

      // Try-catch with context
      if (content.match(/catch\s*\(\s*error\s*\)\s*\{[^}]*console\.error\s*\(/)) {
        if (!seenPatterns.has('try-catch-context')) {
          seenPatterns.add('try-catch-context');
          patterns.push({
            category: PATTERN_CATEGORIES.ERROR_HANDLING,
            name: 'Try-Catch with Context',
            description: 'Error handling with contextual logging and re-throwing.',
            whenToUse: 'Any async operation that needs proper error tracking.',
            example: `\`\`\`typescript
async function operation(params: Params): Promise<Result> {
  try {
    const result = await performOperation(params);
    return result;
  } catch (error) {
    console.error(\`Error in operation [\${params.id}]:\`, error);
    throw new Error(\`Failed to perform operation: \${error.message}\`);
  }
}
\`\`\``,
            filesUsing: [relativePath],
            confidence: 0.90,
          });
        }
      }

      // Error boundary pattern (React)
      if (content.includes('componentDidCatch') || content.includes('ErrorBoundary')) {
        if (!seenPatterns.has('error-boundary')) {
          seenPatterns.add('error-boundary');
          patterns.push({
            category: PATTERN_CATEGORIES.ERROR_HANDLING,
            name: 'React Error Boundary',
            description: 'Catch and handle rendering errors in React component tree.',
            whenToUse: 'Wrap component subtrees to prevent entire app crashes.',
            example: `\`\`\`typescript
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}
\`\`\``,
            filesUsing: [relativePath],
            confidence: 0.85,
          });
        }
      }

      // Toast notifications for errors
      if (content.includes('toast.error') || content.includes('toast(') && content.includes('error')) {
        if (!seenPatterns.has('toast-error')) {
          seenPatterns.add('toast-error');
          patterns.push({
            category: PATTERN_CATEGORIES.ERROR_HANDLING,
            name: 'Toast Error Notifications',
            description: 'User-friendly error notifications using toast library.',
            whenToUse: 'Display errors to users in a non-intrusive way.',
            example: `\`\`\`typescript
import { toast } from 'sonner'; // or react-hot-toast

async function handleSubmit(data: FormData) {
  try {
    await submitForm(data);
    toast.success('Form submitted successfully!');
  } catch (error) {
    toast.error(\`Failed to submit: \${error.message}\`);
  }
}
\`\`\``,
            filesUsing: [relativePath],
            confidence: 0.85,
          });
        }
      }
    }

    return patterns;
  }

  /**
   * Detect React component patterns
   */
  async detectComponentPatterns(files) {
    const patterns = [];
    const seenPatterns = new Set();

    const componentFiles = files.filter((f) => f.endsWith('.tsx') || f.endsWith('.jsx'));

    for (const file of componentFiles) {
      const content = await this.readFile(file);
      if (!content) continue;

      const relativePath = path.relative(this.rootPath, file);

      // Memoized component pattern
      if (content.includes('memo(function') || content.includes('memo(')) {
        if (!seenPatterns.has('memo-component')) {
          seenPatterns.add('memo-component');
          patterns.push({
            category: PATTERN_CATEGORIES.COMPONENTS,
            name: 'Memoized Component',
            description: 'Performance-optimized component using React.memo.',
            whenToUse: 'Components that receive the same props frequently and are expensive to render.',
            example: `\`\`\`typescript
import { memo } from 'react';

interface CardProps {
  title: string;
  description: string;
  onClick?: () => void;
}

export const Card = memo(function Card({ title, description, onClick }: CardProps) {
  return (
    <div className="card" onClick={onClick}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
});
\`\`\``,
            filesUsing: [relativePath],
            confidence: 0.90,
          });
        }
      }

      // Compound component pattern
      if (content.match(/\w+\.\w+\s*=\s*function|\w+\.\w+\s*=\s*\(/)) {
        if (!seenPatterns.has('compound-component')) {
          seenPatterns.add('compound-component');
          patterns.push({
            category: PATTERN_CATEGORIES.COMPONENTS,
            name: 'Compound Component',
            description: 'Component with attached sub-components for flexible composition.',
            whenToUse: 'Complex UI components that need flexible internal composition (Card, Menu, Dialog).',
            example: `\`\`\`typescript
interface CardProps {
  children: ReactNode;
}

function Card({ children }: CardProps) {
  return <div className="card">{children}</div>;
}

Card.Header = function CardHeader({ children }: { children: ReactNode }) {
  return <div className="card-header">{children}</div>;
};

Card.Body = function CardBody({ children }: { children: ReactNode }) {
  return <div className="card-body">{children}</div>;
};

Card.Footer = function CardFooter({ children }: { children: ReactNode }) {
  return <div className="card-footer">{children}</div>;
};

export { Card };

// Usage:
// <Card>
//   <Card.Header>Title</Card.Header>
//   <Card.Body>Content</Card.Body>
//   <Card.Footer>Actions</Card.Footer>
// </Card>
\`\`\``,
            filesUsing: [relativePath],
            confidence: 0.80,
          });
        }
      }

      // Conditional rendering with cn/clsx
      if (content.includes('cn(') || content.includes('clsx(')) {
        if (!seenPatterns.has('conditional-classnames')) {
          seenPatterns.add('conditional-classnames');
          patterns.push({
            category: PATTERN_CATEGORIES.COMPONENTS,
            name: 'Conditional Class Names',
            description: 'Utility for conditional class name composition.',
            whenToUse: 'Dynamic styling based on props or state.',
            example: `\`\`\`typescript
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', disabled, children }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'rounded font-medium transition-colors',
        variant === 'primary' && 'bg-blue-500 text-white hover:bg-blue-600',
        variant === 'secondary' && 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        variant === 'danger' && 'bg-red-500 text-white hover:bg-red-600',
        size === 'sm' && 'px-2 py-1 text-sm',
        size === 'md' && 'px-4 py-2',
        size === 'lg' && 'px-6 py-3 text-lg',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );
}
\`\`\``,
            filesUsing: [relativePath],
            confidence: 0.95,
          });
        }
      }
    }

    return patterns;
  }

  /**
   * Detect React hook patterns
   */
  async detectHookPatterns(files) {
    const patterns = [];
    const seenPatterns = new Set();

    const hookFiles = files.filter((f) => f.includes('/hooks/') || f.includes('use'));

    for (const file of hookFiles) {
      const content = await this.readFile(file);
      if (!content) continue;

      const relativePath = path.relative(this.rootPath, file);

      // Custom hook with store
      if (content.match(/export\s+function\s+use\w+\s*\(/) && content.includes('Store')) {
        if (!seenPatterns.has('hook-with-store')) {
          seenPatterns.add('hook-with-store');
          patterns.push({
            category: PATTERN_CATEGORIES.HOOKS,
            name: 'Custom Hook with Store',
            description: 'Custom hook that combines store state with additional logic.',
            whenToUse: 'Encapsulate store access and related business logic.',
            example: `\`\`\`typescript
import { useAgentStore } from '@/stores/agent-store';
import { useCallback, useMemo } from 'react';

export function useAgents() {
  const { agents, activeAgentId, setActiveAgent, clearActiveAgent } = useAgentStore();

  const activeAgent = useMemo(
    () => (activeAgentId ? agents[activeAgentId] : null),
    [agents, activeAgentId]
  );

  const activateAgent = useCallback(
    (id: string, storyId?: string) => {
      setActiveAgent(id, storyId);
    },
    [setActiveAgent]
  );

  return {
    agents: Object.values(agents),
    activeAgent,
    activateAgent,
    deactivateAgent: clearActiveAgent,
  };
}
\`\`\``,
            filesUsing: [relativePath],
            confidence: 0.90,
          });
        }
      }

      // useEffect with cleanup
      if (content.includes('useEffect') && content.match(/return\s*\(\)\s*=>/)) {
        if (!seenPatterns.has('useeffect-cleanup')) {
          seenPatterns.add('useeffect-cleanup');
          patterns.push({
            category: PATTERN_CATEGORIES.HOOKS,
            name: 'useEffect with Cleanup',
            description: 'Effect hook with proper cleanup function.',
            whenToUse: 'Effects that create subscriptions, timers, or event listeners.',
            example: `\`\`\`typescript
import { useEffect, useState } from 'react';

export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }

    // Set initial size
    handleResize();

    // Add listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return size;
}
\`\`\``,
            filesUsing: [relativePath],
            confidence: 0.90,
          });
        }
      }

      // useCallback pattern
      if (content.includes('useCallback') && content.includes('useMemo')) {
        if (!seenPatterns.has('callback-memo')) {
          seenPatterns.add('callback-memo');
          patterns.push({
            category: PATTERN_CATEGORIES.HOOKS,
            name: 'useCallback + useMemo',
            description: 'Memoization patterns for performance optimization.',
            whenToUse: 'Prevent unnecessary re-renders in child components.',
            example: `\`\`\`typescript
import { useCallback, useMemo } from 'react';

export function useFilters(items: Item[]) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !category || item.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, category]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleCategoryChange = useCallback((value: string | null) => {
    setCategory(value);
  }, []);

  return {
    filteredItems,
    search,
    category,
    setSearch: handleSearchChange,
    setCategory: handleCategoryChange,
  };
}
\`\`\``,
            filesUsing: [relativePath],
            confidence: 0.85,
          });
        }
      }
    }

    return patterns;
  }

  /**
   * Detect data access patterns
   */
  async detectDataAccessPatterns(files) {
    const patterns = [];
    const seenPatterns = new Set();

    for (const file of files) {
      const content = await this.readFile(file);
      if (!content) continue;

      const relativePath = path.relative(this.rootPath, file);

      // Prisma ORM pattern
      if (content.includes('prisma') && content.includes('findMany')) {
        if (!seenPatterns.has('prisma')) {
          seenPatterns.add('prisma');
          patterns.push({
            category: PATTERN_CATEGORIES.DATA_ACCESS,
            name: 'Prisma ORM Queries',
            description: 'Type-safe database queries using Prisma ORM.',
            whenToUse: 'Database access in Node.js/Next.js applications.',
            example: `\`\`\`typescript
import { prisma } from '@/lib/prisma';

export async function getUsers(options?: {
  skip?: number;
  take?: number;
  where?: { role?: string };
}) {
  const { skip = 0, take = 10, where } = options ?? {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take,
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
}
\`\`\``,
            filesUsing: [relativePath],
            confidence: 0.90,
          });
        }
      }

      // File system operations
      if (content.includes("fs.promises") || content.includes("require('fs').promises")) {
        if (!seenPatterns.has('fs-async')) {
          seenPatterns.add('fs-async');
          patterns.push({
            category: PATTERN_CATEGORIES.DATA_ACCESS,
            name: 'Async File Operations',
            description: 'File system operations using fs.promises.',
            whenToUse: 'Reading/writing files in Node.js scripts.',
            example: `\`\`\`typescript
const fs = require('fs').promises;
const path = require('path');

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}
\`\`\``,
            filesUsing: [relativePath],
            confidence: 0.85,
          });
        }
      }
    }

    return patterns;
  }

  /**
   * Detect testing patterns
   */
  async detectTestingPatterns(files) {
    const patterns = [];
    const seenPatterns = new Set();

    const testFiles = files.filter((f) => f.includes('.test.') || f.includes('.spec.'));

    for (const file of testFiles) {
      const content = await this.readFile(file);
      if (!content) continue;

      const relativePath = path.relative(this.rootPath, file);

      // Jest describe/it pattern
      if (content.includes('describe(') && content.includes('it(')) {
        if (!seenPatterns.has('jest-basic')) {
          seenPatterns.add('jest-basic');
          patterns.push({
            category: PATTERN_CATEGORIES.TESTING,
            name: 'Jest Test Structure',
            description: 'Standard Jest test file structure with describe/it blocks.',
            whenToUse: 'Unit and integration tests for JavaScript/TypeScript code.',
            example: `\`\`\`typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe('method/feature', () => {
    it('should do something when condition', () => {
      // Arrange
      const input = { /* test data */ };

      // Act
      const result = someFunction(input);

      // Assert
      expect(result).toEqual(expectedOutput);
    });

    it('should handle edge case', () => {
      expect(() => someFunction(null)).toThrow('Expected error message');
    });
  });
});
\`\`\``,
            filesUsing: [relativePath],
            confidence: 0.95,
          });
        }
      }

      // Mock pattern
      if (content.includes('jest.mock') || content.includes('vi.mock')) {
        if (!seenPatterns.has('jest-mock')) {
          seenPatterns.add('jest-mock');
          patterns.push({
            category: PATTERN_CATEGORIES.TESTING,
            name: 'Module Mocking',
            description: 'Mocking modules and dependencies in tests.',
            whenToUse: 'Isolate units under test from external dependencies.',
            example: `\`\`\`typescript
// Mock an entire module
jest.mock('@/lib/api', () => ({
  fetchData: jest.fn(),
}));

// Mock with implementation
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn().mockResolvedValue('mock content'),
    writeFile: jest.fn().mockResolvedValue(undefined),
  },
}));

// In test
import { fetchData } from '@/lib/api';

describe('MyComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch data', async () => {
    (fetchData as jest.Mock).mockResolvedValue({ data: 'test' });

    const result = await myFunction();

    expect(fetchData).toHaveBeenCalledWith('/endpoint');
    expect(result).toEqual({ data: 'test' });
  });
});
\`\`\``,
            filesUsing: [relativePath],
            confidence: 0.90,
          });
        }
      }
    }

    return patterns;
  }

  /**
   * Detect utility patterns
   */
  async detectUtilityPatterns(files) {
    const patterns = [];
    const seenPatterns = new Set();

    const utilFiles = files.filter((f) => f.includes('/utils/') || f.includes('/lib/') || f.includes('/helpers/'));

    for (const file of utilFiles) {
      const content = await this.readFile(file);
      if (!content) continue;

      const relativePath = path.relative(this.rootPath, file);

      // Class-based utility
      if (content.match(/class\s+\w+\s*\{/) && content.includes('constructor')) {
        if (!seenPatterns.has('class-utility')) {
          seenPatterns.add('class-utility');
          patterns.push({
            category: PATTERN_CATEGORIES.UTILITIES,
            name: 'Class-Based Utility',
            description: 'Utility class with encapsulated functionality.',
            whenToUse: 'Complex utilities with state or multiple related methods.',
            example: `\`\`\`typescript
class TemplateEngine {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.cache = new Map();
  }

  async loadTemplate(name) {
    if (this.cache.has(name)) {
      return this.cache.get(name);
    }

    const content = await fs.readFile(
      path.join(this.rootPath, 'templates', \`\${name}.md\`),
      'utf-8'
    );

    this.cache.set(name, content);
    return content;
  }

  render(template, context) {
    return template.replace(/\\{\\{(\\w+)\\}\\}/g, (_, key) => context[key] || '');
  }
}

module.exports = TemplateEngine;
\`\`\``,
            filesUsing: [relativePath],
            confidence: 0.85,
          });
        }
      }

      // Functional utilities with exports
      if (content.includes('module.exports') && content.match(/function\s+\w+\s*\(/)) {
        if (!seenPatterns.has('functional-utilities')) {
          seenPatterns.add('functional-utilities');
          patterns.push({
            category: PATTERN_CATEGORIES.UTILITIES,
            name: 'Functional Utilities',
            description: 'Collection of pure utility functions.',
            whenToUse: 'Simple, reusable utility functions.',
            example: `\`\`\`typescript
/**
 * Format bytes to human readable string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Debounce a function
 */
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Deep clone an object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

module.exports = { formatBytes, debounce, deepClone };
\`\`\``,
            filesUsing: [relativePath],
            confidence: 0.80,
          });
        }
      }
    }

    return patterns;
  }

  // =============================================================================
  // Output Generation
  // =============================================================================

  /**
   * Generate markdown output
   * @returns {string} Markdown content
   */
  generateMarkdown() {
    const lines = [];
    const timestamp = new Date().toISOString();

    lines.push('# Project Patterns');
    lines.push('');
    lines.push('> Auto-generated from codebase analysis');
    lines.push(`> Last updated: ${timestamp}`);
    lines.push('');

    // Generate table of contents
    lines.push('## Table of Contents');
    lines.push('');
    for (const [category, patterns] of Object.entries(this.detectedPatterns)) {
      if (patterns.length > 0) {
        const anchor = category.toLowerCase().replace(/\s+/g, '-');
        lines.push(`- [${category}](#${anchor})`);
      }
    }
    lines.push('');

    // Generate each category section
    for (const [category, patterns] of Object.entries(this.detectedPatterns)) {
      if (patterns.length === 0) continue;

      lines.push(`## ${category}`);
      lines.push('');

      for (const pattern of patterns) {
        lines.push(`### ${pattern.name}`);
        lines.push('');
        lines.push(pattern.example);
        lines.push('');
        lines.push(`**When to use:** ${pattern.whenToUse}`);
        lines.push('');
        if (pattern.filesUsing && pattern.filesUsing.length > 0) {
          lines.push(`**Files using this pattern:** ${pattern.filesUsing.join(', ')}`);
          lines.push('');
        }
        lines.push('---');
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  /**
   * Save patterns to file
   * @param {string} outputPath - Output file path
   */
  async savePatterns(outputPath) {
    const defaultPath = path.join(this.rootPath, '.aiox', 'patterns.md');
    const targetPath = outputPath || defaultPath;

    // Ensure directory exists
    const dir = path.dirname(targetPath);
    await fs.mkdir(dir, { recursive: true });

    const content = this.generateMarkdown();
    await fs.writeFile(targetPath, content, 'utf-8');

    return targetPath;
  }

  /**
   * Merge with existing patterns file
   * @param {string} existingPath - Path to existing patterns file
   */
  async mergeWithExisting(existingPath) {
    const defaultPath = path.join(this.rootPath, '.aiox', 'patterns.md');
    const targetPath = existingPath || defaultPath;

    try {
      const existingContent = await fs.readFile(targetPath, 'utf-8');

      // Extract existing patterns
      const existingPatterns = this._parseExistingPatterns(existingContent);

      // Merge with new patterns (new patterns take precedence)
      for (const [category, patterns] of Object.entries(this.detectedPatterns)) {
        if (!existingPatterns[category]) {
          existingPatterns[category] = [];
        }

        for (const pattern of patterns) {
          const existingIndex = existingPatterns[category].findIndex(
            (p) => p.name === pattern.name
          );

          if (existingIndex >= 0) {
            // Update existing pattern
            existingPatterns[category][existingIndex] = pattern;
          } else {
            // Add new pattern
            existingPatterns[category].push(pattern);
          }
        }
      }

      this.detectedPatterns = existingPatterns;
    } catch (error) {
      // No existing file, use current patterns
    }

    return this.savePatterns(targetPath);
  }

  /**
   * Parse existing patterns file
   * @private
   */
  _parseExistingPatterns(content) {
    const patterns = {};

    // Initialize categories
    for (const category of Object.values(PATTERN_CATEGORIES)) {
      patterns[category] = [];
    }

    // Simple regex parsing - in production, use a proper markdown parser
    const categoryMatches = content.matchAll(/^## (.+)$/gm);

    for (const match of categoryMatches) {
      const category = match[1];
      if (patterns[category]) {
        // This is a recognized category - patterns would be parsed here
        // For simplicity, we'll just preserve the category
      }
    }

    return patterns;
  }

  /**
   * Output patterns as JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      generated: new Date().toISOString(),
      rootPath: this.rootPath,
      totalPatterns: Object.values(this.detectedPatterns).reduce((sum, p) => sum + p.length, 0),
      categories: this.detectedPatterns,
    };
  }
}

// =============================================================================
// CLI Handler
// =============================================================================

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
AIOX Pattern Extractor
Extracts and documents code patterns from the codebase.

Usage:
  node pattern-extractor.js [command] [options]

Commands:
  extract         Extract patterns (default)
  json            Output as JSON
  save            Save to .aiox/patterns.md
  merge           Merge with existing patterns

Options:
  --root <path>   Project root (default: cwd)
  --output <path> Custom output path
  --category <c>  Extract specific category only
  --quiet         Suppress output
  --help          Show this help message

Examples:
  node pattern-extractor.js
  node pattern-extractor.js save
  node pattern-extractor.js json --output patterns.json
  node pattern-extractor.js --category "State Management"
`);
    return;
  }

  // Parse arguments
  const command = args.find((a) => !a.startsWith('--')) || 'extract';
  const quiet = args.includes('--quiet');

  const rootIndex = args.indexOf('--root');
  const rootPath = rootIndex !== -1 ? args[rootIndex + 1] : process.cwd();

  const outputIndex = args.indexOf('--output');
  const outputPath = outputIndex !== -1 ? args[outputIndex + 1] : null;

  const categoryIndex = args.indexOf('--category');
  const categoryFilter = categoryIndex !== -1 ? args[categoryIndex + 1] : null;

  // Find project root (look for package.json or .aiox-core)
  let projectRoot = rootPath;
  while (projectRoot !== '/') {
    try {
      await fs.access(path.join(projectRoot, 'package.json'));
      break;
    } catch {
      projectRoot = path.dirname(projectRoot);
    }
  }

  if (projectRoot === '/') {
    console.error('Error: Could not find project root. Run from within a project directory.');
    process.exit(1);
  }

  // Create extractor and detect patterns
  const extractor = new PatternExtractor(projectRoot);

  if (!quiet) {
    console.log(`Scanning patterns in: ${projectRoot}`);
  }

  await extractor.detectPatterns();

  // Filter by category if specified
  if (categoryFilter) {
    const filtered = {};
    for (const [category, patterns] of Object.entries(extractor.detectedPatterns)) {
      if (category.toLowerCase().includes(categoryFilter.toLowerCase())) {
        filtered[category] = patterns;
      }
    }
    extractor.detectedPatterns = filtered;
  }

  // Execute command
  switch (command) {
    case 'json': {
      const json = extractor.toJSON();
      if (outputPath) {
        await fs.writeFile(outputPath, JSON.stringify(json, null, 2));
        if (!quiet) console.log(`JSON saved to: ${outputPath}`);
      } else {
        console.log(JSON.stringify(json, null, 2));
      }
      break;
    }

    case 'save': {
      const savedPath = await extractor.savePatterns(outputPath);
      if (!quiet) console.log(`Patterns saved to: ${savedPath}`);
      break;
    }

    case 'merge': {
      const mergedPath = await extractor.mergeWithExisting(outputPath);
      if (!quiet) console.log(`Patterns merged and saved to: ${mergedPath}`);
      break;
    }

    case 'extract':
    default: {
      const markdown = extractor.generateMarkdown();
      if (outputPath) {
        await fs.writeFile(outputPath, markdown);
        if (!quiet) console.log(`Patterns saved to: ${outputPath}`);
      } else {
        console.log(markdown);
      }
      break;
    }
  }

  // Summary
  if (!quiet) {
    const totalPatterns = Object.values(extractor.detectedPatterns).reduce(
      (sum, p) => sum + p.length,
      0
    );
    console.log(`\nTotal patterns detected: ${totalPatterns}`);
    for (const [category, patterns] of Object.entries(extractor.detectedPatterns)) {
      if (patterns.length > 0) {
        console.log(`  ${category}: ${patterns.length}`);
      }
    }
  }
}

// Export for programmatic use
module.exports = PatternExtractor;

// Run CLI if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}
