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

        const { name, email, subject, message } = await req.json();

        // 1. Validate data
        if (!name || !email || !message) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 2. Rate limiting (Simple: check last inquiry from this email in last 5 mins)
        const { data: recentInquiries } = await supabase
            .from('inquiries')
            .select('created_at')
            .eq('email', email)
            .gt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
            .limit(1);

        if (recentInquiries && recentInquiries.length > 0) {
            return new Response(
                JSON.stringify({ error: 'Too many requests. Please wait a few minutes.' }),
                { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 3. Store in inquiries
        const { error: insertError } = await supabase
            .from('inquiries')
            .insert({ name, email, subject, message });

        if (insertError) throw insertError;

        // 4. Notify admins (Insert into notifications table)
        // Find all admins
        const { data: admins } = await supabase
            .from('profiles')
            .select('id')
            .in('role', ['admin', 'staff']);

        if (admins && admins.length > 0) {
            const notifications = admins.map(admin => ({
                user_id: admin.id,
                title: 'New Inquiry',
                message: `New inquiry from ${name} (${email}): ${subject || 'No Subject'}`,
                link: '/admin/inquiries'
            }));

            await supabase.from('notifications').insert(notifications);
        }

        return new Response(
            JSON.stringify({ message: 'Inquiry received' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
