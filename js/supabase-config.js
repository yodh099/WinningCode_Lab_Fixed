const SUPABASE_CONFIG = {
    url: '',
    anonKey: ''
};

let supabaseClient = null;

function initSupabase() {
    if (supabaseClient) {
        return supabaseClient;
    }

    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
        console.error('❌ Supabase configuration missing. Please set SUPABASE_CONFIG.url and SUPABASE_CONFIG.anonKey');
        return null;
    }

    try {
        supabaseClient = supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );
        console.log('✅ Supabase client initialized successfully');
        return supabaseClient;
    } catch (error) {
        console.error('❌ Error initializing Supabase client:', error);
        return null;
    }
}

function getSupabaseClient() {
    if (!supabaseClient) {
        return initSupabase();
    }
    return supabaseClient;
}

const supabaseStorage = {
    BUCKETS: {
        PROJECT_IMAGES: 'project-images',
        BLOG_IMAGES: 'blog-images',
        CLIENT_FILES: 'client-files',
        INQUIRY_ATTACHMENTS: 'inquiry-attachments'
    },

    async uploadFile(bucket, filePath, file) {
        const client = getSupabaseClient();
        if (!client) return { error: 'Supabase not initialized' };

        const { data, error } = await client.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error(`Error uploading file to ${bucket}:`, error);
            return { error };
        }

        return { data };
    },

    async getPublicUrl(bucket, filePath) {
        const client = getSupabaseClient();
        if (!client) return null;

        const { data } = client.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return data?.publicUrl || null;
    },

    async deleteFile(bucket, filePath) {
        const client = getSupabaseClient();
        if (!client) return { error: 'Supabase not initialized' };

        const { error } = await client.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            console.error(`Error deleting file from ${bucket}:`, error);
            return { error };
        }

        return { success: true };
    }
};

if (typeof window !== 'undefined') {
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
    window.initSupabase = initSupabase;
    window.getSupabaseClient = getSupabaseClient;
    window.supabaseStorage = supabaseStorage;
}
