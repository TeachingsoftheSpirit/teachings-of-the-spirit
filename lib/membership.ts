import { createClient } from '@/lib/supabase/server'

/**
 * The membership ladder.
 * Single source of truth for who may pass which doors.
 */
export type MembershipLevel =
  | 'anonymous'        // Level 1 — no credential
  | 'magic_link'       // Level 2 — verified email, no paid membership
  | 'house_brew'       // Level 3
  | 'private_reserve'  // Level 4
  | 'patron'           // future high-dollar tier (reserved)

export type ProfileRow = {
  email: string
  subscription_status: string | null
  billing_interval: string | null
  access_ends_at: string | null
  username?: string | null
}

/**
 * Map a profiles row (+ whether a session exists) to a MembershipLevel.
 * Pure function — safe to call from server or client once you have the data.
 */
export function levelFromProfile(
  profile: ProfileRow | null,
  hasSession: boolean
): MembershipLevel {
  if (!hasSession || !profile) {
    return 'anonymous'
  }

  // Access already expired (e.g. cancel-at-period-end has passed)
  if (profile.access_ends_at) {
    const ends = new Date(profile.access_ends_at)
    if (!Number.isNaN(ends.getTime()) && ends.getTime() < Date.now()) {
      return 'magic_link'
    }
  }

  const status = (profile.subscription_status || '').toLowerCase().trim()

  if (status === 'private_reserve' || status === 'private-reserve') {
    return 'private_reserve'
  }
  if (status === 'house_brew' || status === 'house-brew' || status === 'ordinary_pint') {
    // ordinary_pint kept as alias until Stripe product names are fully cleaned
    return 'house_brew'
  }
  if (status === 'patron') {
    return 'patron'
  }

  // Session exists but no active paid tier
  return 'magic_link'
}

/**
 * Server-side: read the current session + profiles row and return the level.
 * Use this from Server Components, Route Handlers, and Server Actions.
 */
export async function getMembershipLevel(): Promise<MembershipLevel> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return 'anonymous'
  }

  const cleanEmail = user.email.trim().toLowerCase()

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, subscription_status, billing_interval, access_ends_at, username')
    .eq('email', cleanEmail)
    .maybeSingle()

  return levelFromProfile(profile as ProfileRow | null, true)
}

/**
 * Ordered rank — higher number = deeper access.
 * Used by requiresAtLeast().
 */
const LEVEL_RANK: Record<MembershipLevel, number> = {
  anonymous: 1,
  magic_link: 2,
  house_brew: 3,
  private_reserve: 4,
  patron: 5,
}

/**
 * True if the user's level is at least as high as the required level.
 */
export function requiresAtLeast(
  userLevel: MembershipLevel,
  required: MembershipLevel
): boolean {
  return LEVEL_RANK[userLevel] >= LEVEL_RANK[required]
}

/**
 * Feature keys used across the site.
 * Add new features here; then gate with canAccess().
 */
export type Feature =
  | 'read_featured_teachings'
  | 'read_any_teaching'
  | 'previous_next'
  | 'save_teaching'
  | 'special_collections'
  | 'about'
  | 'titles_view'
  | 'titles_open'
  | 'browse_view'
  | 'browse_open'
  | 'quotes_preview'
  | 'quotes_full'
  | 'search'
  | 'ruminations_index'
  | 'ruminations_full'
  | 'galadriels_mirror'
  | 'guides'
  | 'manage_membership'

/**
 * Minimum level required for each feature.
 * This is the living matrix — change a row here and the whole site follows.
 *
 * Aligned with your Level ladder:
 * L1 anonymous · L2 magic_link · L3 house_brew · L4 private_reserve
 */
const FEATURE_MIN_LEVEL: Record<Feature, MembershipLevel> = {
  read_featured_teachings: 'anonymous',
  about: 'anonymous',
  titles_view: 'anonymous',
  browse_view: 'anonymous',
  quotes_preview: 'anonymous',

  previous_next: 'magic_link',
  save_teaching: 'magic_link',
  special_collections: 'magic_link',
  search: 'magic_link',
  titles_open: 'magic_link',
  read_any_teaching: 'magic_link',

  browse_open: 'house_brew',
  quotes_full: 'house_brew',
  manage_membership: 'house_brew',

  ruminations_index: 'private_reserve',
  ruminations_full: 'private_reserve',
  galadriels_mirror: 'private_reserve',
  guides: 'private_reserve',
}

/**
 * Can this level use this feature?
 */
export function canAccess(level: MembershipLevel, feature: Feature): boolean {
  const required = FEATURE_MIN_LEVEL[feature]
  return requiresAtLeast(level, required)
}