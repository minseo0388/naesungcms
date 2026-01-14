"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateBlogSettings } from "@/actions/settings"
import { toast } from "sonner"

export default function AppearanceSettingsPage({ params }: { params: { blogId: string } }) {
    const [color, setColor] = useState("blue")
    const [layout, setLayout] = useState("grid")
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        const themeConfig = JSON.stringify({ primaryColor: color, layout })

        const res = await updateBlogSettings(params.blogId, { themeConfig })

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Appearance updated!")
        }
        setIsSaving(false)
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Theme Customization</CardTitle>
                    <CardDescription>Customize how your blog looks to visitors.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Primary Color</Label>
                        <div className="flex gap-2">
                            {['blue', 'red', 'green', 'violet', 'orange'].map(c => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-primary' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }} // Simple mapping, real app would use strict palette
                                />
                            ))}
                        </div>
                        <p className="text-muted-foreground text-sm">Selected: {color}</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Layout Style</Label>
                        <Select value={layout} onValueChange={setLayout}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="grid">Grid (Cards)</SelectItem>
                                <SelectItem value="list">List (Minimal)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
