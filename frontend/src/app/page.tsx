"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCounterStore } from "@/store/useCounterStore";

export default function Home() {
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Frontend scaffold</CardTitle>
          <CardDescription>
            Next.js + Tailwind + Shadcn/UI + Zustand
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-semibold tabular-nums">{count}</p>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={decrement}>
            -
          </Button>
          <Button onClick={increment}>+</Button>
          <Button variant="ghost" onClick={reset}>
            Reset
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
