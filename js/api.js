const WCAPI = {
    
    projects: {
        async getAll(options = {}) {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            let query = client
                .from('projects')
                .select('*')
                .eq('published', true)
                .order('display_order', { ascending: true });

            if (options.limit) {
                query = query.limit(options.limit);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching projects:', error);
                return { error };
            }

            return { data };
        },

        async getById(id) {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            const { data, error } = await client
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching project:', error);
                return { error };
            }

            return { data };
        },

        async create(projectData) {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            const { data, error } = await client
                .from('projects')
                .insert(projectData)
                .select()
                .single();

            if (error) {
                console.error('Error creating project:', error);
                return { error };
            }

            return { data };
        },

        async update(id, updates) {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            const { data, error } = await client
                .from('projects')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating project:', error);
                return { error };
            }

            return { data };
        },

        async delete(id) {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            const { error } = await client
                .from('projects')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting project:', error);
                return { error };
            }

            return { success: true };
        }
    },

    blogPosts: {
        async getAll(options = {}) {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            let query = client
                .from('blog_posts')
                .select('*')
                .eq('published', true)
                .order('published_at', { ascending: false });

            if (options.limit) {
                query = query.limit(options.limit);
            }

            if (options.category) {
                query = query.eq('category', options.category);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching blog posts:', error);
                return { error };
            }

            return { data };
        },

        async getBySlug(slug) {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            const { data, error } = await client
                .from('blog_posts')
                .select('*, profiles(full_name, avatar_url)')
                .eq('slug', slug)
                .single();

            if (error) {
                console.error('Error fetching blog post:', error);
                return { error };
            }

            await this.incrementViews(data.id);

            return { data };
        },

        async incrementViews(id) {
            const client = getSupabaseClient();
            if (!client) return;

            await client.rpc('increment_blog_views', { post_id: id });
        },

        async create(postData) {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            const { data, error } = await client
                .from('blog_posts')
                .insert(postData)
                .select()
                .single();

            if (error) {
                console.error('Error creating blog post:', error);
                return { error };
            }

            return { data };
        },

        async update(id, updates) {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            const { data, error } = await client
                .from('blog_posts')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating blog post:', error);
                return { error };
            }

            return { data };
        }
    },

    inquiries: {
        async create(inquiryData) {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            const { data, error } = await client
                .from('inquiries')
                .insert({
                    name: inquiryData.name,
                    email: inquiryData.email,
                    phone: inquiryData.phone,
                    project_idea: inquiryData.project_idea,
                    budget: inquiryData.budget,
                    file_url: inquiryData.file_url,
                    status: 'new'
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating inquiry:', error);
                return { error };
            }

            return { data };
        },

        async getAll(options = {}) {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            let query = client
                .from('inquiries')
                .select('*')
                .order('created_at', { ascending: false });

            if (options.status) {
                query = query.eq('status', options.status);
            }

            if (options.limit) {
                query = query.limit(options.limit);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching inquiries:', error);
                return { error };
            }

            return { data };
        },

        async updateStatus(id, status, notes = '') {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            const { data, error } = await client
                .from('inquiries')
                .update({ status, notes })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating inquiry:', error);
                return { error };
            }

            return { data };
        }
    },

    clientProjects: {
        async getMyProjects() {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            if (!WCAuth.currentUser) {
                return { error: 'Not authenticated' };
            }

            const { data, error } = await client
                .from('client_projects')
                .select('*')
                .eq('client_id', WCAuth.currentUser.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching client projects:', error);
                return { error };
            }

            return { data };
        },

        async getById(id) {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            const { data, error } = await client
                .from('client_projects')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching project:', error);
                return { error };
            }

            return { data };
        },

        async create(projectData) {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            const { data, error } = await client
                .from('client_projects')
                .insert(projectData)
                .select()
                .single();

            if (error) {
                console.error('Error creating project:', error);
                return { error };
            }

            return { data };
        },

        async update(id, updates) {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            const { data, error } = await client
                .from('client_projects')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating project:', error);
                return { error };
            }

            return { data };
        }
    },

    messages: {
        async getMyMessages(options = {}) {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            if (!WCAuth.currentUser) {
                return { error: 'Not authenticated' };
            }

            let query = client
                .from('messages')
                .select('*, sender:profiles!messages_sender_id_fkey(full_name, avatar_url)')
                .or(`recipient_id.eq.${WCAuth.currentUser.id},sender_id.eq.${WCAuth.currentUser.id}`)
                .order('created_at', { ascending: false });

            if (options.projectId) {
                query = query.eq('project_id', options.projectId);
            }

            if (options.unreadOnly) {
                query = query.eq('is_read', false);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching messages:', error);
                return { error };
            }

            return { data };
        },

        async send(messageData) {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            if (!WCAuth.currentUser) {
                return { error: 'Not authenticated' };
            }

            const { data, error } = await client
                .from('messages')
                .insert({
                    sender_id: WCAuth.currentUser.id,
                    recipient_id: messageData.recipient_id,
                    project_id: messageData.project_id,
                    subject: messageData.subject,
                    content: messageData.content,
                    parent_message_id: messageData.parent_message_id
                })
                .select()
                .single();

            if (error) {
                console.error('Error sending message:', error);
                return { error };
            }

            return { data };
        },

        async markAsRead(messageId) {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            const { data, error } = await client
                .from('messages')
                .update({ 
                    is_read: true, 
                    read_at: new Date().toISOString() 
                })
                .eq('id', messageId)
                .select()
                .single();

            if (error) {
                console.error('Error marking message as read:', error);
                return { error };
            }

            return { data };
        },

        async getUnreadCount() {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            if (!WCAuth.currentUser) {
                return { count: 0 };
            }

            const { count, error } = await client
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('recipient_id', WCAuth.currentUser.id)
                .eq('is_read', false);

            if (error) {
                console.error('Error getting unread count:', error);
                return { error };
            }

            return { count };
        }
    },

    files: {
        async getProjectFiles(projectId) {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            const { data, error } = await client
                .from('files')
                .select('*, uploader:profiles!files_uploader_id_fkey(full_name)')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching files:', error);
                return { error };
            }

            return { data };
        },

        async upload(projectId, file, description = '') {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            if (!WCAuth.currentUser) {
                return { error: 'Not authenticated' };
            }

            const fileName = `${WCAuth.currentUser.id}/${Date.now()}-${file.name}`;
            
            const { data: uploadData, error: uploadError } = await supabaseStorage.uploadFile(
                supabaseStorage.BUCKETS.CLIENT_FILES,
                fileName,
                file
            );

            if (uploadError) {
                return { error: uploadError };
            }

            const fileUrl = await supabaseStorage.getPublicUrl(
                supabaseStorage.BUCKETS.CLIENT_FILES,
                fileName
            );

            const { data, error } = await client
                .from('files')
                .insert({
                    project_id: projectId,
                    uploader_id: WCAuth.currentUser.id,
                    file_name: file.name,
                    file_url: fileUrl,
                    file_size: file.size,
                    file_type: file.type,
                    description
                })
                .select()
                .single();

            if (error) {
                console.error('Error saving file record:', error);
                return { error };
            }

            return { data };
        },

        async delete(fileId, fileUrl) {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            const fileName = fileUrl.split('/').pop();
            
            await supabaseStorage.deleteFile(
                supabaseStorage.BUCKETS.CLIENT_FILES,
                `${WCAuth.currentUser.id}/${fileName}`
            );

            const { error } = await client
                .from('files')
                .delete()
                .eq('id', fileId);

            if (error) {
                console.error('Error deleting file:', error);
                return { error };
            }

            return { success: true };
        }
    },

    projectUpdates: {
        async getByProject(projectId) {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            const { data, error } = await client
                .from('project_updates')
                .select('*, user:profiles(full_name, avatar_url)')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching project updates:', error);
                return { error };
            }

            return { data };
        },

        async create(updateData) {
            const client = getSupabaseClient();
            if (!client) return { error: 'Supabase not initialized' };

            const { data, error } = await client
                .from('project_updates')
                .insert({
                    ...updateData,
                    user_id: WCAuth.currentUser?.id
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating project update:', error);
                return { error };
            }

            return { data };
        }
    }
};

if (typeof window !== 'undefined') {
    window.WCAPI = WCAPI;
}
