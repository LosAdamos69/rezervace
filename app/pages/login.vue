<script setup>
const user = useSupabaseUser()

if (user.value) {
  navigateTo('/')
}

const supabase = useSupabaseClient()
const { fetchProfile } = useProfile()
const email = ref('')
const password = ref('')
const isRegister = ref(false)

const handleAuth = async () => {
  if (isRegister.value) {
    const { error } = await supabase.auth.signUp({ email: email.value, password: password.value })
    if (error) alert(error.message)
    else alert('Registrace hotová! Můžeš se přihlásit.')
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
    if (error) alert(error.message)
    else {
      await fetchProfile()
      navigateTo('/')
    }
  }
}
</script>

<template>
  <div style="max-width: 400px; margin: 50px auto; font-family: sans-serif;">
    <h2>{{ isRegister ? 'Nová registrace' : 'Přihlášení' }}</h2>
    <form @submit.prevent="handleAuth" style="display: flex; flex-direction: column; gap: 10px;">
      <input v-model="email" type="email" placeholder="E-mail" required />
      <input v-model="password" type="password" placeholder="Heslo" required />
      <button type="submit">{{ isRegister ? 'Zaregistrovat' : 'Vstoupit' }}</button>
    </form>
    <p @click="isRegister = !isRegister" style="cursor: pointer; color: blue; text-decoration: underline; font-size: 14px;">
      {{ isRegister ? 'Už máš účet? Přihlas se' : 'Nemáš účet? Zaregistruj se' }}
    </p>
  </div>
</template>