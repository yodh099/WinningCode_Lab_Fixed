import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // 1. Delete old notifications (e.g., older than 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        await supabase.from('notifications').delete().lt('created_at', thirtyDaysAgo);

        // 2. Delete old activity_log (e.g., older than 90 days)
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
        await supabase.from('activity_log').delete().lt('created_at', ninetyDaysAgo);

        // 3. Archive completed projects (> 6 months)
        const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
        await supabase
            .from('client_projects')
            .update({ status: 'archived' })
            .eq('status', 'completed')
            .lt('updated_at', sixMonthsAgo);

        return new Response(
            JSON.stringify({ message: 'Cleanup complete' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});
