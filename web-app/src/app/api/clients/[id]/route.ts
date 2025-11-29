import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { id } = params;

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin or the client themselves
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAdmin = profile && ['admin', 'staff'].includes(profile.role);
        const isOwnProfile = user.id === id;

        if (!isAdmin && !isOwnProfile) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get client data
        const { data: client, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }

        return NextResponse.json({ client });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { id } = params;
        const body = await request.json();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin or the client themselves
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAdmin = profile && ['admin', 'staff'].includes(profile.role);
        const isOwnProfile = user.id === id;

        if (!isAdmin && !isOwnProfile) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Clients can't update notes field (admin only)
        const allowedFields = isAdmin
            ? ['full_name', 'company_name', 'phone', 'bio', 'project_type', 'budget_range', 'notes']
            : ['full_name', 'company_name', 'phone', 'bio', 'project_type', 'budget_range'];

        const updates: any = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        updates.updated_at = new Date().toISOString();

        // Update client
        const { data: client, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ client });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
