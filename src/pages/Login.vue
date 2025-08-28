<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useForm, useField } from 'vee-validate';
import { z } from 'zod';
import { toFormValidator } from '@vee-validate/zod';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'En az 8 karakter'),
  remember: z.boolean().optional().default(false),
});

const { handleSubmit, isSubmitting, errors } = useForm({
  validationSchema: toFormValidator(schema),
});
const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');
const { value: remember } = useField<boolean>('remember');

const showPwd = ref(false);
const errMsg = ref<string | null>(null);

function safeRedirect(r: unknown): string {
  const v = typeof r === 'string' ? r : '/';
  return v.startsWith('/') && !v.startsWith('//') ? v : '/';
}

const submit = handleSubmit(async (vals) => {
  errMsg.value = null;
  try {
    await auth.login(vals.email, vals.password);

    if (remember.value) localStorage.setItem('remember', '1');
    else localStorage.removeItem('remember');

    router.replace(safeRedirect(route.query.r));
  } catch (e: any) {
    errMsg.value = e?.message ?? 'Giriş başarısız.';
  }
});
</script>

<template>
  <main class="p-6 max-w-sm mx-auto">
    <h1 class="text-xl mb-4">Giriş</h1>

    <form @submit.prevent="submit" class="flex flex-col gap-3" novalidate>
      <div class="flex flex-col gap-1">
        <input
          v-model="email"
          type="email"
          inputmode="email"
          autocomplete="username"
          autocapitalize="none"
          spellcheck="false"
          placeholder="E-posta"
          required
        />
        <small v-if="errors.email" class="text-red-600">{{ errors.email }}</small>
      </div>

      <div class="flex flex-col gap-1 relative">
        <input
          :type="showPwd ? 'text' : 'password'"
          v-model="password"
          autocomplete="current-password"
          placeholder="Şifre"
          required
        />
        <button
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
          @click="showPwd = !showPwd"
          aria-label="Şifreyi göster/gizle"
        >
          {{ showPwd ? 'Gizle' : 'Göster' }}
        </button>
        <small v-if="errors.password" class="text-red-600">{{ errors.password }}</small>
      </div>

      <label class="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" v-model="remember" />
        Beni hatırla
      </label>

      <button type="submit" :disabled="isSubmitting ? true : false">Giriş</button>
      <p v-if="errMsg" class="text-sm text-red-600" role="alert">{{ errMsg }}</p>
    </form>
  </main>
</template>
