<template>
  <form
    @submit.prevent="handleSubmit"
    class="space-y-6">
    <div class="form-group">
      <UInput
        v-model="email"
        type="email"
        id="email"
        variant="outline"
        color="neutral"
        size="xl"
        icon="hugeicons:at"
        class="w-full"
        placeholder="电子邮件"
        :disabled="isSubmitting" />
    </div>

    <div class="form-group">
      <UInput
        v-model="firstName"
        type="text"
        id="firstName"
        variant="outline"
        color="neutral"
        size="xl"
        icon="hugeicons:user-square"
        class="w-full"
        placeholder="你的名字"
        :disabled="isSubmitting" />
    </div>

    <div class="form-group">
      <UInput
        v-model="password"
        id="password"
        variant="outline"
        color="neutral"
        size="xl"
        icon="hugeicons:square-lock-add-02"
        class="w-full"
        placeholder="输入密码"
        :type="showPassword ? 'text' : 'password'"
        :disabled="isSubmitting">
        <template #trailing>
          <UButton
            color="neutral"
            variant="link"
            size="md"
            tabindex="-1"
            :icon="showPassword ? 'hugeicons:view-off' : 'hugeicons:view'"
            @click="showPassword = !showPassword" />
        </template>
      </UInput>
    </div>

    <div class="form-group">
      <UInput
        v-model="password_confirm"
        id="password"
        variant="outline"
        color="neutral"
        size="xl"
        icon="hugeicons:square-lock-check-02"
        class="w-full"
        placeholder="确认密码"
        :type="showConfirmPassword ? 'text' : 'password'"
        :disabled="isSubmitting">
        <template #trailing>
          <UButton
            color="neutral"
            variant="link"
            size="md"
            tabindex="-1"
            :icon="showConfirmPassword ? 'hugeicons:view-off' : 'hugeicons:view'"
            @click="showConfirmPassword = !showConfirmPassword" />
        </template>
      </UInput>
    </div>

    <div
      v-if="error"
      class="text-red-500 text-sm">
      {{ error }}
    </div>

    <UButton
      type="submit"
      size="xl"
      color="primary"
      block
      :disabled="isSubmitting"
      :loading="isSubmitting">
      {{ isSubmitting ? "正在处理" : "注册" }}
    </UButton>

    <USeparator><span class="text-neutral-600 text-sm">或者</span></USeparator>

    <UButton
      variant="soft"
      color="neutral"
      size="xl"
      block
      :disabled="isSubmitting"
      to="/login">
      返回登录
    </UButton>
  </form>
</template>

<script setup lang="ts">
const { register } = useAuth();
const router = useRouter();

const firstName = ref("");
const email = ref("");
const password = ref("");
const password_confirm = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const error = ref("");
const isSubmitting = ref(false);

const handleSubmit = async () => {
  if (isSubmitting.value) return;
  error.value = "";

  // 简单的表单验证
  if (!firstName.value.trim()) {
    error.value = "请输入用户名";
    return;
  }
  if (!email.value.trim()) {
    error.value = "请输入电子邮件";
    return;
  }
  if (!password.value.trim()) {
    error.value = "请输入密码";
    return;
  }

  try {
    isSubmitting.value = true;
    await register(email.value, password.value, firstName.value);
    router.push("/");
  } catch (e: any) {
    error.value = e.message || "注册失败，请重试";
  } finally {
    isSubmitting.value = false;
  }
};
</script>
