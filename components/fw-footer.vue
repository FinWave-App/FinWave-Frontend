<template>
  <div class="flex bg-base-300 items-center p-4 justify-between border-t border-base-100">
    <div class="flex items-center gap-2">
      <svg
          fill-rule="evenodd"
          clip-rule="evenodd"
          class="fill-current min-w-12 max-w-12"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 440 159.33">
        <defs>
          <linearGradient id="d" data-name="New Gradient Swatch 1" x1="0" y1="79.66" x2="440" y2="79.66" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#10b981"/>
            <stop offset="1" stop-color="#0ea5e9"/>
          </linearGradient>
        </defs>
        <g id="c" data-name="Layer 1">
          <path d="m95.49,111.95c30.22,0,55.06-48.62,86.79-78.47-19.59,0-50.98,53.1-89.3,53.1S15.55,34.25,0,34.25c15.47,13.79,52.88,77.7,95.49,77.7Zm202.63,11.54c-32.96,0-22.44-92.3-74.12-92.3s-75.94,103.4-121.04,103.4C49.57,134.6,12.7,60.53,0,60.43c8.69,7.54,44.03,98.89,105.34,98.89s81.21-96.17,117.56-96.17c28.68,0,21.69,96,73.8,96S387.59,20.5,440,0c-75.76,0-104.55,123.49-141.89,123.49Z" fill="url(#d)" stroke-width="0"/>
        </g>
      </svg>
      <div class="flex flex-col gap-1 flex-wrap">
        <p class="opacity-60 font-bold text-sm">
          Copyright © 2025 <a href="https://finwave.app" target="_blank" class="underline">FinWave Project</a>. All rights reserved
        </p>
        <p class="opacity-60 font-bold text-sm">
          This project is licensed under the <a href="/license.txt" target="_blank" class="underline">MIT License</a>.
        </p>
      </div>
    </div>

    <div class="flex gap-4 items-center flex-wrap justify-center">
      <div class="opacity-80">
        <div class="flex gap-1 flex-wrap justify-center">
          <div class="badge badge-outline badge-sm text-nowrap">
            client v{{clientVersion}}
          </div>
          <div class="badge badge-outline badge-sm text-nowrap">
            server v{{serverVersion}}
          </div>
        </div>
      </div>

      <a href="https://github.com/FinWave-App" target="_blank">
        <svg class="fill-current" width="24" height="24" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"/>
        </svg>
      </a>
    </div>
  </div>
</template>

<script setup>

const { $serverApi } = useNuxtApp();

const serverVersion = $serverApi.getVersion();
const clientVersion = useRuntimeConfig().public.clientVersion;

</script>

<style scoped>

</style>