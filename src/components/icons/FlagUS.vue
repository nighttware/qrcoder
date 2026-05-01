<script setup lang="ts">
const id = `flag-us-${Math.random().toString(36).slice(2, 9)}`;
</script>

<template>
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <clipPath :id="id">
        <circle cx="12" cy="12" r="12" />
      </clipPath>
    </defs>
    <g :clip-path="`url(#${id})`">
      <rect width="24" height="24" fill="#FFFFFF" />
      <g fill="#B22234">
        <rect y="0" width="24" height="1.85" />
        <rect y="3.69" width="24" height="1.85" />
        <rect y="7.38" width="24" height="1.85" />
        <rect y="11.08" width="24" height="1.85" />
        <rect y="14.77" width="24" height="1.85" />
        <rect y="18.46" width="24" height="1.85" />
        <rect y="22.15" width="24" height="1.85" />
      </g>
      <rect width="11" height="9.23" fill="#3C3B6E" />
      <g fill="#FFFFFF" font-family="Arial, sans-serif" font-size="2.6" text-anchor="middle">
        <text x="2" y="2.4">★</text>
        <text x="4.5" y="2.4">★</text>
        <text x="7" y="2.4">★</text>
        <text x="9.5" y="2.4">★</text>
        <text x="3.25" y="4.4">★</text>
        <text x="5.75" y="4.4">★</text>
        <text x="8.25" y="4.4">★</text>
        <text x="2" y="6.4">★</text>
        <text x="4.5" y="6.4">★</text>
        <text x="7" y="6.4">★</text>
        <text x="9.5" y="6.4">★</text>
        <text x="3.25" y="8.4">★</text>
        <text x="5.75" y="8.4">★</text>
        <text x="8.25" y="8.4">★</text>
      </g>
    </g>
  </svg>
</template>
