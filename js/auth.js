const WCAuth = {
    currentUser: null,
    currentProfile: null,

    async initialize() {
        const client = getSupabaseClient();
        if (!client) {
            console.error('Supabase client not initialized');
            return false;
        }

        try {
            const { data: { session } } = await client.auth.getSession();
            
            if (session?.user) {
                this.currentUser = session.user;
                await this.loadUserProfile();
                this.setupAuthListener();
                return true;
            }

            this.setupAuthListener();
            return false;
        } catch (error) {
            console.error('Error initializing auth:', error);
            return false;
        }
    },

    setupAuthListener() {
        const client = getSupabaseClient();
        if (!client) return;

        client.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event);
            
            if (event === 'SIGNED_IN' && session?.user) {
                this.currentUser = session.user;
                await this.loadUserProfile();
                this.onAuthStateChanged(true);
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.currentProfile = null;
                this.onAuthStateChanged(false);
            }
        });
    },

    async loadUserProfile() {
        if (!this.currentUser) return null;

        const client = getSupabaseClient();
        const { data, error } = await client
            .from('profiles')
            .select('*')
            .eq('id', this.currentUser.id)
            .single();

        if (error) {
            console.error('Error loading profile:', error);
            return null;
        }

        this.currentProfile = data;
        return data;
    },

    async signUp(email, password, userData = {}) {
        const client = getSupabaseClient();
        if (!client) return { error: 'Supabase not initialized' };

        const { data, error } = await client.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: userData.full_name || '',
                    language: userData.language || 'en'
                }
            }
        });

        if (error) {
            console.error('Sign up error:', error);
            return { error };
        }

        return { data };
    },

    async signIn(email, password) {
        const client = getSupabaseClient();
        if (!client) return { error: 'Supabase not initialized' };

        const { data, error } = await client.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Sign in error:', error);
            return { error };
        }

        this.currentUser = data.user;
        await this.loadUserProfile();

        return { data };
    },

    async signInWithOAuth(provider) {
        const client = getSupabaseClient();
        if (!client) return { error: 'Supabase not initialized' };

        const { data, error } = await client.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: `${window.location.origin}/client-space.html`
            }
        });

        if (error) {
            console.error('OAuth sign in error:', error);
            return { error };
        }

        return { data };
    },

    async signOut() {
        const client = getSupabaseClient();
        if (!client) return { error: 'Supabase not initialized' };

        const { error } = await client.auth.signOut();

        if (error) {
            console.error('Sign out error:', error);
            return { error };
        }

        this.currentUser = null;
        this.currentProfile = null;

        return { success: true };
    },

    async resetPassword(email) {
        const client = getSupabaseClient();
        if (!client) return { error: 'Supabase not initialized' };

        const { data, error } = await client.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password.html`
        });

        if (error) {
            console.error('Password reset error:', error);
            return { error };
        }

        return { data };
    },

    async updatePassword(newPassword) {
        const client = getSupabaseClient();
        if (!client) return { error: 'Supabase not initialized' };

        const { data, error } = await client.auth.updateUser({
            password: newPassword
        });

        if (error) {
            console.error('Update password error:', error);
            return { error };
        }

        return { data };
    },

    async updateProfile(updates) {
        if (!this.currentUser) {
            return { error: 'No user logged in' };
        }

        const client = getSupabaseClient();
        if (!client) return { error: 'Supabase not initialized' };

        const { data, error } = await client
            .from('profiles')
            .update(updates)
            .eq('id', this.currentUser.id)
            .select()
            .single();

        if (error) {
            console.error('Update profile error:', error);
            return { error };
        }

        this.currentProfile = data;
        return { data };
    },

    isAuthenticated() {
        return this.currentUser !== null;
    },

    isAdmin() {
        return this.currentProfile?.role === 'admin';
    },

    isStaff() {
        return this.currentProfile?.role === 'staff' || this.isAdmin();
    },

    async requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    },

    async requireAdmin() {
        if (!this.isAuthenticated() || !this.isAdmin()) {
            window.location.href = '/index.html';
            return false;
        }
        return true;
    },

    onAuthStateChanged(isAuthenticated) {
        const event = new CustomEvent('authStateChanged', {
            detail: {
                isAuthenticated,
                user: this.currentUser,
                profile: this.currentProfile
            }
        });
        window.dispatchEvent(event);
    },

    getUserLanguage() {
        return this.currentProfile?.language || localStorage.getItem('wc_lang') || 'en';
    }
};

if (typeof window !== 'undefined') {
    window.WCAuth = WCAuth;
    
    document.addEventListener('DOMContentLoaded', () => {
        WCAuth.initialize();
    });
}
