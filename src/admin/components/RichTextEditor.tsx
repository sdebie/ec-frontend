import {useCallback, useEffect, useRef} from 'react'
import {EditorContent, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import {
    Bold,
    Heading1,
    Heading2,
    Heading3,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Underline as UnderlineIcon,
    Unlink,
} from 'lucide-react'
import {cn} from '@/shared/utils/cn'

interface RichTextEditorProps {
    value: string
    onChange: (html: string) => void
    disabled?: boolean
}

export function RichTextEditor({value, onChange, disabled = false}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {levels: [1, 2, 3]},
                link: false,
                underline: false,
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {rel: 'noopener noreferrer nofollow'},
            }),
        ],
        content: value,
        editable: !disabled,
        immediatelyRender: false,
        onUpdate: ({editor}) => {
            isInternalUpdate.current = true
            onChange(editor.getHTML())
        },
    })

    // Sync editable state when disabled prop changes
    useEffect(() => {
        if (editor) {
            editor.setEditable(!disabled)
        }
    }, [editor, disabled])

    // Sync content only when value changes externally (e.g. loading from API).
    // We track whether the editor itself triggered the change to avoid resetting
    // the editor on every keystroke — which would break heading/list toggling.
    const isInternalUpdate = useRef(false)

    useEffect(() => {
        if (editor && !isInternalUpdate.current && value !== editor.getHTML()) {
            editor.commands.setContent(value, {emitUpdate: false})
        }
        isInternalUpdate.current = false
    }, [editor, value])

    const handleAddLink = useCallback(() => {
        if (!editor) return
        const previousUrl = editor.getAttributes('link').href ?? ''
        const url = window.prompt('Enter URL', previousUrl)
        if (url === null) return
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }
        editor.chain().focus().extendMarkRange('link').setLink({href: url}).run()
    }, [editor])

    const handleRemoveLink = useCallback(() => {
        if (!editor) return
        editor.chain().focus().unsetLink().run()
    }, [editor])

    if (!editor) return null

    return (
        <div className={cn(
            'rounded-(--c-radius) border border-(--c-border) bg-(--c-panel)',
            disabled && 'opacity-60 pointer-events-none'
        )}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 border-b border-(--c-border) px-2 py-1.5">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({level: 1}).run()}
                    isActive={editor.isActive('heading', {level: 1})}
                    title="Heading 1"
                    disabled={disabled}
                >
                    <Heading1 className="h-4 w-4"/>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({level: 2}).run()}
                    isActive={editor.isActive('heading', {level: 2})}
                    title="Heading 2"
                    disabled={disabled}
                >
                    <Heading2 className="h-4 w-4"/>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({level: 3}).run()}
                    isActive={editor.isActive('heading', {level: 3})}
                    title="Heading 3"
                    disabled={disabled}
                >
                    <Heading3 className="h-4 w-4"/>
                </ToolbarButton>

                <ToolbarDivider/>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Bold"
                    disabled={disabled}
                >
                    <Bold className="h-4 w-4"/>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Italic"
                    disabled={disabled}
                >
                    <Italic className="h-4 w-4"/>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    title="Underline"
                    disabled={disabled}
                >
                    <UnderlineIcon className="h-4 w-4"/>
                </ToolbarButton>

                <ToolbarDivider/>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Ordered List"
                    disabled={disabled}
                >
                    <ListOrdered className="h-4 w-4"/>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Unordered List"
                    disabled={disabled}
                >
                    <List className="h-4 w-4"/>
                </ToolbarButton>

                <ToolbarDivider/>

                <ToolbarButton
                    onClick={handleAddLink}
                    isActive={editor.isActive('link')}
                    title="Add Link"
                    disabled={disabled}
                >
                    <LinkIcon className="h-4 w-4"/>
                </ToolbarButton>
                <ToolbarButton
                    onClick={handleRemoveLink}
                    isActive={false}
                    title="Remove Link"
                    disabled={disabled || !editor.isActive('link')}
                >
                    <Unlink className="h-4 w-4"/>
                </ToolbarButton>
            </div>

            <EditorContent
                editor={editor}
                className="px-4 py-3 text-(--c-text) text-sm min-h-[200px] max-h-[70vh] overflow-y-auto focus-within:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[200px]"
            />
        </div>
    )
}

interface ToolbarButtonProps {
    onClick: () => void
    isActive: boolean
    title: string
    disabled?: boolean
    children: React.ReactNode
}

function ToolbarButton({onClick, isActive, title, disabled, children}: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                'flex items-center justify-center rounded-(--c-radius-sm) p-1.5 transition-colors',
                'text-(--c-text-muted) hover:bg-(--c-surface-hover) hover:text-(--c-text)',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
                isActive && 'bg-primary-subtle text-[var(--primary)]'
            )}
        >
            {children}
        </button>
    )
}

function ToolbarDivider() {
    return <div className="mx-1 h-5 w-px bg-(--c-border)"/>
}
