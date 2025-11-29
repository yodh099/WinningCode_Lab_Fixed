import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        )

        const { email, password, full_name, role, phone, company_name } = await req.json()

        // 1. Create Auth User
        const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name,
                role,
            },
        })

        if (authError) throw authError

        // 2. Create Profile (if not created by trigger, or to ensure fields)
        // Note: If you have a trigger on auth.users -> public.profiles, this might duplicate or conflict.
        // Ideally, we update the profile created by the trigger, or insert if no trigger exists.
        // For safety, let's try to update first, if fail/empty, insert.

        // Check if profile exists (created by trigger)
        const { data: existingProfile } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('id', authData.user.id)
            .single()

        let profileError;

        if (existingProfile) {
            const { error } = await supabaseClient
                .from('profiles')
                .update({
                    full_name,
                    role,
                    phone,
                    company_name,
                    is_active: true
                })
                .eq('id', authData.user.id)
            profileError = error;
        } else {
            const { error } = await supabaseClient
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    email: email, // If email is in profiles
                    full_name,
                    role,
                    phone,
                    company_name,
                    is_active: true
                })
            profileError = error;
        }

        if (profileError) {
            // If profile creation fails, we might want to delete the auth user to keep consistency
            // await supabaseClient.auth.admin.deleteUser(authData.user.id)
            throw profileError
        }

        return new Response(
            JSON.stringify({ user: authData.user }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
