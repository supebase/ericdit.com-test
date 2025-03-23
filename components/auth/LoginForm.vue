<template>
  <form
    @submit.prevent="handleSubmit"
    class="space-y-4">
    <div class="form-group">
      <label
        for="email"
        class="block text-sm font-medium text-gray-700"
        >邮箱</label
      >
      <input
        v-model="email"
        type="email"
        id="email"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        :disabled="isSubmitting" />
    </div>

    <div class="form-group">
      <label
        for="password"
        class="block text-sm font-medium text-gray-700"
        >密码</label
      >
      <input
        v-model="password"
        type="password"
        id="password"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        :disabled="isSubmitting" />
    </div>

    <div
      v-if="error"
      class="text-red-500 text-sm">
      {{ error }}
    </div>

    <button
      type="submit"
      :disabled="isSubmitting"
      class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
      {{ isSubmitting ? "登录中..." : "登录" }}
    </button>
  </form>
</template>

<script setup lang="ts">
const { login } = useAuth();
const router = useRouter();

const email = ref("");
const password = ref("");
const error = ref("");
const isSubmitting = ref(false);

const handleSubmit = async () => {
  if (isSubmitting.value) return;
  error.value = "";

  try {
    isSubmitting.value = true;
    await login(email.value, password.value);
    router.push("/");
  } catch (e: any) {
    error.value = e.message || "登录失败，请重试";
  } finally {
    isSubmitting.value = false;
  }
};
</script>
