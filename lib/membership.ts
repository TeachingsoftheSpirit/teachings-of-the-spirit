import { createClient } from '@/lib/supabase/server'

/**
 * The membership ladder.
 * Single source of truth for who may pass which doors.
 */
export type MembershipLevel =
  | 'anonymous' // Level 1 — no credential
  | 'magic_link' // Level 2 — verified email, no paid membership
  | 'house_brew' // Level 3
  | 'private_reserve' // Level 4
  | 'patron' // future high-dollar tier (reserved)

export type AdminLevel = 'maintenance' | 'critical' | null

export type ProfileRow = {
  email: string
  subscription_status: string | null
  billing_interval: string | null
  access_ends_at: string | null
  username?: string | null
  admin_level?: string | null
}

export type MembershipInfo = {
  level: MembershipLevel
  billingInterval: string | null // 'monthly' | 'annual' | null
  adminLevel: AdminLevel
}

/**
 * Map a profiles row (+ whether a session exists) to a MembershipLevel.
 */
export function levelFromProfile(
  profile: ProfileRow | null,
  hasSession: boolean
): MembershipLevel {
  if (!hasSession || !profile) {
    return 'anonymous'
  }
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
    return 'house_brew'
  }
  if (status === 'patron') {
    return 'patron'
  }
  return 'magic_link'
}

function normalizeAdminLevel(raw: string | null | undefined): AdminLevel {
  if (raw === 'maintenance' || raw === 'critical') return raw
  return null
}

/**
 * Server-side: session + profile → level, billing interval, and admin level.
 */
export async function getMembership(): Promise<MembershipInfo> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return { level: 'anonymous', billingInterval: null, adminLevel: null }
  }

  const cleanEmail = user.email.trim().toLowerCase()
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, subscription_status, billing_interval, access_ends_at, username, admin_level')
    .eq('email', cleanEmail)
    .maybeSingle()

  const row = profile as ProfileRow | null
  return {
    level: levelFromProfile(row, true),
    billingInterval: row?.billing_interval ?? null,
    adminLevel: normalizeAdminLevel(row?.admin_level),
  }
}

/** Backward-compatible helper */
export async function getMembershipLevel(): Promise<MembershipLevel> {
  const { level } = await getMembership()
  return level
}

const LEVEL_RANK: Record<MembershipLevel, number> = {
  anonymous: 1,
  magic_link: 2,
  house_brew: 3,
  private_reserve: 4,
  patron: 5,
}

export function requiresAtLeast(
  userLevel: MembershipLevel,
  required: MembershipLevel
): boolean {
  return LEVEL_RANK[userLevel] >= LEVEL_RANK[required]
}

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
  | 'print_teaching'

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
  print_teaching: 'house_brew',
  ruminations_index: 'private_reserve',
  ruminations_full: 'private_reserve',
  galadriels_mirror: 'private_reserve',
  guides: 'private_reserve',
}

export function canAccess(level: MembershipLevel, feature: Feature): boolean {
  const required = FEATURE_MIN_LEVEL[feature]
  return requiresAtLeast(level, required)
}

/** Annual-only features (ignores admin — use canAccessOrAdmin for that) */
export function canAccessAnnual(
  level: MembershipLevel,
  billingInterval: string | null,
  feature: Feature
): boolean {
  if (!canAccess(level, feature)) return false
  return (billingInterval || '').toLowerCase() === 'annual'
}

/** True if the person has any admin level */
export function isAdmin(adminLevel: AdminLevel): boolean {
  return adminLevel === 'maintenance' || adminLevel === 'critical'
}

/** True only for the higher admin tier */
export function isCriticalAdmin(adminLevel: AdminLevel): boolean {
  return adminLevel === 'critical'
}

/**
 * Feature is allowed by ordinary membership rules OR the user is an admin.
 * Use this for anything an admin should always be able to do.
 */
export function canAccessOrAdmin(
  level: MembershipLevel,
  billingInterval: string | null,
  adminLevel: AdminLevel,
  feature: Feature,
  options?: { annualOnly?: boolean }
): boolean {
  if (isAdmin(adminLevel)) return true
  if (options?.annualOnly) {
    return canAccessAnnual(level, billingInterval, feature)
  }
  return canAccess(level, feature)
}