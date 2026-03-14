export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  role: 'homeowner' | 'technician'
  phone: string | null
  stripe_customer_id: string | null
  plan: 'free' | 'pro'
  created_at: string
}

export interface Home {
  id: string
  user_id: string
  name: string
  address: string | null
  country: string | null
  state: string | null
  city: string | null
  size_sqft: number | null
  year_built: number | null
  notes: string | null
  created_at: string
}

export interface Appliance {
  id: string
  home_id: string
  name: string
  category: string | null
  brand: string | null
  model: string | null
  installation_date: string | null
  warranty_expiry: string | null
  notes: string | null
}

export interface MaintenanceTask {
  id: string
  home_id: string
  appliance_id: string | null
  title: string
  description: string | null
  category: string | null
  frequency_days: number | null
  next_due_date: string | null
  last_completed: string | null
  status: 'pending' | 'completed' | 'overdue'
  priority: 'low' | 'normal' | 'high' | 'urgent'
}

export interface Document {
  id: string
  home_id: string
  user_id: string
  name: string
  file_url: string | null
  category: string | null
  uploaded_at: string
}

export interface Expense {
  id: string
  home_id: string
  user_id: string
  category: string | null
  amount: number
  description: string | null
  date: string | null
  notes: string | null
}

export interface Technician {
  id: string
  user_id: string
  category: string | null
  description: string | null
  hourly_rate: number | null
  country: string | null
  state: string | null
  city: string | null
  is_verified: boolean
  is_available: boolean
  rating: number
  total_reviews: number
  profile_image: string | null
  profiles?: Profile
}

export interface ServiceRequest {
  id: string
  homeowner_id: string
  technician_id: string
  home_id: string | null
  title: string | null
  description: string | null
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected'
  scheduled_date: string | null
  completed_date: string | null
  amount: number | null
  created_at: string
  profiles?: Profile
  technicians?: Technician & { profiles?: Profile }
  homes?: Home
}

export interface Message {
  id: string
  request_id: string | null
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
  sender?: Profile
}

export interface Review {
  id: string
  technician_id: string
  homeowner_id: string
  request_id: string | null
  rating: number
  comment: string | null
  created_at: string
  profiles?: Profile
}
