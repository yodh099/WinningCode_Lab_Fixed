import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '@/components/LoginForm';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        refresh: jest.fn(),
    }),
    useSearchParams: () => ({
        get: jest.fn(),
    }),
}));

// Mock @/i18n/routing
jest.mock('@/i18n/routing', () => ({
    Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

// Mock @supabase/ssr
const mockSignInWithPassword = jest.fn();
const mockSignInWithOAuth = jest.fn();

jest.mock('@supabase/ssr', () => ({
    createBrowserClient: () => ({
        auth: {
            signInWithPassword: mockSignInWithPassword,
            signInWithOAuth: mockSignInWithOAuth,
        },
    }),
}));

describe('LoginForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders login form correctly', () => {
        render(<LoginForm locale="en" />);

        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
    });

    it('handles input changes', () => {
        render(<LoginForm locale="en" />);

        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('password123');
    });

    it('submits form with correct credentials', async () => {
        mockSignInWithPassword.mockResolvedValue({ error: null });

        render(<LoginForm locale="en" />);

        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /^sign in$/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSignInWithPassword).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
        });
    });

    it('displays error message on login failure', async () => {
        mockSignInWithPassword.mockResolvedValue({
            error: { message: 'Invalid login credentials' }
        });

        render(<LoginForm locale="en" />);

        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /^sign in$/i });

        fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Invalid login credentials')).toBeInTheDocument();
        });
    });
});
