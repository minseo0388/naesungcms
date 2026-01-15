import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-lg">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold">Sign In</h1>
                    <p className="text-muted-foreground">
                        Welcome back! Please sign in to continue.
                    </p>
                </div>

                <div className="space-y-4">
                    <form
                        action={async () => {
                            "use server";
                            await signIn("google", { redirectTo: "/dashboard" });
                        }}
                    >
                        <SubmitButton className="w-full" variant="outline" type="submit">
                            Sign in with Google
                        </SubmitButton>
                    </form>

                    <form
                        action={async () => {
                            "use server";
                            await signIn("discord", { redirectTo: "/dashboard" });
                        }}
                    >
                        <SubmitButton className="w-full" variant="outline" type="submit">
                            Sign in with Discord
                        </SubmitButton>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with email
                            </span>
                        </div>
                    </div>

                    <form
                        action={async (formData) => {
                            "use server";
                            await signIn("resend", {
                                email: formData.get("email"),
                                redirectTo: "/dashboard"
                            });
                        }}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                            />
                        </div>
                        <SubmitButton className="w-full" type="submit">
                            Sign in with Email
                        </SubmitButton>
                    </form>
                </div>
            </div>
        </div>
    );
}
