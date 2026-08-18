import { UserProfile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { UserAvatar } from "@/components/user-avatar";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function getUserProfile(username: string): Promise<UserProfile | null> {
  const res = await fetch(`${BACKEND_URL}/users/${username}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    return null;
  }
  return res.json();
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getUserProfile(username);

  if (!profile) {
    notFound();
  }

  return (
     <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-8">
      <div className="flex items-center gap-4">
        <UserAvatar username={profile.username} size="md" />
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{profile.username}</h1>
          {profile.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card size="sm" className="items-center text-center">
          <CardContent className="flex flex-col items-center py-2">
            <span className="text-2xl font-semibold text-foreground">{profile.karma}</span>
            <span className="text-xs text-muted-foreground">Karma</span>
          </CardContent>
        </Card>
        <Card size="sm" className="items-center text-center">
          <CardContent className="flex flex-col items-center py-2">
            <span className="text-2xl font-semibold text-foreground">{profile.submissionsCount}</span>
            <span className="text-xs text-muted-foreground">Submissions</span>
          </CardContent>
        </Card>
        <Card size="sm" className="items-center text-center">
          <CardContent className="flex flex-col items-center py-2">
            <span className="text-2xl font-semibold text-foreground">{profile.reviewsGivenCount}</span>
            <span className="text-xs text-muted-foreground">Reviews Given</span>
          </CardContent>
        </Card>
      </div>

      {profile.techStack.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {profile.techStack.map((tech) => (
            <span key={tech} className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
              {tech}
            </span>
          ))}
        </div>
      )}

      {profile.githubLink && (
        <a
          href={profile.githubLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
        >
          <FaGithub className="size-4" />
          GitHub
        </a>
      )}

      <Link href="/" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
        ← Back to feed
      </Link>
    </div>
    
  );
}