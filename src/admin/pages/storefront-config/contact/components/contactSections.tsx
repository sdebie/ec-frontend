import {Clock, Mail, Map as MapIcon, MapPin, Phone, PhoneCall, Send, Share2} from 'lucide-react'
import type {ReactNode} from 'react'

export type ContactSectionKey =
    | 'enquiry'
    | 'emails'
    | 'phones'
    | 'general'
    | 'location'
    | 'hours'
    | 'maps'
    | 'social'

export interface ContactSectionMeta {
    key: ContactSectionKey
    label: string
    icon: ReactNode
}

/** Left-nav order. Default active section is the first entry — see ContactEditorPage. */
export const CONTACT_SECTIONS: ContactSectionMeta[] = [
    {key: 'enquiry', label: 'Enquiry Form', icon: <Send className="h-4 w-4"/>},
    {key: 'emails', label: 'Email Addresses', icon: <Mail className="h-4 w-4"/>},
    {key: 'phones', label: 'Phone Numbers', icon: <Phone className="h-4 w-4"/>},
    {key: 'general', label: 'General', icon: <PhoneCall className="h-4 w-4"/>},
    {key: 'location', label: 'Location', icon: <MapPin className="h-4 w-4"/>},
    {key: 'hours', label: 'Hours & Response', icon: <Clock className="h-4 w-4"/>},
    {key: 'maps', label: 'Maps', icon: <MapIcon className="h-4 w-4"/>},
    {key: 'social', label: 'Social', icon: <Share2 className="h-4 w-4"/>},
]
