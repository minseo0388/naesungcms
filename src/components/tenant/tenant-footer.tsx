export function TenantFooter() {
    return (
        <footer className="border-t bg-slate-50 py-8 text-center text-sm text-muted-foreground">
            <div className="container mx-auto px-4">
                <p>&copy; {new Date().getFullYear()} All rights reserved. </p>
                <p className="mt-2 text-xs">
                    Powered by <span className="font-semibold text-slate-800">NaesungCMS</span> - Created by Choi Minseo
                </p>
            </div>
        </footer>
    )
}
