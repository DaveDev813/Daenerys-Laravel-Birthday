<template lang="pug">
.full-width.full-height.birthday-section-frame.birthday-section-two(
  :style='sectionTwoStyle'
)
  img.birthday-section-two__image(
    :src='sectionTwoUrl'
    :class='{ "birthday-section-two__image--visible": isImageVisible }'
    alt=''
    aria-hidden='true'
  )
  button.birthday-section-two__option.birthday-section-two__option--join(
    type='button'
    aria-label='I love to come'
    @click='handleJoinClick'
  )
  button.birthday-section-two__option.birthday-section-two__option--decline(
    type='button'
    aria-label='Sorry, I cannot join'
    @click='handleDeclineClick'
  )
  .birthday-rsvp-popup(
    v-if='isJoinPopupOpen'
    role='dialog'
    aria-modal='true'
    aria-labelledby='birthday-rsvp-title'
    @click.self='closeJoinPopup'
  )
    form.birthday-rsvp-popup__panel(@submit.prevent='handleJoinSubmit')
      h2#birthday-rsvp-title.birthday-rsvp-popup__title Join us
      label.birthday-rsvp-popup__field
        span Full name
        input(
          v-model='fullName'
          type='text'
          name='fullName'
          autocomplete='name'
          required
        )
      label.birthday-rsvp-popup__field
        span Number of Guest comming
        input(
          v-model='guestCount'
          type='number'
          name='guestCount'
          min='1'
          step='1'
          inputmode='numeric'
          required
        )
      p.birthday-rsvp-popup__error(v-if='joinFormError') {{ joinFormError }}
      .birthday-rsvp-popup__actions
        button.birthday-rsvp-popup__button.birthday-rsvp-popup__button--secondary(
          type='button'
          :disabled='isSubmittingJoinForm'
          @click='closeJoinPopup'
        ) Cancel
        button.birthday-rsvp-popup__button.birthday-rsvp-popup__button--primary(
          type='submit'
          :disabled='isSubmittingJoinForm'
        ) {{ isSubmittingJoinForm ? 'Submitting...' : 'Submit' }}
  .birthday-rsvp-popup(
    v-if='isThankYouPopupOpen'
    role='dialog'
    aria-modal='true'
    aria-labelledby='birthday-rsvp-thanks-title'
    @click.self='closeThankYouPopup'
  )
    .birthday-rsvp-popup__panel.birthday-rsvp-popup__panel--message
      h2#birthday-rsvp-thanks-title.birthday-rsvp-popup__title Thank you and see you there!
      button.birthday-rsvp-popup__button.birthday-rsvp-popup__button--primary(
        type='button'
        @click='closeThankYouPopup'
      ) Close
</template>

<script setup>
import { onMounted, ref } from 'vue';
import bg1Url from 'src/assets/images/bg/bg1.png';
import sectionTwoUrl from 'src/assets/images/section2.png';

const isImageVisible = ref(false);
const isJoinPopupOpen = ref(false);
const isThankYouPopupOpen = ref(false);
const isSubmittingJoinForm = ref(false);
const fullName = ref('');
const guestCount = ref('');
const joinFormError = ref('');
const googleSheetId = '1ZhRPpUreSLnTPRMP8yWRJNpk5hQVoaUuKAzg05FpGWw';
const birthdayRsvpWebAppUrl = process.env.BIRTHDAY_RSVP_WEB_APP_URL || '';
const sectionTwoStyle = {
  backgroundImage: `url(${bg1Url})`,
};

const handleJoinClick = () => {
  joinFormError.value = '';
  isJoinPopupOpen.value = true;
};

const closeJoinPopup = () => {
  if (isSubmittingJoinForm.value) {
    return;
  }

  isJoinPopupOpen.value = false;
};

const closeThankYouPopup = () => {
  isThankYouPopupOpen.value = false;
};

const getValidatedRsvp = () => {
  const trimmedFullName = fullName.value.trim();
  const parsedGuestCount = Number(guestCount.value);

  if (
    !trimmedFullName ||
    !Number.isInteger(parsedGuestCount) ||
    parsedGuestCount < 1
  ) {
    throw new Error('Please complete all required fields.');
  }

  return {
    fullName: trimmedFullName,
    guestCount: parsedGuestCount,
  };
};

