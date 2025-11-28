'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Check, AlertCircle, Loader2 } from 'lucide-react';

interface FormData {
    name: string;
    email: string;
    phone: string;
    company_name: string;
    project_idea: string;
    project_type: string;
    budget: string;
    timeline: string;
    message: string;
}

export default function AskPage() {
    const t = useTranslations('AskPage');
    const tCommon = useTranslations('Common');

    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        company_name: '',
        project_idea: '',
        project_type: '',
        budget: '',
        timeline: '',
        message: ''
    });

    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // Validate file size (10MB)
            if (selectedFile.size > 10 * 1024 * 1024) {
                setErrorMessage(t('fileTooLarge'));
                setSubmitStatus('error');
                return;
            }

            setFile(selectedFile);
            setErrorMessage('');
            setSubmitStatus('idle');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');
        setSubmitStatus('idle');

        try {
            // Validate required fields
            if (!formData.name || !formData.email || !formData.project_idea) {
                throw new Error(t('requiredFields'));
            }

            // Get current locale from URL
            const locale = window.location.pathname.split('/')[1] || 'en';

            // Prepare file data if present
            let fileData = null;
            if (file) {
                const reader = new FileReader();
                const fileBase64 = await new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                fileData = {
                    name: file.name,
                    data: fileBase64,
                    type: file.type,
                    size: file.size
                };
            }

            // Get Supabase URL from environment
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            if (!supabaseUrl) {
                throw new Error('Supabase URL not configured');
            }

            // Submit to Edge Function
            const response = await fetch(`${supabaseUrl}/functions/v1/contact-form-handler`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    preferred_language: locale,
                    file: fileData
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit inquiry');
            }

            // Success!
            setSubmitStatus('success');

            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                company_name: '',
                project_idea: '',
                project_type: '',
                budget: '',
                timeline: '',
                message: ''
            });
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

        } catch (error) {
            console.error('Form submission error:', error);
            setErrorMessage(error instanceof Error ? error.message : t('submitError'));
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-24">
            {/* Header */}
            <div className="text-center mb-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">
                        {t('title')}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>
            </div>

            {/* Form Section */}
            <section className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-2xl p-8 md:p-12 shadow-2xl">

                        {/* Success Message */}
                        {submitStatus === 'success' && (
                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <p className="text-green-600 dark:text-green-400">{t('successMessage')}</p>
                            </div>
                        )}

                        {/* Error Message */}
                        {submitStatus === 'error' && errorMessage && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                <p className="text-red-600 dark:text-red-400">{errorMessage}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div className="space-y-2">
                                <label htmlFor="name" className="block text-sm font-medium">
                                    {t('name')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    placeholder={t('namePlaceholder')}
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium">
                                    {t('email')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    placeholder={t('emailPlaceholder')}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Phone */}
                            <div className="space-y-2">
                                <label htmlFor="phone" className="block text-sm font-medium">
                                    {t('phone')}
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    placeholder={t('phonePlaceholder')}
                                />
                            </div>

                            {/* Company Name */}
                            <div className="space-y-2">
                                <label htmlFor="company_name" className="block text-sm font-medium">
                                    {t('company')}
                                </label>
                                <input
                                    type="text"
                                    id="company_name"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    placeholder={t('companyPlaceholder')}
                                />
                            </div>
                        </div>

                        {/* Project Idea */}
                        <div className="space-y-2">
                            <label htmlFor="project_idea" className="block text-sm font-medium">
                                {t('idea')} <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="project_idea"
                                name="project_idea"
                                required
                                rows={5}
                                value={formData.project_idea}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                                placeholder={t('desc')}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Project Type */}
                            <div className="space-y-2">
                                <label htmlFor="project_type" className="block text-sm font-medium">
                                    {t('projectType')}
                                </label>
                                <select
                                    id="project_type"
                                    name="project_type"
                                    value={formData.project_type}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                >
                                    <option value="">{t('selectType')}</option>
                                    <option value="web">{t('typeWeb')}</option>
                                    <option value="mobile">{t('typeMobile')}</option>
                                    <option value="ai">{t('typeAI')}</option>
                                    <option value="branding">{t('typeBranding')}</option>
                                    <option value="custom">{t('typeCustom')}</option>
                                </select>
                            </div>

                            {/* Budget */}
                            <div className="space-y-2">
                                <label htmlFor="budget" className="block text-sm font-medium">
                                    {t('budget')}
                                </label>
                                <select
                                    id="budget"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                >
                                    <option value="">{t('selectBudget')}</option>
                                    <option value="under-5k">{t('budgetUnder5k')}</option>
                                    <option value="5k-10k">{t('budget5kTo10k')}</option>
                                    <option value="10k-25k">{t('budget10kTo25k')}</option>
                                    <option value="25k-50k">{t('budget25kTo50k')}</option>
                                    <option value="50k-plus">{t('budget50kPlus')}</option>
                                </select>
                            </div>

                            {/* Timeline */}
                            <div className="space-y-2">
                                <label htmlFor="timeline" className="block text-sm font-medium">
                                    {t('timeline')}
                                </label>
                                <select
                                    id="timeline"
                                    name="timeline"
                                    value={formData.timeline}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                >
                                    <option value="">{t('selectTimeline')}</option>
                                    <option value="urgent">{t('timelineUrgent')}</option>
                                    <option value="1-3-months">{t('timeline1to3')}</option>
                                    <option value="3-6-months">{t('timeline3to6')}</option>
                                    <option value="6-plus-months">{t('timeline6Plus')}</option>
                                </select>
                            </div>
                        </div>

                        {/* Additional Message */}
                        <div className="space-y-2">
                            <label htmlFor="message" className="block text-sm font-medium">
                                {t('message')}
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows={3}
                                value={formData.message}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                                placeholder={t('messagePlaceholder')}
                            />
                        </div>

                        {/* File Upload */}
                        <div className="space-y-2">
                            <label htmlFor="file" className="block text-sm font-medium">
                                {t('file')}
                            </label>
                            <div className="relative">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    id="file"
                                    onChange={handleFileChange}
                                    className="w-full px-4 py-3 rounded-lg bg-background border border-border file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.jpg,.jpeg,.png,.webp,.gif"
                                />
                                {file && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        {tCommon('selected')}: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                    </p>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('fileHelp')}
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 rounded-lg bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(56,189,248,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    {t('submitting')}
                                </>
                            ) : (
                                <>
                                    <Send className="h-5 w-5" />
                                    {t('submitButton')}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}
