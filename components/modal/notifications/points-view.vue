<template>
  <modal-base :title="$t('modals.notifications.title')" :opened="opened" :name="'notifications-points-modal'"
              :modal-class="'modal-bottom sm:modal-middle'"
              :modal-box-class="'sm:w-fit sm:max-w-5xl'">
    <div class="overflow-x-auto">
      <table class="table table-xs">
        <thead>
        <tr>
          <th>{{ $t("modals.notifications.table.type") }}</th>
          <th>{{ $t("modals.notifications.table.createdAt") }}</th>
          <th>{{ $t("modals.notifications.table.primary") }}</th>
          <th>{{ $t("modals.notifications.table.description") }}</th>
          <th class="text-right">{{ $t("modals.notifications.table.actions") }}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="point in points">
          <td>{{ $t("modals.notifications.table.types." + (point.type === 0 ? "webPush" : "other")) }}</td>
          <td class="w-36">{{ new Date(point.createdAt).toLocaleString(locale, {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}) }}</td>
          <td>
            <p class="link" @click="switchPrimary(point)">
              {{ $t("modals.notifications.table.primaryValues." + point.isPrimary) }}
            </p>
          </td>
          <td><p>{{ point.description }}</p></td>
          <td class="text-right w-1 p-1">
            <buttons-delete-button @click="deletePoint(point)" class="btn btn-ghost btn-xs"/>
          </td>
          <td class="text-right w-1 p-1">
            <notification-button @click="pushTestNotification(point)" class="btn btn-ghost btn-xs"/>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="modal-action mt-2 items-end">
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">{{ $t("modals.notifications.newPoint") }}</span>
        </label>

        <div class="flex join w-full">
          <input class="input input-bordered input-sm join-item w-full"
                 :placeholder="$t('modals.notifications.placeholders.description')"
                 :maxlength="configs.maxDescriptionLength"
                 v-model="newPointDescription"
          >

          <button class="btn btn-sm btn-success join-item" @click="newPoint()"> {{ $t('modals.buttons.create') }} </button>
        </div>
      </div>
      <button @click="close" class="btn btn-sm btn-ghost">{{ $t('modals.buttons.close') }}</button>
    </div>
  </modal-base>
</template>

<script setup>
import NotificationButton from "~/components/buttons/notificationButton.vue";

const props = defineProps({
  opened: {
    type: Boolean,
    required: true
  }
})

const { t, locale } = useI18n();

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

const {$serverConfigs, $notificationsApi, $toastsManager} = useNuxtApp();
const configs = $serverConfigs.configs.notifications;
const vapidKey = $notificationsApi.getVapidKey().value;

const points = ref(null);
const newPointDescription = ref("FinWave Web");

const fetchPoints = async () => {
  points.value = await $notificationsApi.getPoints();
}

const newPoint = () => {
  if (!('serviceWorker' in navigator)) {
    $toastsManager.pushToast(t("modals.notifications.messages.errorServiceWorker"), 3000, "error");

    return;
  }

  requireNotifications().then((s) => {
    if (!s) {
      $toastsManager.pushToast(t("modals.notifications.messages.errorPermissionGet"), 3000, "error");

      return;
    }

    navigator.serviceWorker.ready.then(registration => {
      const pushOptions = {
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(vapidKey)
      };

      registration.pushManager.subscribe(pushOptions).then(subscription => {
        let endpoint = subscription.endpoint;

        let p256dh = arrayBufferToBase64Url(subscription.getKey('p256dh'));
        let auth = arrayBufferToBase64Url(subscription.getKey('auth'));

        $notificationsApi.registerWebPushPoint(endpoint, auth, p256dh, newPointDescription.value).then((s) => {
          if (s !== -1) {
            $toastsManager.pushToast(t("modals.notifications.messages.pointCreate"), 2500, "success");
            fetchPoints();
          }else {
            $toastsManager.pushToast(t("modals.notifications.messages.errorCreate"), 3000,"error");
          }
        });

      }).catch(err => {
        $toastsManager.pushToast(t("modals.notifications.messages.errorSomething"), 3000, "error");
        console.error(err);
      });
    });
  });
}

const requireNotifications = async () => {
  if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
    return (await Notification.requestPermission()) === 'granted'
  }

  return false;
}

const switchPrimary = (point) => {
  $notificationsApi.editPointPrimary(point.pointId, !point.isPrimary).then((s) => {
    if (s) {
      fetchPoints();
    }else {
      $toastsManager.pushToast(t("modals.notifications.messages.errorSomething"), 3000, "error");
    }
  });
}

const deletePoint = (point) => {
  $notificationsApi.deletePoint(point.pointId).then((s) => {
    if (s) {
      $toastsManager.pushToast(t("modals.notifications.messages.successDelete"), 2500, "success");
      fetchPoints();
    }else {
      $toastsManager.pushToast(t("modals.notifications.messages.errorDelete"), 3000, "error");
    }
  });
}

const pushTestNotification = (point) => {
  const text = t("modals.notifications.testNotificationText");

  $notificationsApi.pushNotification(point.pointId, text).then((s) => {
    if (s) {
      $toastsManager.pushToast(t("modals.notifications.messages.testSent"), 2500, "info");
    }else {
      $toastsManager.pushToast(t("modals.notifications.messages.errorSomething"), 3000, "error");
    }
  });
}

const base64UrlToUint8Array = (base64UrlData) => {
  const padding = '='.repeat((4 - base64UrlData.length % 4) % 4);
  const base64 = (base64UrlData + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

  const rawData = atob(base64);
  const buffer = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    buffer[i] = rawData.charCodeAt(i);
  }

  return buffer;
}

const arrayBufferToBase64Url = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
}

watch(() => props.opened, (value) => {
  if (value)
    fetchPoints();
})

</script>

<style scoped>

</style>