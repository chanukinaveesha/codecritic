"use client";

import { CodeEditor } from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function NewSubmissionPage(){
    const router = useRouter();
    const {getToken} = useAuth();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [techTags, setTechTags] = useState("");
    const [criteria, setCriteria] = useState([""]);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [codeSnippet, setCodeSnippet] = useState("");
    const [codeLanguage, setCodeLanguage] = useState("");

    function updateCriterion(index: number, value: string) {
    setCriteria((prev) => prev.map((c, i) => (i === index ? value : c)));
  }

  function addCriterion() {
    setCriteria((prev) => (prev.length>=5 ? prev : [...prev,""]));
  }

  function removeCriterion(index: number) {
    setCriteria((prev) => (prev.length<=1 ? prev: prev.filter((_,i) => i !== index)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const token = await getToken();

    const body = {
        title,
        description,
        githubUrl,
        techTags: techTags.split(",").map((t) => t.trim()).filter(Boolean),
        codeSnippet: codeSnippet.trim() || undefined,
        codeLanguage: codeLanguage || undefined,
        criteria: criteria.map((label) => label.trim()).filter(Boolean).map((label)=>({label})),
    };

    const res = await fetch(`${BACKEND_URL}/submissions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });

    setIsSubmitting(false);

    if(!res.ok){
        const data = await res.json().catch(() => null);
        setError(
            data?.error?.fieldErrors
            ? Object.entries(data.error).map(([field, message]) => `${field}: ${message}`).join(", ")
            : "Failed to create submission"
        );
        return;
    }

    const created = await res.json();
    router.push(`/submissions/${created.id}`);
  }

    return (
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">New submission</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="text-sm font-medium">Title</label>
          <input
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm bg-transparent border-input"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm font-medium">Description</label>
          <textarea
            id="description"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm bg-transparent border-input"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="githubUrl" className="text-sm font-medium">GitHub URL</label>
          <input
            id="githubUrl"
            type="url"
            required
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="rounded-md border border-input px-3 py-2 text-sm bg-transparent"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="techTags" className="text-sm font-medium">Tech tags (comma-separated)</label>
          <input
            id="techTags"
            value={techTags}
            onChange={(e) => setTechTags(e.target.value)}
            placeholder="typescript, node"
            className="rounded-md border border-input px-3 py-2 text-sm bg-transparent"
          />
        </div>

        <div className="flex flex-col gap-1">
            <label htmlFor="codeLanguage" className="text-sm font-medium">
                Code language (optional)
            </label>
            <select
                id="codeLanguage"
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground"
            >
                <option value="">None</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="sql">SQL</option>
                <option value="bash">Bash</option>
                <option value="json">JSON</option>
            </select>
            </div>
            
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Code snippet (optional)</label>
                <CodeEditor value={codeSnippet} onChange={setCodeSnippet} language={codeLanguage} />
            </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Review criteria (1–5)</span>
          {criteria.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input
                required
                value={c}
                onChange={(e) => updateCriterion(i, e.target.value)}
                placeholder={`Criterion ${i + 1}`}
                className="flex-1 rounded-md border border-input px-3 py-2 text-sm bg-transparent"
              />
              <Button type="button" variant="ghost" onClick={() => removeCriterion(i)} disabled={criteria.length <= 1}>
                Remove
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addCriterion} disabled={criteria.length >= 5}>
            Add criterion
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Create submission"}
        </Button>
      </form>
    </div>
  );
    }
