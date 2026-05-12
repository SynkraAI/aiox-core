# Project Patterns

> Auto-generated from codebase analysis
> Last updated: 2026-01-29T03:28:41.980Z

## Table of Contents

- [State Management](#state-management)
- [API Calls](#api-calls)
- [Error Handling](#error-handling)
- [Components](#components)
- [Data Access](#data-access)
- [Testing](#testing)
- [Hooks](#hooks)
- [Utilities](#utilities)

## State Management

### Zustand Store

```typescript
import { create } from 'zustand';

interface UIState {
  isOpen: boolean;
  toggle: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
```

**When to use:** Client-side state that does not need persistence (UI state, temporary data).

**Files using this pattern:** apps/dashboard/src/stores/agent-store.ts

---

### Zustand Store with Persist

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProjectsState {
  data: Data | null;
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  reset: () => void;
}

export const useProjectsStore = create<ProjectsState>()(
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
    { name: 'aiox-core' }
  )
);
```

**When to use:** Any domain state that needs persistence across sessions (settings, preferences, cached data).

**Files using this pattern:** apps/dashboard/src/stores/projects-store.ts

---

## API Calls

### SWR Data Fetching

```typescript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useData(id: string) {
  const { data, error, isLoading, mutate } = useSWR<DataType>(
    id ? `/api/data/${id}` : null,
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
```

**When to use:** Client-side data fetching with automatic cache management and real-time sync.

**Files using this pattern:** apps/dashboard/src/components/github/GitHubPanel.tsx

---

### Fetch with Error Handling

```typescript
async function fetchData<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}
```

**When to use:** Simple API calls without external libraries.

**Files using this pattern:** tools/health-dashboard/src/hooks/useHealthData.js

---

## Error Handling

### Try-Catch with Context

```typescript
async function operation(params: Params): Promise<Result> {
  try {
    const result = await performOperation(params);
    return result;
  } catch (error) {
    console.error(`Error in operation [${params.id}]:`, error);
    throw new Error(`Failed to perform operation: ${error.message}`);
  }
}
```

**When to use:** Any async operation that needs proper error tracking.

**Files using this pattern:** apps/dashboard/src/app/api/github/route.ts

---

## Components

### Memoized Component

```typescript
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
```

**When to use:** Components that receive the same props frequently and are expensive to render.

**Files using this pattern:** apps/dashboard/src/components/agents/AgentCard.tsx

---

### Conditional Class Names

```typescript
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
```

**When to use:** Dynamic styling based on props or state.

**Files using this pattern:** apps/dashboard/src/components/agents/AgentCard.tsx

---

## Data Access

### Async File Operations

```typescript
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
```

**When to use:** Reading/writing files in Node.js scripts.

**Files using this pattern:** tests/agents/backward-compatibility.test.js

---

## Testing

### Jest Test Structure

```typescript
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
      const input = {
        /* test data */
      };

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
```

**When to use:** Unit and integration tests for JavaScript/TypeScript code.

**Files using this pattern:** packages/installer/tests/integration/environment-configuration.test.js

---

### Module Mocking

```typescript
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
```

**When to use:** Isolate units under test from external dependencies.

**Files using this pattern:** packages/installer/tests/integration/wizard-detection.test.js

---

## Hooks

### Custom Hook with Store

```typescript
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
```

**When to use:** Encapsulate store access and related business logic.

**Files using this pattern:** apps/dashboard/src/hooks/use-agents.ts

---

### useEffect with Cleanup

```typescript
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
```

**When to use:** Effects that create subscriptions, timers, or event listeners.

**Files using this pattern:** apps/dashboard/src/hooks/use-agents.ts

---

## Utilities

### Functional Utilities

```typescript
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
```

**When to use:** Simple, reusable utility functions.

**Files using this pattern:** bin/utils/install-errors.js

---

### Class-Based Utility

```typescript
class TemplateEngine {
  constructor(options = {}) {
    this.rootPath = options.rootPath || process.cwd();
    this.cache = new Map();
  }

  async loadTemplate(name) {
    if (this.cache.has(name)) {
      return this.cache.get(name);
    }

    const content = await fs.readFile(path.join(this.rootPath, 'templates', `${name}.md`), 'utf-8');

    this.cache.set(name, content);
    return content;
  }

  render(template, context) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => context[key] || '');
  }
}

module.exports = TemplateEngine;
```

**When to use:** Complex utilities with state or multiple related methods.

**Files using this pattern:** bin/utils/install-transaction.js

---
