<script setup>
const user = useSupabaseUser()

if (!user.value) {
  navigateTo('/login')
}

const supabase = useSupabaseClient()
const { profile, isAdmin, fetchProfile } = useProfile()

const resources = ref([])
const search = ref('')
const filterType = ref('')

const selectedResource = ref(null)
const startTime = ref('')
const endTime = ref('')

const newResourceName = ref('')
const newResourceType = ref('room')

const loadResources = async () => {
  const { data } = await supabase.from('resources').select('*')
  resources.value = data || []
}

const addResource = async () => {
  if (!newResourceName.value) return
  await supabase.from('resources').insert([{ name: newResourceName.value, type: newResourceType.value }])
  newResourceName.value = ''
  loadResources()
}

const deleteResource = async (id) => {
  if (confirm('Opravdu smazat položku?')) {
    await supabase.from('resources').delete().eq('id', id)
    loadResources()
  }
}

const makeReservation = async () => {
  if (!user.value) return alert('Musíš se nejdřív přihlásit!')
  if (new Date(startTime.value) >= new Date(endTime.value)) return alert('Konec musí být po začátku!')

  const { data: conflicts } = await supabase
    .from('reservations')
    .select('id')
    .eq('resource_id', selectedResource.value.id)
    .lt('start_time', endTime.value)
    .gt('end_time', startTime.value)

  if (conflicts && conflicts.length > 0) {
    alert('Bohužel, v tomto čase už má rezervaci někdo jiný.');
    return
  }

  const { error } = await supabase.from('reservations').insert([
    {
      resource_id: selectedResource.value.id,
      user_id: user.value.id,
      start_time: startTime.value,
      end_time: endTime.value
    }
  ])

  if (error) alert(error.message)
  else {
    alert('Rezervace úspěšně uložena!')
    selectedResource.value = null
  }
}

const filteredResources = computed(() => {
  return resources.value.filter(res => {
    const matchSearch = res.name.toLowerCase().includes(search.value.toLowerCase())
    const matchType = filterType.value ? res.type === filterType.value : true
    return matchSearch && matchType
  })
})

const logout = async () => {
  await supabase.auth.signOut()
  profile.value = null
  navigateTo('/login')
}

onMounted(() => {
  loadResources()
  fetchProfile()
})
</script>

<template>
  <div style="max-width: 800px; margin: 20px auto; font-family: sans-serif;">
    <header style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
      <h1>Rezervace učeben a techniky</h1>
      <div v-if="user">
        <span>Ahoj, {{ profile?.display_name }} ({{ profile?.role }})</span>
        <button @click="logout" style="margin-left: 10px;">Odhlásit</button>
      </div>
      <NuxtLink v-else to="/login">Přihlásit se</NuxtLink>
    </header>

    <section v-if="isAdmin" style="background: #f4f4f4; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <h3>Admin Panel: Přidat zdroj</h3>
      <input v-model="newResourceName" placeholder="Název učebny/vybavení" />
      <select v-model="newResourceType">
        <option value="room">Učebna</option>
        <option value="equipment">Vybavení</option>
      </select>
      <button @click="addResource">Uložit</button>
    </section>

    <section style="margin: 20px 0; display: flex; gap: 10px;">
      <input v-model="search" placeholder="Vyhledat podle názvu..." style="flex: 1;" />
      <select v-model="filterType">
        <option value="">Všechny typy</option>
        <option value="room">Učebny</option>
        <option value="equipment">Vybavení</option>
      </select>
    </section>

    <section style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
      <div v-for="res in filteredResources" :key="res.id" style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
        <h4>{{ res.name }}</h4>
        <p>Typ: {{ res.type === 'room' ? 'Učebna' : 'Vybavení' }}</p>
        <div style="display: flex; gap: 5px;">
          <button @click="selectedResource = res">Rezervovat</button>
          <button v-if="isAdmin" @click="deleteResource(res.id)" style="color: red;">Smazat</button>
        </div>
      </div>
    </section>

    <div v-if="selectedResource" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
      <div style="background: white; padding: 20px; border-radius: 5px; width: 300px;">
        <h3>Rezervace: {{ selectedResource.name }}</h3>
        <label style="display:block; margin-top:10px;">Od:</label>
        <input type="datetime-local" v-model="startTime" style="width: 100%;" />
        
        <label style="display:block; margin-top:10px;">Do:</label>
        <input type="datetime-local" v-model="endTime" style="width: 100%;" />
        
        <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
          <button @click="selectedResource = null">Zrušit</button>
          <button @click="makeReservation" style="background: green; color: white;">Potvrdit</button>
        </div>
      </div>
    </div>
  </div>
</template>