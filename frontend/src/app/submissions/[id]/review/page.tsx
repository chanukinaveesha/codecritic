"use client";

import { Button } from "@/components/ui/button";
import { ReviewCriteria, SubmissionDetail } from "@/lib/types";
import { useAuth } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function ReviewPage() {
  const params = useParams();
  const submissionId = params.id as string;

  const router = useRouter();
  const { getToken } = useAuth();

  const [criteria, setCriteria] = useState<ReviewCriteria[]>([]);
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [resourceLinks, setResourceLinks] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCriteria() {
      const res = await fetch(
        `${BACKEND_URL}/submissions/${submissionId}/criteria`,
      );
      const data = await res.json();
      setCriteria(data);

      const startingRatings: Record<number, number> = {};
      for (const c of data) {
        startingRatings[c.id] = 5;
      }
      setRatings(startingRatings);
      setLoading(false);
    }

    loadCriteria();
  }, [submissionId]);

  if (loading) {
    return <p className="p-8 text-sm text-muted-foreground">Loading...</p>;
  }

  function updateRating(criteriaId: number, value: string) {
    setRatings((prev) => ({ ...prev, [criteriaId]: Number(value) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const token = await getToken();

    const body = {
      strengths,
      improvements,
      resourceLinks: resourceLinks
        .split(",")
        .map((link) => link.trim())
        .filter(Boolean),
      ratings: criteria.map((c) => ({
        criteriaId: c.id,
        rating: ratings[c.id],
      })),
    };

    const res = await fetch(`${BACKEND_URL}/submissions/${submissionId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    setIsSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Something went wrong, please try again");
      return;
    }

    router.push(`/submissions/${submissionId}`);
  }

  if (loading) {
    return <p className="p-8 text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Review this submission</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Rate each criteria (1 to 10)</span>
          {criteria.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-2">
              <span className="text-sm">{c.label}</span>
              <input
                type="number"
                min={1}
                max={10}
                value={ratings[c.id] ?? 5}
                onChange={(e) => updateRating(c.id, e.target.value)}
                className="w-16 rounded-md border border-input bg-transparent px-2 py-1 text-sm"
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="strengths" className="text-sm font-medium">
            Strengths
          </label>
          <textarea
            id="strengths"
            required
            rows={3}
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            placeholder="What did they do well?"
            className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="improvements" className="text-sm font-medium">
            Improvements
          </label>
          <textarea
            id="improvements"
            required
            rows={3}
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            placeholder="What could be better?"
            className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="resourceLinks" className="text-sm font-medium">
            Resource links (optional)
          </label>
          <input
            id="resourceLinks"
            value={resourceLinks}
            onChange={(e) => setResourceLinks(e.target.value)}
          placeholder="https://example.com, https://another-example.com"
            className="rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit review"}
        </Button>
      </form>
    </div>
  );
}
