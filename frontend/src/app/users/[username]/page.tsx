import { UserProfile } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import Link from "next/link";

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
      <Card>
        <CardHeader>
          <CardTitle>{profile.username}</CardTitle>
          {profile.bio && <CardDescription>{profile.bio}</CardDescription>}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
            {profile.techStack.map((tech) => (
              <span key={tech} className="rounded bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                {tech}
              </span>
            ))}
          </div>

          {profile.githubLink && (
            <a
        
              href={profile.githubLink}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 underline dark:text-blue-400"
            >
              GitHub
            </a>
          )}

          <div className="flex gap-6 text-sm">
            <span><span className="font-medium">{profile.karma}</span> karma</span>
            <span><span className="font-medium">{profile.submissionsCount}</span> submissions</span>
            <span><span className="font-medium">{profile.reviewsGivenCount}</span> reviews given</span>
          </div>
        </CardContent>
      </Card>

      <Link href="/" className="text-sm text-zinc-500 underline">
        ← Back to feed
      </Link>
    </div>
  );
}