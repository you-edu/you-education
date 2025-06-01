"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/NavbarRitu";

export default function LoginPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        {session ? (
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">Signed in as {session.user?.email}</div>
              <Button
                variant="destructive"
                onClick={() => signOut()}
                className="w-full"
              >
                Sign out
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
            </CardHeader> 
            <CardContent className="flex flex-col gap-4">
              <Button onClick={() => signIn("github")} className="w-full">
                Sign in with GitHub
              </Button>
              <Button
                onClick={() => signIn("google")}
                variant="outline"
                className="w-full"
              >
                Sign in with Google
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}