'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Save, Building2, DollarSign, Briefcase } from 'lucide-react';

interface ProfileData {
    full_name: string;
    company_name: string;
    phone: string;
    bio: string;
    project_type: string;
    budget_range: string;
}

export default function ClientProfileForm() {
    const [profile, setProfile] = useState<ProfileData>({
        full_name: '',
        company_name: '',
        phone: '',
        bio: '',
        project_type: '',
        budget_range: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;
            setUserId(user.id);

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            if (data) {
                setProfile({
                    full_name: data.full_name || '',
                    company_name: data.company_name || '',
                    phone: data.phone || '',
                    bio: data.bio || '',
                    project_type: data.project_type || '',
                    budget_range: data.budget_range || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!userId) return;

        setSaving(true);
        try {
            const response = await fetch(`/api/clients/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });

            if (!response.ok) throw new Error('Failed to update profile');

            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Personal Information</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={profile.full_name}
                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            <Building2 className="inline h-4 w-4 mr-1" />
                            Company Name
                        </label>
                        <input
                            type="text"
                            value={profile.company_name}
                            onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Acme Corp"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Phone
                        </label>
                        <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            About You
                        </label>
                        <textarea
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Tell us about yourself..."
                        />
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Project Details</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            <Briefcase className="inline h-4 w-4 mr-1" />
                            Project Type
                        </label>
                        <select
                            value={profile.project_type}
                            onChange={(e) => setProfile({ ...profile, project_type: e.target.value })}
                            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Select a type...</option>
                            <option value="website">Website Development</option>
                            <option value="app">Mobile App</option>
                            <option value="branding">Branding & Design</option>
                            <option value="marketing">Digital Marketing</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            <DollarSign className="inline h-4 w-4 mr-1" />
                            Budget Range
                        </label>
                        <select
                            value={profile.budget_range}
                            onChange={(e) => setProfile({ ...profile, budget_range: e.target.value })}
                            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Select a range...</option>
                            <option value="under_5k">Under $5,000</option>
                            <option value="5k_10k">$5,000 - $10,000</option>
                            <option value="10k_25k">$10,000 - $25,000</option>
                            <option value="25k_50k">$25,000 - $50,000</option>
                            <option value="50k_plus">$50,000+</option>
                        </select>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {saving ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        <Save className="h-5 w-5" />
                        Save Profile
                    </>
                )}
            </button>
        </form>
    );
}
