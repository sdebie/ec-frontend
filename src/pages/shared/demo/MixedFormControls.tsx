import {zodResolver} from '@hookform/resolvers/zod';
import {Mail, Package, Zap, Rocket} from 'lucide-react';
import * as React from 'react';
import {useForm, Controller} from 'react-hook-form';
import {z} from 'zod';

import {
    Form,
    FormItem,
    InputField,
    Select,
    MultiSelect,
    DatePicker,
    TimeInput,
    Checkbox,
    Radio,
    Switcher,
    Segment,
    Upload,
    PresetSegmentItemOption,
    PageLayout,
    Button,
} from '@/components';
import {Input} from '@/primitives/input';


// Validation Schema
const formSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    country: z.string().min(1, 'Please select a country'),
    interests: z.array(z.string()).min(1, 'Please select at least one interest'),
    birthDate: z.string().min(1, 'Birth date is required'),
    preferredTime: z.string().min(1, 'Preferred time is required'),
    newsletter: z.boolean(),
    notificationPreferences: z.array(z.string()),
    accountType: z.string().min(1, 'Please select an account type'),
    marketingEmails: z.boolean(),
    deliverySpeed: z.string().min(1, 'Please select delivery speed'),
    subscriptionTier: z.string().min(1, 'Please select a subscription tier'),
    profileImage: z.any().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

// Options
const COUNTRY_OPTIONS = [
    {value: 'us', label: 'United States'},
    {value: 'uk', label: 'United Kingdom'},
    {value: 'ca', label: 'Canada'},
    {value: 'au', label: 'Australia'},
    {value: 'za', label: 'South Africa'},
];

const INTEREST_OPTIONS = [
    {value: 'tech', label: 'Technology'},
    {value: 'sports', label: 'Sports'},
    {value: 'music', label: 'Music'},
    {value: 'travel', label: 'Travel'},
    {value: 'food', label: 'Food & Cooking'},
    {value: 'art', label: 'Art & Design'},
];

const NOTIFICATION_OPTIONS = [
    {value: 'email', label: 'Email notifications'},
    {value: 'sms', label: 'SMS notifications'},
    {value: 'push', label: 'Push notifications'},
];

const ACCOUNT_TYPE_OPTIONS = [
    {value: 'personal', label: 'Personal'},
    {value: 'business', label: 'Business'},
    {value: 'enterprise', label: 'Enterprise'},
];

const DELIVERY_SPEED_OPTIONS = [
    {value: 'standard', label: 'Standard'},
    {value: 'express', label: 'Express'},
    {value: 'overnight', label: 'Overnight'},
];

const SUBSCRIPTION_TIER_DATA = [
    {
        value: 'free',
        label: 'Free',
        description: 'Basic features for personal use',
        icon: <Mail className="w-5 h-5"/>,
    },
    {
        value: 'pro',
        label: 'Pro',
        description: 'Advanced features for professionals',
        icon: <Package className="w-5 h-5"/>,
    },
    {
        value: 'premium',
        label: 'Premium',
        description: 'All features with priority support',
        icon: <Zap className="w-5 h-5"/>,
    },
    {
        value: 'enterprise',
        label: 'Enterprise',
        description: 'Custom solutions for large teams',
        icon: <Rocket className="w-5 h-5"/>,
    },
];

