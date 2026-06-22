import React, { useState } from 'react';
import AutoComplete from 'react-google-autocomplete';

interface AddressDetails {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

export function AddressForm() {
    const [address, setAddress] = useState<AddressDetails>({
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
    });

    const handlePlaceSelected = (place: any) => {
        // Google returns a nested array called 'address_components'
        const components = place.address_components;

        let streetNumber = '';
        let route = '';
        let city = '';
        let state = '';
        let zip = '';
        let country = '';

        if (components) {
            for (const component of components) {
                const types = component.types;
                if (types.includes('street_number')) streetNumber = component.long_name;
                if (types.includes('route')) route = component.long_name;
                if (types.includes('locality')) city = component.long_name;
                if (types.includes('administrative_area_level_1')) state = component.long_name;
                if (types.includes('postal_code')) zip = component.long_name;
                if (types.includes('country')) country = component.long_name;
            }
        }

        setAddress({
            street: `${streetNumber} ${route}`.trim(),
            city,
            state,
            zip,
            country,
        });
    };

    return (
        <div className="max-w-md mx-auto p-4 space-y-4 rounded shadow">
            <h3 className="text-lg font-bold">Shipping Address</h3>

            <div>
                <label className="block text-sm font-medium text-black-100">Search Address</label>
                {/* The Autocomplete Input field */}
                <AutoComplete
                    // apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyCfZsCQv4s_R97ApOGC4Klbj61jPtjnGOY"}
                    apiKey="AIzaSyCfZsCQv4s_R97ApOGC4Klbj61jPtjnGOY"
                    onPlaceSelected={handlePlaceSelected}
                    options={{
                        types: ['address'],
                        fields: ['address_components', 'formatted_address'],
                    }}
                    className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring focus:ring-blue-200"
                    placeholder="Start typing your address..."
                />
            </div>

            {/* Auto-filled form inputs ready for database submission */}
            <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                    <label className="text-xs text-gray-500">Street</label>
                    <input type="text" value={address.street} readOnly className="w-full p-2 border bg-gray-50 rounded" />
                </div>
                <div>
                    <label className="text-xs text-gray-500">City</label>
                    <input type="text" value={address.city} readOnly className="w-full p-2 border bg-gray-50 rounded" />
                </div>
                <div>
                    <label className="text-xs text-gray-500">Postal Code</label>
                    <input type="text" value={address.zip} readOnly className="w-full p-2 border bg-gray-50 rounded" />
                </div>
            </div>
        </div>
    );
}

export default AddressForm;