<script lang="ts" setup>
import {onMounted} from 'vue';
import {SplashScreen} from '@capacitor/splash-screen';
import {StatusBar, Style} from '@capacitor/status-bar';
import {Capacitor} from '@capacitor/core';

onMounted(async () => {
  // Only run on native platforms
  if (Capacitor.isNativePlatform()) {
    try {
      // Hide splash screen after app is ready
      await SplashScreen.hide();

      // Configure status bar
      await StatusBar.setStyle({style: Style.Dark});
      await StatusBar.setBackgroundColor({color: '#000000'});
    } catch (error) {
      console.warn('Native features not available:', error);
    }
  }
});
</script>

<template>
  <div class="min-h-svh overflow-hidden min-w-svw bg-black text-white">
    <RouterView v-slot="{ Component }">
      <Transition appear mode="out-in" name="view">
        <component :is="Component"/>
      </Transition>
    </RouterView>
  </div>
</template>

<style scoped>
.view-enter-active,
.view-leave-active {
  transition: opacity 300ms ease, transform 400ms cubic-bezier(.2, .65, .2, 1);
}

.view-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.995);
}

.view-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.995);
}
</style>
