import React from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import ResetPasswordModal from '@/features/auth/customer/components/ResetPasswordModal.tsx';

export default function ResetPassword(): React.ReactElement {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialEmail = searchParams.get('email')?.trim() ?? '';
    return (
        <ResetPasswordModal
            isOpen={true}
            onClose={() => navigate(-1)}
            initialEmail={initialEmail}
            onBackToLogin={() => navigate(-1)}
        />
    );
}

