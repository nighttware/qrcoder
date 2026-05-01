<script setup lang="ts">
const id = `flag-br-${Math.random().toString(36).slice(2, 9)}`;
</script>

<template>
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <clipPath :id="id">
        <circle cx="12" cy="12" r="12" />
      </clipPath>
    </defs>
    <g :clip-path="`url(#${id})`">
      <rect width="24" height="24" fill="#009C3B" />
      <path d="M12 3.5 22 12l-10 8.5L2 12Z" fill="#FFDF00" />
      <circle cx="12" cy="12" r="4.2" fill="#002776" />
      <path
        d="M8.4 11.4c2.3-.4 4.7-.4 7 0"
        fill="none"
        stroke="#FFFFFF"
        stroke-width="0.55"
      />
    </g>
  </svg>
</template>
