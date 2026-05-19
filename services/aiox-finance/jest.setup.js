const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.test');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, value] = trimmed.split('=');
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
}

// Mock Supabase to prevent connection timeouts in tests
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      admin: {
        createUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id', email: 'test@test.com' } },
          error: null,
        }),
        signInWithPassword: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id', email: 'test@test.com' } },
          error: null,
        }),
        signOut: jest.fn().mockResolvedValue({ error: null }),
      },
      signUp: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    from: (table) => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: { id: 'test-user-id', email: 'test@test.com', name: 'Test User', role: 'ADMIN', active: true },
              error: null,
            }),
        }),
      }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-user-id', email: 'test@test.com', name: 'Test User', role: 'ADMIN' },
            error: null,
          }),
        }),
      }),
    }),
  }),
}));
