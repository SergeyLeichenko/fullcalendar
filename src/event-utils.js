
let eventGuid = 0
let todayStr = new Date().toISOString().replace(/T.*$/, '') // YYYY-MM-DD of today

export const INITIAL_EVENTS = [
  {
    id: createEventId(),
    title: 'All day event',
    date: todayStr,
    time: '',
    notes: '',
    backgroundColor: '#3788d8'
  }
]

export function createEventId() {
  return String(eventGuid++)
}
