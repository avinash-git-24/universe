import { Profile, StudentRequestWithDetails } from "@/lib/database/requests";

/**
 * Creates a mock user profile for testing.
 */
export function mockUser(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "user-123",
    full_name: "John Doe",
    enrollment_number: "EN12345",
    role: "student",
    avatar_url: null,
    account_status: "active",
    department: null,
    semester: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Creates a mock delivery request for testing.
 */
export function mockRequest(
  overrides: Partial<StudentRequestWithDetails> = {}
): StudentRequestWithDetails {
  return {
    id: "req-123",
    requester_id: "user-123",
    pickup_location: "Campus Library",
    dropoff_location: "Dorm Hall A",
    instructions: null,
    total_estimated_amount: 15,
    delivery_fee: 5,
    status: "pending",
    linked_listing_id: null,
    delivery_otp: "1234",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: "item-1",
        request_id: "req-123",
        name: "Notebooks",
        quantity: 2,
        notes: null,
        estimated_price: 15,
        created_at: new Date().toISOString(),
      },
    ],
    assignments: [],
    ...overrides,
  };
}

/**
 * Creates a mock Supabase client for unit tests.
 */
export function mockSupabaseClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: mockUser() }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          gte: async () => ({ data: [], error: null }),
        }),
        order: async () => ({ data: [], error: null }),
      }),
    }),
  };
}
