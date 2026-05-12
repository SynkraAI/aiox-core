# Supabase Architecture Patterns

**Purpose:** Reference guide for Supabase implementation patterns
**Agent:** Dan (Data Engineer)
**Platform:** Supabase (PostgreSQL + Auth + Storage + Realtime)

---

## PROJECT STRUCTURE

### Recommended Organization
```
project/
├── supabase/
│   ├── migrations/         # Database migrations
│   │   ├── 00001_initial_schema.sql
│   │   └── 00002_add_rls_policies.sql
│   ├── functions/          # Edge Functions
│   │   └── function-name/
│   │       └── index.ts
│   ├── seed.sql            # Seed data for development
│   └── config.toml         # Supabase CLI config
├── src/
│   ├── lib/
│   │   └── supabase.ts     # Supabase client initialization
│   └── types/
│       └── database.ts     # Generated types from schema
└── .env.local              # Environment variables
```

---

## CLIENT INITIALIZATION

### Browser Client (Public)
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### Server Client (Service Role)
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Only use server-side, never expose to client
export const supabaseAdmin = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

---

## AUTHENTICATION PATTERNS

### Sign Up with Email
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  options: {
    data: {
      full_name: 'User Name',
      // Additional user metadata
    }
  }
})
```

### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password'
})
```

### OAuth Provider
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
})
```

### Session Management
```typescript
// Get current session
const { data: { session } } = await supabase.auth.getSession()

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    // Handle sign in
  } else if (event === 'SIGNED_OUT') {
    // Handle sign out
  }
})
```

---

## DATABASE PATTERNS

### Type-Safe Queries
```typescript
// Fetch with type safety
const { data, error } = await supabase
  .from('profiles')
  .select('id, username, avatar_url')
  .eq('id', userId)
  .single()

// Insert with return
const { data, error } = await supabase
  .from('posts')
  .insert({ title, content, author_id: userId })
  .select()
  .single()

// Update
const { data, error } = await supabase
  .from('profiles')
  .update({ username: newUsername })
  .eq('id', userId)
  .select()
  .single()

// Delete
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId)
```

### Relationships
```typescript
// Fetch with foreign key relation
const { data, error } = await supabase
  .from('posts')
  .select(`
    id,
    title,
    content,
    author:profiles(id, username, avatar_url)
  `)
  .eq('id', postId)
  .single()
```

### Pagination
```typescript
const pageSize = 10
const page = 1

const { data, count, error } = await supabase
  .from('posts')
  .select('*', { count: 'exact' })
  .order('created_at', { ascending: false })
  .range((page - 1) * pageSize, page * pageSize - 1)
```

---

## REALTIME PATTERNS

### Subscribe to Changes
```typescript
const channel = supabase
  .channel('posts-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'posts',
      filter: `author_id=eq.${userId}`
    },
    (payload) => {
      console.log('Change received:', payload)
    }
  )
  .subscribe()

// Cleanup
channel.unsubscribe()
```

### Presence (Online Status)
```typescript
const channel = supabase.channel('room:lobby')

channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    console.log('Online users:', state)
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ user_id: userId, online_at: new Date() })
    }
  })
```

---

## STORAGE PATTERNS

### Upload File
```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file, {
    cacheControl: '3600',
    upsert: true
  })
```

### Get Public URL
```typescript
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.png`)

const publicUrl = data.publicUrl
```

### Signed URL (Private)
```typescript
const { data, error } = await supabase.storage
  .from('private-docs')
  .createSignedUrl(`${userId}/document.pdf`, 3600) // 1 hour
```

---

## EDGE FUNCTIONS

### Function Structure
```typescript
// supabase/functions/hello-world/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! }
      }
    }
  )

  // Get user from JWT
  const { data: { user } } = await supabaseClient.auth.getUser()

  return new Response(
    JSON.stringify({ message: `Hello ${user?.email}` }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

---

## TYPE GENERATION

### Generate Types from Schema
```bash
# Install Supabase CLI
npm install -g supabase

# Generate types
supabase gen types typescript --project-id your-project-id > src/types/database.ts

# Or from local
supabase gen types typescript --local > src/types/database.ts
```

### Usage
```typescript
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type InsertProfile = Database['public']['Tables']['profiles']['Insert']
type UpdateProfile = Database['public']['Tables']['profiles']['Update']
```

---

## ERROR HANDLING

### Standard Pattern
```typescript
async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    throw new Error(`Failed to fetch profile: ${error.message}`)
  }

  return data
}
```

---

**Reviewer:** ________ **Date:** ________
**Quality Gate:** [ ] PASS [ ] NEEDS REVIEW
