import {useCallback} from 'react';

import {toast} from '@/components/shared/toast';
import {createWholesaleApplication} from '@/services/graphql/storefront/wholesaleCustomer';

import type {WholesaleApplicationValues} from '@/features/wholesale-application/schema';

function optionalValue(value?: string): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
}

function splitName(fullName: string): {firstName: string; lastName?: string} {
    const [firstName, ...rest] = fullName.trim().split(/\s+/);
    const lastName = rest.join(' ').trim();

    return {
        firstName,
        lastName: lastName || undefined,
    };
}

export function useWholesaleApplicationSubmit() {
    const submitApplication = useCallback(async (data: WholesaleApplicationValues) => {
        const {firstName, lastName} = splitName(data.applicantName);
        const customerEmail = optionalValue(data.existingWebsiteAccountEmail) ?? data.applicantEmail.trim();


        try {
            await createWholesaleApplication({
                email: customerEmail,
                firstName,
                lastName,
                phone: data.applicantPhone.trim(),
                companyName: data.companyName.trim(),
                vatNumber: optionalValue(data.vatNumber),
                regNumber: data.companyRegistrationNumber.trim(),
                notes: optionalValue(data.notes),
                physicalAddressLine1: data.companyAddress.trim(),
                physicalAddressLine2: optionalValue(data.deliveryAddress),
                postalAddressLine1: data.companyAddress.trim(),
                postalAddressLine2: optionalValue(data.deliveryAddress),
                status: 'PENDING',
            });

            toast.success(
                'Thank you. Your wholesale application has been recorded. We will contact you after review.',
            );
        } catch (error) {
            console.error('[wholesale-application] failed to save request', error);
            toast.error('We could not submit your application right now. Please try again shortly.');
            throw error;
        }
    }, []);

    return {submitApplication};
}
