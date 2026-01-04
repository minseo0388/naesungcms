import { Editor } from "@tiptap/react"
import {
    Bold,
    Italic,
    Heading1,
    Heading2,
    List,
    ListOrdered,
    Link as LinkIcon,
    Image as ImageIcon
} from "lucide-react"
import { Toggle } from "@/components/ui/toggle"

interface ToolbarProps {
    editor: Editor
}

export function Toolbar({ editor }: ToolbarProps) {
    if (!editor) {
        return null
    }

    return (
        <div className="border border-input bg-transparent rounded-t-md p-2 flex flex-wrap gap-1 items-center">
            <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 1 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
                <Heading1 className="h-4 w-4" />
            </Toggle>

            <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 2 })}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
                <Heading2 className="h-4 w-4" />
            </Toggle>

            <div className="w-px h-6 bg-border mx-1" />

            <Toggle
                size="sm"
                pressed={editor.isActive("bold")}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
            >
                <Bold className="h-4 w-4" />
            </Toggle>

            <Toggle
                size="sm"
                pressed={editor.isActive("italic")}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            >
                <Italic className="h-4 w-4" />
            </Toggle>

            <div className="w-px h-6 bg-border mx-1" />
            {/* Placeholder for link logic */}
            <Toggle
                size="sm"
                pressed={editor.isActive("link")}
                onPressedChange={() => {
                    const previousUrl = editor.getAttributes('link').href
                    const url = window.prompt('URL', previousUrl)
                    if (url === null) return
                    if (url === '') {
                        editor.chain().focus().extendMarkRange('link').unsetLink().run()
                        return
                    }
                    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
                }}
            >
                <LinkIcon className="h-4 w-4" />
            </Toggle>
        </div>
    )
}
