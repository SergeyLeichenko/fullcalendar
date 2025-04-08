<script setup>
import { ref, reactive, nextTick } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { INITIAL_EVENTS, createEventId } from './event-utils'
import EventModal from './components/EventModal.vue'

// reactive state
const currentEvents = ref([])
const calendar = ref(null)
const openEventModal = ref(false)
const selectedEvent = ref({});
const selectedCellEl = ref(null);
const calendarEvents = ref([]);
const info = reactive({});

// calendar options
const calendarOptions = reactive({
  plugins: [
    dayGridPlugin,
    timeGridPlugin,
    interactionPlugin
  ],
  headerToolbar: {
    left: 'today,back,nextBtn',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  customButtons: {
    back: {
      text: 'Back',
      click: handleBackClick
    },
    nextBtn: {
      text: 'Next',
      click: handleNextClick
    }
  },
  initialEvents: INITIAL_EVENTS,
  initialView: 'dayGridMonth',
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  events: calendarEvents,
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventsSet: handleEvents
})

function handleBackClick() {
  if (calendar.value) {
    calendar.value.getApi().prev();
  }
}

function handleNextClick() {
  if (calendar.value) {
    calendar.value.getApi().next();
  }
}

function handleDateSelect(selectInfo) {
  info.value = selectInfo;
  selectedCellEl.value = selectInfo.jsEvent?.target?.closest('.fc-daygrid-day, .fc-timegrid-slot, .fc-timegrid-col-frame');
  openEventModal.value = true;
}

function handleSave(eventData) {
  let calendarApi = info.value.view.calendar
  let newId = createEventId()

  calendarApi.unselect()

  if (eventData.id) {
    // edit existing event
    const existingEvent = calendarApi.getEventById(eventData.id)
    if (existingEvent) {
      existingEvent.setProp('title', eventData.title)
      existingEvent.setExtendedProp('notes', eventData.notes)
      existingEvent.setStart('date', eventData.date)
      existingEvent.setStart('time', eventData.time)
      existingEvent.setProp('backgroundColor', eventData.backgroundColor)
    }
  } else {
    // edd new event
    calendarApi.addEvent({
      id: newId,
      title: eventData.title,
      date: info.value.startStr.split('T')[0],
      time: info.value.startStr.split('T')[1]?.slice(0, 5) || '12:00',
      notes: eventData.notes,
      backgroundColor: eventData.backgroundColor,
    })

    nextTick(() => {
      setEventColor(newId, eventData.backgroundColor)
    })
  }

  selectedEvent.value = null
  openEventModal.value = false
}

const setEventColor = (id, color) => {
  const eventEl = document.querySelector(`.fc-event[data-event-id="${id}"]`);

  if (eventEl && color) {
    eventEl.style.backgroundColor = color
  }
}

function handleEventClick(clickInfo) {  
  const event = clickInfo.event

  selectedEvent.value = {
    id: event.id,
    title: event.title,
    date: event.startStr.split('T')[0],
    time: event.startStr.split('T')[1]?.slice(0, 5),
    notes: event.extendedProps.notes || '',
    backgroundColor: event.backgroundColor || '#3788d8',
  }

  openEventModal.value = true
}

function handleEvents(events) {
  currentEvents.value = events
}

function handleDelete(id) {
  const calendarApi = calendar.value.getApi()
  const event = calendarApi.getEventById(id)
  if (event) {
    event.remove()
  }
  openEventModal.value = false
}
</script>

<template>
  <div class='app'>
    <div class='main'>
      <FullCalendar ref="calendar" class='calendar' :options='calendarOptions'>
        <template v-slot:eventContent='arg'>
          <p>{{ arg.event.title }}</p>

          <Teleport to="body">
            <EventModal v-if="openEventModal" :referenceEl="selectedCellEl" :eventData="selectedEvent" @close="openEventModal = false" @save="handleSave" @delete="handleDelete" />
          </Teleport>

        </template>
      </FullCalendar>
    </div>
  </div>
</template>

<style lang='css'>
p {
  margin: 0;
  padding: 0;
}

.app {
  display: flex;
  min-height: 100%;
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 14px;
  color: #000000ad;
}

.main {
  flex-grow: 1;
  padding: 3em;
}

.fc {
  max-width: 1100px;
  margin: 0 auto;
}

.fc .fc-button-primary {
  background-color: transparent;
  border-color: #cecece;
  color: #000000ad;
}

.fc .fc-button-primary:not(:disabled).fc-button-active,
.fc .fc-button-primary:not(:disabled):active,
.fc .fc-button-primary:disabled {
  background-color: transparent;
  border-color: #cecece;
  color: #0000ff9c;
}

.fc .fc-daygrid-day.fc-day-today {
  position: relative;
  background-color: transparent;
}

.fc-h-event {
  padding: 5px;
  border: none;
}
</style>
