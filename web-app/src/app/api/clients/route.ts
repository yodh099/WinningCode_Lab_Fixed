import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || !['admin', 'staff'].includes(profile.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get query params for filtering
        const { searchParams } = new URL(request.url);
        const projectType = searchParams.get('project_type');
        const budgetRange = searchParams.get('budget_range');

        // Build query
        let query = supabase
            .from('profiles')
            .select('*')
            .eq('role', 'client')
            .order('created_at', { ascending: false });

        if (projectType) {
            query = query.eq('project_type', projectType);
        }
        if (budgetRange) {
            query = query.eq('budget_range', budgetRange);
        }

        const { data: clients, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ clients });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
