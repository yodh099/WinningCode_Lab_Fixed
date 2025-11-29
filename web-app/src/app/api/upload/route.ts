import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const conversationId = formData.get('conversation_id') as string;

        if (!file || !conversationId) {
            return NextResponse.json(
                { error: 'File and conversation_id are required' },
                { status: 400 }
            );
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File size must be less than 10MB' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'File type not allowed' },
                { status: 400 }
            );
        }

        // Verify user is part of this conversation
        const { data: conversation } = await supabase
            .from('conversations')
            .select('client_id, admin_id')
            .eq('id', conversationId)
            .single();

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            );
        }

        // Check if user is client or admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAdmin = profile && ['admin', 'staff'].includes(profile.role);
        const isClient = conversation.client_id === user.id;

        if (!isAdmin && !isClient) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const ext = file.name.split('.').pop();
        const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;
        const filePath = `${conversationId}/${filename}`;

        // Upload to Supabase Storage
        const fileBuffer = await file.arrayBuffer();
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('message-attachments')
            .upload(filePath, fileBuffer, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) {
            return NextResponse.json(
                { error: 'Failed to upload file' },
                { status: 500 }
            );
        }

        // Get public URL (signed for 1 year)
        const { data: urlData } = await supabase.storage
            .from('message-attachments')
            .createSignedUrl(filePath, 31536000); // 1 year

        return NextResponse.json({
            file: {
                name: file.name,
                size: file.size,
                type: file.type,
                url: urlData?.signedUrl
            }
        });
    } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
