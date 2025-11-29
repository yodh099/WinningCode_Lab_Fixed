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

        // Get query params
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAdmin = profile && ['admin', 'staff'].includes(profile.role);

        // Build query
        let query = supabase
            .from('conversations')
            .select(`
                *,
                client:client_id(id, full_name, email, company_name),
                admin:admin_id(id, full_name, email)
            `)
            .order('last_message_at', { ascending: false });

        // Filter by user role
        if (!isAdmin) {
            query = query.eq('client_id', user.id);
        }

        // Filter by status if provided
        if (status) {
            query = query.eq('status', status);
        }

        const { data: conversations, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ conversations });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Validate required fields
        if (!body.subject) {
            return NextResponse.json(
                { error: 'Subject is required' },
                { status: 400 }
            );
        }

        // Create conversation
        const { data: conversation, error } = await supabase
            .from('conversations')
            .insert({
                client_id: user.id,
                subject: body.subject,
                status: 'open'
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ conversation }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
