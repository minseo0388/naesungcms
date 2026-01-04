"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import ImageExtension from "@tiptap/extension-image"
import LinkExtension from "@tiptap/extension-link"
import { Toolbar } from "./toolbar"
import DOMPurify from "isomorphic-dompurify"

import { toast } from "sonner"

interface EditorProps {
    value: string
    onChange: (value: string) => void
    blogId: string
}

export function Editor({ value, onChange, blogId }: EditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            LinkExtension.configure({
                openOnClick: false,
            }),
            ImageExtension,
        ],
        content: value,
        editorProps: {
            attributes: {
                className:
                    "min-h-[200px] w-full rounded-b-md border border-t-0 border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 prose prose-sm max-w-none dark:prose-invert",
            },
            handleDrop: (view, event, slice, moved) => {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                    const file = event.dataTransfer.files[0]
                    if (file.type.startsWith("image/")) {
                        uploadImage(file, view, blogId, event.clientX, event.clientY)
                        return true
                    }
                }
                return false
            },
            handlePaste: (view, event, slice) => {
                if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
                    const file = event.clipboardData.files[0]
                    if (file.type.startsWith("image/")) {
                        uploadImage(file, view, blogId)
                        return true
                    }
                }
                return false
            }
        },
        onUpdate: ({ editor }) => {
            // Sanitize before sending to parent
            // Import dynamically or use isomorphic-dompurify
            const clean = DOMPurify.sanitize(editor.getHTML())
            onChange(clean)
        },
    })

    return (
        <div className="flex flex-col w-full">
            <Toolbar editor={editor!} />
            <EditorContent editor={editor} />
        </div>
    )
}

async function uploadImage(file: File, view: any, blogId: string, clientX?: number, clientY?: number) {
    const toastId = toast.loading("Uploading image...")

    // 1. Request Presigned URL
    try {
        const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileType: file.type, fileSize: file.size, blogId }),
        })

        if (!res.ok) {
            toast.error("Failed to get upload URL", { id: toastId })
            console.error("Failed to get upload URL")
            return
        }

        const { uploadUrl, publicUrl } = await res.json()

        // 2. Upload to S3
        const upload = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
        })

        if (upload.ok) {
            toast.success("Image uploaded", { id: toastId })
            // 3. Insert Image into Editor
            const { schema } = view.state
            const node = schema.nodes.image.create({ src: publicUrl })
            const transaction = view.state.tr.insert(
                clientX && clientY ? view.posAtCoords({ left: clientX, top: clientY })?.pos : view.state.selection.from,
                node
            )
            view.dispatch(transaction)
        } else {
            toast.error("Upload failed", { id: toastId })
            console.error("Upload failed")
        }
    } catch (e) {
        toast.error("Error uploading image", { id: toastId })
        console.error(e)
    }
}
