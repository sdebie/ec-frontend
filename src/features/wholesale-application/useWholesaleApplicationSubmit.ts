import {useCallback} from 'react';

import {toast} from '@/components/shared/toast';

import type {WholesaleApplicationValues} from '@/features/wholesale-application/schema';


export function useWholesaleApplicationSubmit() {
    const submitApplication = useCallback(async (data: WholesaleApplicationValues) => {
        await Promise.resolve();
        console.info('[wholesale-application]', data);
        toast.success(
            'Thank you. Your wholesale application has been recorded. We will contact you after review.',
        );
    }, []);

    return {submitApplication};
}
