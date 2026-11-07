import { RouteBases, Routes, PermissionFlagsBits } from 'discord.js'

// Works out which servers a signed-in person may manage (Manage Server,
// Administrator, or owner) by asking Discord with THEIR own sign-in token.
// The answer is remembered for a short time so one page load is not many calls.

const CACHE_MS = 60_000
const MAX_CACHE_ENTRIES = 1000
const PAGE_SIZE = 200 // Discord returns at most 200 servers per request

const cache = new Map() // userId -> { at, list }

export class AccessError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

const MANAGE_BITS = PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageGuild

function canManage(guild) {
  if (guild.owner === true) return true
  try {
    return (BigInt(guild.permissions ?? 0) & MANAGE_BITS) !== 0n
  } catch {
    return false
  }
}

async function fetchPage(token, after) {
  const query = new URLSearchParams({ limit: String(PAGE_SIZE) })
  if (after) query.set('after', after)
  const res = await fetch(`${RouteBases.api}${Routes.userGuilds()}?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) {
    throw new AccessError(401, 'Your Discord sign-in has expired. Please sign in again.')
  }
  if (!res.ok) {
    throw new AccessError(503, 'Waffle could not check your Discord permissions right now. Please try again in a moment.')
  }
  return res.json()
}

// Returns [{ id, name, icon }] for every server this user may manage.
// If Discord cannot be reached the answer is "no access" (never "yes by default").
export async function getManageableGuilds(user) {
  if (!user?.accessToken) throw new AccessError(401, 'Please sign in again.')

  const hit = cache.get(user.id)
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.list

  const all = []
  let after
  for (let page = 0; page < 10; page++) { // hard stop at 2000 servers
    const batch = await fetchPage(user.accessToken, after)
    all.push(...batch)
    if (batch.length < PAGE_SIZE) break
    after = batch[batch.length - 1].id
  }

  const list = all.filter(canManage).map((g) => ({ id: g.id, name: g.name, icon: g.icon }))

  if (cache.size >= MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value)
  cache.set(user.id, { at: Date.now(), list })
  return list
}

export function forgetUser(userId) {
  cache.delete(userId)
}

export function guildIconUrl(guild) {
  return guild.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=64`
    : null
}
