interface UserProfile {
  id: string
  email: string
  role: 'student' | 'admin'
  display_name: string | null
}

export const useProfile = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  

  const profile = useState<UserProfile | null>('user_profile', () => null)

const fetchProfile = async () => {

  if (import.meta.server || !user.value) {
    profile.value = null
    return
  }
  
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.value.id)
    .single()
  
  profile.value = data as UserProfile | null
}

  const isAdmin = computed(() => profile.value?.role === 'admin')

  return { profile, isAdmin, fetchProfile }
}