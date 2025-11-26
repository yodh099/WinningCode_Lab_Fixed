import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Get user from Auth header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
        }

        const { file_path } = await req.json();
        if (!file_path) {
            return new Response(JSON.stringify({ error: 'Missing file_path' }), { status: 400, headers: corsHeaders });
        }

        // Check permissions
        // 1. Check if user is admin/staff
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        const isAdmin = profile?.role === 'admin' || profile?.role === 'staff';

        // 2. If not admin, check if file belongs to a project the user owns
        if (!isAdmin) {
            // Check the files table.
            const { data: fileRecord } = await supabase
                .from('files')
                .select('project_id, client_projects(client_id)')
                .eq('file_path', file_path)
                .single();

            if (!fileRecord || fileRecord.client_projects.client_id !== user.id) {
                return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
            }
        }

        // Generate signed URL
        const { data, error } = await supabase
            .storage
            .from('project_files')
            .createSignedUrl(file_path, 3600); // 1 hour

        if (error) throw error;

        return new Response(
            JSON.stringify({ signedUrl: data.signedUrl }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
