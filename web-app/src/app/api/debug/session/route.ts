import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({
                authenticated: false,
                error: error?.message
            });
        }

        // Fetch role from profiles
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        return NextResponse.json({
            authenticated: true,
            user: {
                id: user.id,
                email: user.email,
                metadata_role: user.user_metadata?.role,
            },
            profile: profile,
            profile_role: profile?.role
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message
        }, { status: 500 });
    }
}
