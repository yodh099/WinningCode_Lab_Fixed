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