const MixedFormControls: React.FC = () => {
    const {
        control,
        handleSubmit,
        reset,
        formState: {errors, isSubmitting},
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: '',
            email: '',
            country: '',
            interests: [],
            birthDate: '',
            preferredTime: '',
            newsletter: false,
            notificationPreferences: [],
            accountType: '',
            marketingEmails: false,
            deliverySpeed: 'standard',
            subscriptionTier: 'free',
            profileImage: null,
        },
    });

    const onSubmit = async (data: FormValues) => {
        console.log('Form submitted:', data);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        alert('Form submitted successfully! Check console for data.');
    };

    const handleReset = () => {
        reset();
    };

    return (
        <PageLayout title={"Mixed Form Controls"}
                       description={" Comprehensive form demonstrating all available form components with validation"}>
            <Form onSubmit={handleSubmit(onSubmit)}>
                {/* Text Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Controller
                        name="fullName"
                        control={control}
                        render={({field}) => (
                            <FormItem
                                label="Full Name"
                                required
                                errorMessage={errors.fullName?.message}
                                invalid={!!errors.fullName}
                            >
                                <Input
                                    {...field}
                                    placeholder="John Doe"
                                    className="w-full"
                                />
                            </FormItem>
                        )}
                    />

                    <Controller
                        name="email"
                        control={control}
                        render={({field}) => (
                            <FormItem
                                label="Email Address"
                                required
                                errorMessage={errors.email?.message}
                                invalid={!!errors.email}
                                helperText="We'll never share your email"
                            >
                                <InputField
                                    {...field}
                                    type="email"
                                    placeholder="john@example.com"
                                    leftIcon={<Mail className="w-4 h-4"/>}
                                    className="w-full"
                                />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Single Select */}
                <Controller
                    name="country"
                    control={control}
                    render={({field}) => (
                        <FormItem
                            label="Country"
                            required
                            errorMessage={errors.country?.message}
                            invalid={!!errors.country}
                        >
                            <Select
                                options={COUNTRY_OPTIONS}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select your country"
                            />
                        </FormItem>
                    )}
                />

                {/* Multi Select */}
                <Controller
                    name="interests"
                    control={control}
                    render={({field}) => (
                        <FormItem
                            label="Interests"
                            required
                            errorMessage={errors.interests?.message}
                            invalid={!!errors.interests}
                            helperText="Select all that apply"
                        >
                            <MultiSelect
                                options={INTEREST_OPTIONS}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select your interests"
                            />
                        </FormItem>
                    )}
                />

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Controller
                        name="birthDate"
                        control={control}
                        render={({field}) => (
                            <FormItem
                                label="Birth Date"
                                required
                                errorMessage={errors.birthDate?.message}
                                invalid={!!errors.birthDate}
                            >
                                <DatePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select date"
                                />
                            </FormItem>
                        )}
                    />

                    <Controller
                        name="preferredTime"
                        control={control}
                        render={({field}) => (
                            <FormItem
                                label="Preferred Contact Time"
                                required
                                errorMessage={errors.preferredTime?.message}
                                invalid={!!errors.preferredTime}
                            >
                                <TimeInput
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Select time"
                                />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Single Checkbox */}
                <Controller
                    name="newsletter"
                    control={control}
                    render={({field}) => (
                        <FormItem>
                            <Checkbox
                                checked={field.value}
                                onChange={field.onChange}
                                label="Subscribe to newsletter for updates and tips"
                            />
                        </FormItem>
                    )}
                />

                {/* Multiple Checkboxes */}
                <Controller
                    name="notificationPreferences"
                    control={control}
                    render={({field}) => (
                        <FormItem
                            label="Notification Preferences"
                            helperText="Choose how you'd like to be notified"
                        >
                            <div className="space-y-3">
                                {NOTIFICATION_OPTIONS.map((option) => (
                                    <Checkbox
                                        key={option.value}
                                        checked={field.value.includes(option.value)}
                                        onChange={(checked) => {
                                            const newValue = checked
                                                ? [...field.value, option.value]
                                                : field.value.filter((v) => v !== option.value);
                                            field.onChange(newValue);
                                        }}
                                        label={option.label}
                                    />
                                ))}
                            </div>
                        </FormItem>
                    )}
                />

                {/* Radio Group */}
                <Controller
                    name="accountType"
                    control={control}
                    render={({field}) => (
                        <FormItem
                            label="Account Type"
                            required
                            errorMessage={errors.accountType?.message}
                            invalid={!!errors.accountType}
                        >
                            <Radio
                                options={ACCOUNT_TYPE_OPTIONS}
                                value={field.value}
                                onChange={field.onChange}
                                orientation="horizontal"
                            />
                        </FormItem>
                    )}
                />

                {/* Switcher */}
                <Controller
                    name="marketingEmails"
                    control={control}
                    render={({field}) => (
                        <FormItem>
                            <Switcher
                                checked={field.value}
                                onChange={field.onChange}
                                label="Receive marketing emails"
                            />
                        </FormItem>
                    )}
                />

                {/* Segment */}
                <Controller
                    name="deliverySpeed"
                    control={control}
                    render={({field}) => (
                        <FormItem
                            label="Delivery Speed"
                            required
                            errorMessage={errors.deliverySpeed?.message}
                            invalid={!!errors.deliverySpeed}
                        >
                            <Segment
                                options={DELIVERY_SPEED_OPTIONS}
                                value={field.value}
                                onChange={field.onChange}
                                fullWidth
                            />
                        </FormItem>
                    )}
                />

                {/* Preset Segment Item Option */}
                <Controller
                    name="subscriptionTier"
                    control={control}
                    render={({field}) => (
                        <FormItem
                            label="Subscription Tier"
                            required
                            errorMessage={errors.subscriptionTier?.message}
                            invalid={!!errors.subscriptionTier}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {SUBSCRIPTION_TIER_DATA.map((tier) => (
                                    <PresetSegmentItemOption
                                        key={tier.value}
                                        label={tier.label}
                                        description={tier.description}
                                        icon={tier.icon}
                                        selected={field.value === tier.value}
                                        onClick={() => field.onChange(tier.value)}
                                    />
                                ))}
                            </div>
                        </FormItem>
                    )}
                />

                {/* Upload */}
                <Controller
                    name="profileImage"
                    control={control}
                    render={({field}) => (
                        <FormItem
                            label="Profile Image"
                            helperText="Upload a profile picture (Max 5MB)"
                        >
                            <Upload
                                value={field.value}
                                onChange={field.onChange}
                                accept="image/*"
                                maxSize={5}
                            />
                        </FormItem>
                    )}
                />

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-admin-border">
                    <Button type="submit" variant="solid" loading={isSubmitting}>
                        Submit Form
                    </Button>
                    <Button type="button" variant="ghost" onClick={handleReset} disabled={isSubmitting}>
                        Reset
                    </Button>
                </div>
            </Form>
        </PageLayout>
    );
};

export default MixedFormControls;

