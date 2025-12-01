export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    company_name: string | null
                    phone: string | null
                    bio: string | null
                    timezone: string | null
                    language: string
                    avatar_url: string | null
                    role: 'client' | 'admin' | 'staff'
                    is_active: boolean
                    email_verified: boolean
                    last_login_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    company_name?: string | null
                    phone?: string | null
                    bio?: string | null
                    timezone?: string | null
                    language?: string
                    avatar_url?: string | null
                    role?: 'client' | 'admin' | 'staff'
                    is_active?: boolean
                    email_verified?: boolean
                    last_login_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    company_name?: string | null
                    phone?: string | null
                    bio?: string | null
                    timezone?: string | null
                    language?: string
                    avatar_url?: string | null
                    role?: 'client' | 'admin' | 'staff'
                    is_active?: boolean
                    email_verified?: boolean
                    last_login_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            inquiries: {
                Row: {
                    id: string
                    name: string
                    email: string
                    phone: string | null
                    company_name: string | null
                    project_idea: string
                    project_type: string | null
                    budget: string | null
                    timeline: string | null
                    preferred_language: string
                    message: string | null
                    source: string
                    status: 'new' | 'reviewing' | 'responded' | 'converted' | 'closed'
                    priority: 'low' | 'normal' | 'high' | 'urgent'
                    notes: string | null
                    assigned_to: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    email: string
                    phone?: string | null
                    company_name?: string | null
                    project_idea: string
                    project_type?: string | null
                    budget?: string | null
                    timeline?: string | null
                    preferred_language?: string
                    message?: string | null
                    source?: string
                    status?: 'new' | 'reviewing' | 'responded' | 'converted' | 'closed'
                    priority?: 'low' | 'normal' | 'high' | 'urgent'
                    notes?: string | null
                    assigned_to?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string
                    phone?: string | null
                    company_name?: string | null
                    project_idea?: string
                    project_type?: string | null
                    budget?: string | null
                    timeline?: string | null
                    preferred_language?: string
                    message?: string | null
                    source?: string
                    status?: 'new' | 'reviewing' | 'responded' | 'converted' | 'closed'
                    priority?: 'low' | 'normal' | 'high' | 'urgent'
                    notes?: string | null
                    assigned_to?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    title: Json
                    description: Json
                    excerpt: Json | null
                    slug: string
                    status: 'planned' | 'in_progress' | 'completed' | 'maintenance'
                    image_url: string | null
                    demo_url: string | null
                    github_url: string | null
                    technologies: string[] | null
                    category: string | null
                    featured: boolean
                    published: boolean
                    display_order: number
                    view_count: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: Json
                    description: Json
                    excerpt?: Json | null
                    slug: string
                    status?: 'planned' | 'in_progress' | 'completed' | 'maintenance'
                    image_url?: string | null
                    demo_url?: string | null
                    github_url?: string | null
                    technologies?: string[] | null
                    category?: string | null
                    featured?: boolean
                    published?: boolean
                    display_order?: number
                    view_count?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: Json
                    description?: Json
                    excerpt?: Json | null
                    slug?: string
                    status?: 'planned' | 'in_progress' | 'completed' | 'maintenance'
                    image_url?: string | null
                    demo_url?: string | null
                    github_url?: string | null
                    technologies?: string[] | null
                    category?: string | null
                    featured?: boolean
                    published?: boolean
                    display_order?: number
                    view_count?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            client_projects: {
                Row: {
                    id: string
                    client_id: string
                    title: string
                    description: string | null
                    status: 'pending' | 'active' | 'on_hold' | 'completed' | 'cancelled'
                    priority: 'low' | 'normal' | 'high' | 'urgent'
                    budget: number | null
                    currency: string
                    progress: number
                    start_date: string | null
                    end_date: string | null
                    deadline: string | null
                    milestones: Json
                    created_by: string | null
                    assigned_to: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    client_id: string
                    title: string
                    description?: string | null
                    status?: 'pending' | 'active' | 'on_hold' | 'completed' | 'cancelled'
                    priority?: 'low' | 'normal' | 'high' | 'urgent'
                    budget?: number | null
                    currency?: string
                    progress?: number
                    start_date?: string | null
                    end_date?: string | null
                    deadline?: string | null
                    milestones?: Json
                    created_by?: string | null
                    assigned_to?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    client_id?: string
                    title?: string
                    description?: string | null
                    status?: 'pending' | 'active' | 'on_hold' | 'completed' | 'cancelled'
                    priority?: 'low' | 'normal' | 'high' | 'urgent'
                    budget?: number | null
                    currency?: string
                    progress?: number
                    start_date?: string | null
                    end_date?: string | null
                    deadline?: string | null
                    milestones?: Json
                    created_by?: string | null
                    assigned_to?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            ideas: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    description: string
                    budget: string | null
                    deadline: string | null
                    file_url: string | null
                    priority: string
                    status: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    description: string
                    budget?: string | null
                    deadline?: string | null
                    file_url?: string | null
                    priority?: string
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    description?: string
                    budget?: string | null
                    deadline?: string | null
                    file_url?: string | null
                    priority?: string
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            messages: {
                Row: {
                    id: string
                    project_id: string | null
                    sender_id: string | null
                    recipient_id: string | null
                    content: string
                    is_internal: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id?: string | null
                    sender_id?: string | null
                    recipient_id?: string | null
                    content: string
                    is_internal?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string | null
                    sender_id?: string | null
                    recipient_id?: string | null
                    content?: string
                    is_internal?: boolean
                    created_at?: string
                }
            }
            invoices: {
                Row: {
                    id: string
                    project_id: string
                    status: string
                    total_amount: number
                    currency: string
                    issue_date: string
                    due_date: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    status?: string
                    total_amount?: number
                    currency?: string
                    issue_date?: string
                    due_date?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    status?: string
                    total_amount?: number
                    currency?: string
                    issue_date?: string
                    due_date?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            invoice_items: {
                Row: {
                    id: string
                    invoice_id: string
                    description: string
                    quantity: number
                    unit_price: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    invoice_id: string
                    description: string
                    quantity?: number
                    unit_price?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    invoice_id?: string
                    description?: string
                    quantity?: number
                    unit_price?: number
                    created_at?: string
                }
            }
            blog_posts: {
                Row: {
                    id: string
                    slug: string
                    title: Json
                    content: Json
                    excerpt: Json | null
                    cover_image: string | null
                    author_id: string | null
                    category_id: string | null
                    tags: string[] | null
                    status: 'draft' | 'published' | 'archived'
                    published: boolean
                    published_at: string | null
                    featured: boolean
                    view_count: number
                    reading_time: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    slug: string
                    title: Json
                    content: Json
                    excerpt?: Json | null
                    cover_image?: string | null
                    author_id?: string | null
                    category_id?: string | null
                    tags?: string[] | null
                    status?: 'draft' | 'published' | 'archived'
                    published?: boolean
                    published_at?: string | null
                    featured?: boolean
                    view_count?: number
                    reading_time?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    slug?: string
                    title?: Json
                    content?: Json
                    excerpt?: Json | null
                    cover_image?: string | null
                    author_id?: string | null
                    category_id?: string | null
                    tags?: string[] | null
                    status?: 'draft' | 'published' | 'archived'
                    published?: boolean
                    published_at?: string | null
                    featured?: boolean
                    view_count?: number
                    reading_time?: number | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            is_admin: {
                Args: Record<PropertyKey, never>
                Returns: boolean
            }
        }
        Enums: {
            [_ in never]: never
        }
    }
}
