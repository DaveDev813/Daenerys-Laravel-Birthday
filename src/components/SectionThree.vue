<template lang="pug">
.full-width.full-height.birthday-section-frame.birthday-section-three(
  ref='sectionRef'
  :style='sectionThreeStyle'
)
  .birthday-section-three__short
    .birthday-section-three__short-player(ref='playerRef')
    button.birthday-section-three__sound-button(
      v-if='isSoundButtonVisible'
      type='button'
      aria-label='Play video with sound'
      @click='enableSound'
    )
      span.birthday-section-three__sound-icon(aria-hidden='true')
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import bg1Url from 'src/assets/images/bg/bg1.png';

const sectionRef = ref(null);
const playerRef = ref(null);
const isSoundButtonVisible = ref(false);
const youtubeShortId = 'DB0qEwxM0rQ';
const sectionThreeStyle = {
  backgroundImage: `url(${bg1Url})`,
};
let sectionObserver = null;
let youtubePlayer = null;
let hasRequestedPlayback = false;
let hasEnabledSound = false;
let autoplayFallbackTimeout = null;

const loadYouTubeApi = () => {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (window.__birthdayYouTubeApiPromise) {
    return window.__birthdayYouTubeApiPromise;
  }

  window.__birthdayYouTubeApiPromise = new Promise((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousCallback === 'function') {
        previousCallback();
      }

      resolve(window.YT);
    };

    if (existingScript) {
      existingScript.addEventListener('error', reject, { once: true });
      return;
    }

    const youtubeScript = document.createElement('script');
    youtubeScript.src = 'https://www.youtube.com/iframe_api';
    youtubeScript.async = true;
    youtubeScript.onerror = reject;
    document.head.appendChild(youtubeScript);
  });

  return window.__birthdayYouTubeApiPromise;
};

const clearAutoplayFallback = () => {
  if (autoplayFallbackTimeout) {
    window.clearTimeout(autoplayFallbackTimeout);
    autoplayFallbackTimeout = null;
  }
};

const isPlayerPlaying = () => {
  if (!youtubePlayer) {
    return false;
  }

  return youtubePlayer.getPlayerState() === window.YT?.PlayerState?.PLAYING;
};

const playShortMuted = () => {
  if (!youtubePlayer) {
    return;
  }

  youtubePlayer.mute();
  youtubePlayer.playVideo();
  isSoundButtonVisible.value = !hasEnabledSound;
};

const playShortWithSound = () => {
  if (!youtubePlayer) {
    return;
  }

  youtubePlayer.unMute();
  youtubePlayer.setVolume(100);
  youtubePlayer.playVideo();
  isSoundButtonVisible.value = false;
};

const playShort = () => {
  hasRequestedPlayback = true;
  sectionObserver?.disconnect();
  sectionObserver = null;

  if (!youtubePlayer) {
    return;
  }

  if (hasEnabledSound) {
    playShortWithSound();
    return;
  }

  playShortWithSound();
  clearAutoplayFallback();
  autoplayFallbackTimeout = window.setTimeout(() => {
    if (!isPlayerPlaying() && !hasEnabledSound) {
      playShortMuted();
    }
  }, 700);
};

const enableSound = () => {
  if (!youtubePlayer) {
    return;
  }

  hasEnabledSound = true;
  clearAutoplayFallback();
  playShortWithSound();
};

const isSectionInView = () => {
  const sectionElement = sectionRef.value;
  const stageElement = sectionElement?.closest('.birthday-stage');

  if (!sectionElement || !stageElement) {
    return false;
  }

  const sectionRect = sectionElement.getBoundingClientRect();
  const stageRect = stageElement.getBoundingClientRect();
  const visibleHeight =
    Math.min(sectionRect.bottom, stageRect.bottom) -
    Math.max(sectionRect.top, stageRect.top);

  return visibleHeight >= sectionRect.height * 0.5;
};

const enableSoundAfterGesture = () => {
  if (isSectionInView()) {
    enableSound();
  }
};

const createPlayer = async () => {
  if (!playerRef.value || youtubePlayer) {
    return;
  }

  try {
    const youtubeApi = await loadYouTubeApi();

    if (!playerRef.value) {
      return;
    }

    youtubePlayer = new youtubeApi.Player(playerRef.value, {
      width: '100%',
      height: '100%',
      videoId: youtubeShortId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        loop: 1,
        origin: window.location.origin,
        playsinline: 1,
        playlist: youtubeShortId,
        rel: 0,
      },
      events: {
        onReady: () => {
          const playerIframe = youtubePlayer.getIframe();

          playerIframe.title = 'Birthday YouTube Short';
          playerIframe.setAttribute(
            'allow',
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          );
          playerIframe.setAttribute(
            'referrerpolicy',
            'strict-origin-when-cross-origin'
          );

          if (hasRequestedPlayback) {
            playShort();
          }
        },
        onStateChange: () => {
          if (isPlayerPlaying()) {
            clearAutoplayFallback();
          }
        },
        onAutoplayBlocked: () => {
          playShortMuted();
          isSoundButtonVisible.value = true;
        },
      },
    });
  } catch (error) {
    console.error('Unable to load YouTube Short player', error);
  }
};

onMounted(() => {
  const sectionElement = sectionRef.value;

  if (!sectionElement) {
    return;
  }

  void createPlayer();
  window.addEventListener('pointerup', enableSoundAfterGesture, {
    passive: true,
  });
  window.addEventListener('touchend', enableSoundAfterGesture, {
    passive: true,
  });

  if (!('IntersectionObserver' in window)) {
    playShort();
    return;
  }

  sectionObserver = new IntersectionObserver(
    (entries) => {
      const isSectionInView = entries.some(
        (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5
      );

      if (isSectionInView) {
        playShort();
      }
    },
    {
      root: sectionElement.closest('.birthday-stage'),
      threshold: [0.5],
    }
  );

  sectionObserver.observe(sectionElement);
});

onBeforeUnmount(() => {
  window.removeEventListener('pointerup', enableSoundAfterGesture);
  window.removeEventListener('touchend', enableSoundAfterGesture);
  clearAutoplayFallback();
  sectionObserver?.disconnect();
  youtubePlayer?.destroy();
});
</script>

<style lang="scss" scoped>
.birthday-section-three {
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  background-color: #000;
}

.birthday-section-three__short,
.birthday-section-three__short-player,
.birthday-section-three__short :deep(iframe) {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

.birthday-section-three__sound-button {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.birthday-section-three__sound-button:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.9);
  outline-offset: 3px;
}

.birthday-section-three__sound-icon {
  position: relative;
  display: block;
  margin-right: 16px;
  margin-bottom: 16px;
  width: 20px;
  height: 18px;
  border-right: 12px solid white;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.45));
}

.birthday-section-three__sound-icon::before {
  position: absolute;
  top: -6px;
  left: -8px;
  width: 8px;
  height: 12px;
  background: white;
  content: '';
}

.birthday-section-three__sound-icon::after {
  position: absolute;
  top: -9px;
  right: -20px;
  width: 12px;
  height: 18px;
  border: 2px solid white;
  border-left: 0;
  border-radius: 0 12px 12px 0;
  content: '';
}
</style>
