<template><div /></template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { fetch_log_store } from '@/store/modules/log'
import { fetch_system_store, SystemTimeout } from '@/store/modules/system'

const log = fetch_log_store()
const system = fetch_system_store()

const sleep_last = ref(0)
const sleep_tolerance = 5000
const sleep_interval = 15_000
const sleep_ticker = ref<ReturnType<typeof setInterval>>()

const minute_ticker = ref<ReturnType<typeof setTimeout>>()
const quarter_hour_ticker = ref<ReturnType<typeof setTimeout>>()
const half_hour_ticker = ref<ReturnType<typeof setTimeout>>()
const hour_ticker = ref<ReturnType<typeof setTimeout>>()
const quarter_day_ticker = ref<ReturnType<typeof setTimeout>>()
const half_day_ticker = ref<ReturnType<typeof setTimeout>>()
const day_ticker = ref<ReturnType<typeof setTimeout>>()

onMounted(() => reset())

onUnmounted(() => clear())

const timeouts = {
  minute: 1000 * 60,
  quarter_hour: 1000 * 60 * 15,
  half_hour: 1000 * 60 * 30,
  hour: 1000 * 60 * 60,
  quarter_day: 1000 * 60 * 60 * 6,
  half_day: 1000 * 60 * 60 * 12,
  day: 1000 * 60 * 60 * 24,
}

function delta (interval) {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  date.setHours(0, 0, 0, 0)
  return interval - ((Date.now() - date.getTime()) % interval)
}

const resets = {
  minute: () => minute_ticker.value = setTimeout(timeout_minute, delta(timeouts.minute)),
  quarter_hour: () => quarter_hour_ticker.value = setTimeout(timeout_quarter_hour, delta(timeouts.quarter_hour)),
  half_hour: () => half_hour_ticker.value = setTimeout(timeout_half_hour, delta(timeouts.half_hour)),
  hour: () => hour_ticker.value = setTimeout(timeout_hour, delta(timeouts.hour)),
  quarter_day: () => quarter_day_ticker.value = setTimeout(timeout_quarter_day, delta(timeouts.quarter_day)),
  half_day: () => half_day_ticker.value = setTimeout(timeout_half_day, delta(timeouts.half_day)),
  day: () => day_ticker.value = setTimeout(timeout_day, delta(timeouts.day)),
}

function reset () {
  sleep_last.value = Date.now()
  sleep_ticker.value = setInterval(timeout_sleep, sleep_interval)

  resets.minute()
  resets.quarter_hour()
  resets.half_hour()
  resets.hour()
  resets.quarter_day()
  resets.half_day()
  resets.day()
}

const clears = {
  minute: () => minute_ticker.value ? clearTimeout(minute_ticker.value) : undefined,
  quarter_hour: () => quarter_hour_ticker.value ? clearTimeout(quarter_hour_ticker.value) : undefined,
  half_hour: () => half_hour_ticker.value ? clearTimeout(half_hour_ticker.value) : undefined,
  hour: () => hour_ticker.value ? clearTimeout(hour_ticker.value) : undefined,
  quarter_day: () => quarter_day_ticker.value ? clearTimeout(quarter_day_ticker.value) : undefined,
  half_day: () => half_day_ticker.value ? clearTimeout(half_day_ticker.value) : undefined,
  day: () => day_ticker.value ? clearTimeout(day_ticker.value) : undefined,
}

function clear () {
  clearInterval(sleep_ticker.value)

  clears.minute()
  clears.quarter_hour()
  clears.half_hour()
  clears.hour()
  clears.quarter_day()
  clears.half_day()
  clears.day()
}

function timeout_sleep () {
  const delta = Math.abs(Date.now() - sleep_last.value - sleep_interval)
  sleep_last.value = Date.now()

  if (delta > sleep_tolerance) {
    log.trace(`Sleep interval timeout delta (${delta}) above tolerance (${sleep_tolerance}), reseting timers.`)
    clear()
    reset()
  }
}

function timeout_minute () {
  system.timer(SystemTimeout.Minute)
  resets.minute()
}

function timeout_quarter_hour () {
  system.timer(SystemTimeout.QuarterHour)
  resets.quarter_hour()
}

function timeout_half_hour () {
  system.timer(SystemTimeout.HalfHour)
  resets.half_hour()
}

function timeout_hour () {
  system.timer(SystemTimeout.Hour)
  resets.hour()
}

function timeout_quarter_day () {
  system.timer(SystemTimeout.QuarterDay)
  resets.quarter_day()
}

function timeout_half_day () {
  system.timer(SystemTimeout.HalfDay)
  resets.half_day()
}

function timeout_day () {
  system.timer(SystemTimeout.Day)
  resets.day()
}

defineExpose({
  reset,
  clear,
  sleep_ticker,
  minute_ticker,
  quarter_hour_ticker,
  half_hour_ticker,
  hour_ticker,
  quarter_day_ticker,
  half_day_ticker,
  day_ticker,
})
</script>
