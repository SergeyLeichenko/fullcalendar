<template>
  <div ref="modalRef" class="modal-backdrop" @click.stop>
    <div class="modal">
      <div class="close" @click="$emit('close')">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24">
          <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z" fill="#0000002b" />
        </svg>
      </div>

      <form @submit.prevent="submit">
        <div class="field">
          <label>
            event name
            <input v-model="form.title" maxlength="30" required />
          </label>
        </div>

        <div class="field">
          <label>
            event date
            <input type="date" v-model="form.date" />
          </label>
        </div>

        <div class="field">
          <label>
            event time
            <input type="time" v-model="form.time" />
          </label>
        </div>

        <div class="field">
          <label>
            notes
            <input type="text" v-model="form.notes" />
          </label>
        </div>

        <div class="field">
          <label>
            Color:
            <input type="color" v-model="form.backgroundColor" />
          </label>
        </div>

        <div class="actions">
          <button type="button" class="cancel" @click="$emit('close')">Cancel</button>
          <button v-if="form.id" type="button" class="delete" @click="$emit('delete', form.id)">Delete</button>
          <button type="submit" class="save">Save</button>
        </div>

        <p>referenceEl: {{ referenceEl }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, ref, onMounted, nextTick } from 'vue';
import { computePosition, offset, flip, shift, autoUpdate } from '@floating-ui/dom';

const props = defineProps({
  eventData: Object,
  referenceEl: null
});

const emit = defineEmits(['save', 'close']);

const modalRef = ref(null);
const defaultData = {
  id: '',
  title: '',
  date: '',
  time: '',
  notes: '',
  backgroundColor: '#3788d8',
}
const form = reactive({ ...defaultData })

watch(() => props.eventData, (newVal) => {
  if (newVal) {
    Object.assign(form, newVal)
  } else {
    Object.assign(form, defaultData)
  }
}, { immediate: true });

watch(() => props.referenceEl, () => {
  nextTick(() => {
    positionModal();
  });
});

function positionModal() {
  const referenceEl = props.referenceEl;
  const floatingEl = modalRef.value;

  if (referenceEl instanceof Element && floatingEl instanceof Element) {
    autoUpdate(referenceEl, floatingEl, () => {
      computePosition(referenceEl, floatingEl, {
        placement: 'bottom-start',
        middleware: [offset(10), flip(), shift()],
      }).then(({ x, y }) => {
        Object.assign(floatingEl.style, {
          left: `${x}px`,
          top: `${y}px`,
          position: 'absolute',
        });
      });
    });
  } else {
    console.warn('❌ One of the elements is not a valid DOM element:', { referenceEl, floatingEl });
  }
}

function submit() {
  emit('save', { ...form });
}

onMounted(() => {
  positionModal();
});
</script>

<style scoped>
.modal-backdrop {
  z-index: 1000;
}

.modal {
  background: white;
  padding: 10px;
  padding-top: 40px;
  border-radius: 8px;
  border: 3px solid #00000078;
  color: #0000002b;
  min-width: 220px;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-weight: bold;
  border: 2px solid #0000002b;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 1px;
  cursor: pointer;
}

.field {
  margin-bottom: 20px;
}

.field label {
  display: flex;
  flex-direction: column;
  font-size: 12px;
}

.field label input {
  outline: none;
  border: 0;
  border-bottom: 2px solid #0000002b;
}

.actions {
  display: flex;
  justify-content: space-between;
}

.actions button {
  border: none;
  background-color: transparent;
  font-size: 16px;
}

.actions .save {
  color: #00000078;
}

.actions .cancel {
  color: red;
}

.actions .delete {
  color: rgb(34, 0, 112);
}

button {
  padding: 0.5rem 1rem;
  cursor: pointer;
}
</style>
