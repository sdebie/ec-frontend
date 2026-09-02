import React from 'react';

interface WhatsAppButtonProps {
    /** Country code + phone number without any +, spaces, or dashes (e.g., "15551234567") */
    phoneNumber?: string;
    /** Pre-filled default message when opening the chat */
    message?: string;
    /** Tailwind positioning classes (default: "bottom-5 right-5") */
    position?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
                                                                  phoneNumber = '15551234567',
                                                                  message = 'Hello! I have a question about your services.',
                                                                  position = 'bottom-5 right-5',
                                                              }) => {
    const encodedMessage = encodeURIComponent(message);

    // Direct link to WhatsApp Web for web browsers
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            className={`fixed ${position} z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 ease-in-out group`}
        >
            {/* Tooltip / Label on Hover */}
            <span className="absolute right-16 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Chat with us
      </span>

            {/* WhatsApp SVG Icon */}
            <svg
                aria-hidden="true"
                className="w-8 h-8 fill-current"
                viewBox="0 0 24 24"
            >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.205 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.842-.981z" />
            </svg>
        </a>
    );
};

export default WhatsAppButton;