const submitRsvpToGoogleSheet = async (rsvp) => {
  if (!birthdayRsvpWebAppUrl) {
    throw new Error('RSVP form is not connected yet.');
  }

  const formBody = new URLSearchParams({
    spreadsheetId: googleSheetId,
    fullName: rsvp.fullName,
    guestCount: String(rsvp.guestCount),
    submittedAt: new Date().toISOString(),
  });

  await fetch(birthdayRsvpWebAppUrl, {
    method: 'POST',
    mode: 'no-cors',
    body: formBody,
  });
};

const resetJoinForm = () => {
  fullName.value = '';
  guestCount.value = '';
  joinFormError.value = '';
};

const handleJoinSubmit = async () => {
  joinFormError.value = '';

  try {
    const rsvp = getValidatedRsvp();

    isSubmittingJoinForm.value = true;
    await submitRsvpToGoogleSheet(rsvp);

    isJoinPopupOpen.value = false;
    isThankYouPopupOpen.value = true;
    resetJoinForm();
  } catch (error) {
    joinFormError.value =
      error instanceof Error ? error.message : 'Unable to submit RSVP.';
  } finally {
    isSubmittingJoinForm.value = false;
  }
};

const handleDeclineClick = () => {
  window.alert("You selected: Sorry, I can't join.");
};

onMounted(() => {
  requestAnimationFrame(() => {
    isImageVisible.value = true;
  });
});
</script>

<style lang="scss" scoped>
.birthday-section-two {
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.birthday-section-two__image {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  opacity: 0;
  filter: blur(18px);
  transform: translateY(48px);
  transition: transform 900ms cubic-bezier(0.16, 1, 0.3, 1), filter 900ms ease,
    opacity 650ms ease;
  will-change: transform, filter, opacity;
}

.birthday-section-two__image--visible {
  opacity: 1;
  filter: blur(0);
  transform: translateY(0);
}

.birthday-section-two__option {
  position: absolute;
  z-index: 1;
  display: block;
  padding: 0;
  border: 0;
  background: transparent;
  appearance: none;
  cursor: pointer;
}

.birthday-section-two__option:focus-visible {
  outline: 2px solid rgba(175, 46, 67, 0.7);
  outline-offset: 4px;
  border-radius: 16px;
}

.birthday-section-two__option--join {
  left: 26.8%;
  top: 36.6%;
  width: 45.9%;
  height: 22.3%;
}

.birthday-section-two__option--decline {
  left: 26.9%;
  top: 62.7%;
  width: 46.3%;
  height: 21.3%;
}

.birthday-rsvp-popup {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(53, 28, 31, 0.44);
  backdrop-filter: blur(4px);
}

.birthday-rsvp-popup__panel {
  width: min(100%, 340px);
  padding: 22px;
  color: #4a1f27;
  background: rgba(255, 248, 247, 0.96);
  border: 1px solid rgba(175, 46, 67, 0.2);
  border-radius: 8px;
  box-shadow: 0 18px 44px rgba(53, 28, 31, 0.24);
}

.birthday-rsvp-popup__panel--message {
  text-align: center;
}

.birthday-rsvp-popup__title {
  margin: 0 0 18px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  color: #af2e43;
  text-align: center;
}

.birthday-rsvp-popup__field {
  display: grid;
  gap: 6px;
  margin-bottom: 14px;
  font-size: 14px;
  font-weight: 700;
  color: #6d2b35;
}

.birthday-rsvp-popup__field input {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  font: inherit;
  font-weight: 500;
  color: #3f2026;
  background: #fff;
  border: 1px solid rgba(175, 46, 67, 0.35);
  border-radius: 8px;
  outline: none;
}

.birthday-rsvp-popup__field input:focus {
  border-color: #af2e43;
  box-shadow: 0 0 0 3px rgba(175, 46, 67, 0.14);
}

.birthday-rsvp-popup__error {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.35;
  color: #b42335;
}

.birthday-rsvp-popup__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.birthday-rsvp-popup__button {
  min-height: 42px;
  padding: 9px 12px;
  font: inherit;
  font-weight: 700;
  line-height: 1.2;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
}

.birthday-rsvp-popup__button:disabled {
  cursor: wait;
  opacity: 0.72;
}

.birthday-rsvp-popup__button--primary {
  color: #fff;
  background: #af2e43;
  border-color: #af2e43;
}

.birthday-rsvp-popup__button--secondary {
  color: #7c3540;
  background: #fff;
  border-color: rgba(175, 46, 67, 0.25);
}

@media (prefers-reduced-motion: reduce) {
  .birthday-section-two__image {
    opacity: 1;
    filter: none;
    transform: none;
    transition: none;
  }
}
</style>
