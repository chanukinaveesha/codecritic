export interface SubmissionAuthor {
  id: number;
  username: string;
}

export interface SubmissionBase{
    id: number;
    userId: number;
    user: SubmissionAuthor;
    title: string;
    description:string
    githubUrl: string;
    techTags: string[];
    codeSnippet?: string;
    codeLanguage?: string;
    status: "Pending" | "Reviewed";
    createdAt: string;
}

export interface SubmissionSummary extends SubmissionBase{
    _count:{criteria: number; reviews: number}
}

export interface ReviewCriteria{
    id: number;
    submissionId: number,
    label: string;
    order: number|null;
}

export interface CriteriaRating{
    id: number;
    reviewId: number;
    criteriaId: number;
    rating: number;
}

export interface Reviewer{
    id: number;
    username: string;
    karma: number;
}

export interface Review{
    id: number;
    submissionId: number;
    reviewerId: number;
    strengths: string;
    improvements: string;
    resourceLinks: string[];
    createdAt: string;
    reviewer: Reviewer;
    ratings: CriteriaRating[];
}

export interface SubmissionDetail extends SubmissionBase{
    reviews: Review[];
    criteria: ReviewCriteria[];
} 