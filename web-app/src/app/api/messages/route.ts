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
        const conversationId = searchParams.get('conversation_id');

        if (!conversationId) {
            return NextResponse.json(
                { error: 'conversation_id is required' },
                { status: 400 }
            );
        }

        // Get messages from view (which includes RLS)
        const { data: messages, error } = await supabase
            .from('messages_with_profiles')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ messages });
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
        if (!body.conversation_id || !body.content) {
            return NextResponse.json(
                { error: 'conversation_id and content are required' },
                { status: 400 }
            );
        }

        // Determine recipient (either client or admin)
        const { data: conversation } = await supabase
            .from('conversations')
            .select('client_id, admin_id')
            .eq('id', body.conversation_id)
            .single();

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            );
        }

        const recipientId = user.id === conversation.client_id
            ? conversation.admin_id
            : conversation.client_id;

        // Create message
        const { data: message, error } = await (supabase
            .from('messages') as any)
            .insert({
                conversation_id: body.conversation_id,
                sender_id: user.id,
                recipient_id: recipientId,
                content: body.content,
                file_urls: body.file_urls || []
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Update conversation last_message_at
        await supabase
            .from('conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', body.conversation_id);

        return NextResponse.json({ message }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
