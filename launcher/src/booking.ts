export interface MenuItem {
  id: string
  name: string
  note: string
  price: number
  tint: string
}

export interface Route {
  mode: 'walk' | 'drive' | 'transit'
  label: string
  minutes: number
  distance: string
}

/** The shop's agent the user books through, and what its reservation reply carries. */
export const store = {
  name: 'Bluebird cafe',
  logo: '/bluebird.png',
  address: '12 Maple Street',
  time: '3 p.m.',
  message: 'Your reserved seat for 3 p.m. has been confirmed. Please arrive on time.',
  menu: [
    { id: 'flat-white', name: 'Flat White', note: 'Double ristretto, whole milk', price: 4.5, tint: '#c99a6b' },
    { id: 'matcha', name: 'Iced Matcha Latte', note: 'Uji matcha, oat milk', price: 5, tint: '#8fbf6a' },
    { id: 'scone', name: 'Blueberry Scone', note: 'Baked this morning', price: 3.8, tint: '#7a8fd6' },
    { id: 'toast', name: 'Avocado Toast', note: 'Sourdough, chilli flakes', price: 8.5, tint: '#b5c96a' },
  ] satisfies MenuItem[],
  routes: [
    { mode: 'walk', label: 'Walk', minutes: 8, distance: '650 m' },
    { mode: 'drive', label: 'Drive', minutes: 4, distance: '1.2 km' },
    { mode: 'transit', label: 'Bus', minutes: 10, distance: '2 stops' },
  ] satisfies Route[],
}

const TRIGGER = /\b(blue ?bird|reserve|reservation|book (?:a |me a )?(?:table|seat))\b|蓝鸟|预约|预定|预订|订座|订位/i

export function isBookingRequest(text: string) {
  return TRIGGER.test(text)
}

export const price = (n: number) => `$${n.toFixed(2)}`
