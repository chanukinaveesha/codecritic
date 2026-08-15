import { ReviewCriteria } from "@/lib/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function ReviewPage() {
  const params = useParams();
  const submissionId = params.id as string;

  const [criteria, setCriteria] = useState<ReviewCriteria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCriteria() {
      const res = await fetch(
        `${BACKEND_URL}/submissions/${submissionId}/criteria`,
      );
      const data = await res.json();
      setCriteria(data);
      setLoading(false);
    }

    loadCriteria();
  }, [submissionId]);

  if (loading) {
    return <p className="p-8 text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Review this submission</h1>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Criteria to rate</span>
        {criteria.map((c) => (
          <div key={c.id} className="text-sm">
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}
