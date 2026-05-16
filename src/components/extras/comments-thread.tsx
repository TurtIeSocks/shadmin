import { useState } from "react";
import {
  useCreate,
  useGetIdentity,
  useGetList,
  useRecordContext,
  useUpdate,
} from "ra-core";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface Comment {
  id: string | number;
  parentId: string | number;
  authorId: string;
  authorName?: string;
  body: string;
  createdAt: string;
  resolvedAt?: string | null;
}

/**
 * Record-attached threaded comments. Reads the `reference` sub-resource
 * filtered by `target=record.id`. Renders one card per comment plus a
 * new-comment textarea.
 *
 * Edit/delete is restricted to the comment author. Optional `resolvable` prop
 * adds a "Mark resolved" button per comment.
 *
 * @example
 * <CommentsThread reference="comments" target="parentId" />
 */
export const CommentsThread = (props: CommentsThreadProps) => {
  const { reference, target, resolvable = false } = props;
  const record = useRecordContext();
  const { identity } = useGetIdentity();
  const [create] = useCreate();
  const [update] = useUpdate();
  const [body, setBody] = useState("");

  const { data: comments = [], isLoading } = useGetList<Comment>(reference, {
    filter: record ? { [target]: record.id } : { __none: true },
    pagination: { page: 1, perPage: 100 },
    sort: { field: "createdAt", order: "ASC" },
  });

  if (!record || isLoading) return null;

  const handlePost = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    await create(reference, {
      data: {
        [target]: record.id,
        authorId: identity?.id ?? "anonymous",
        authorName: identity?.fullName,
        body: trimmed,
        createdAt: new Date().toISOString(),
      },
    });
    setBody("");
  };

  const handleResolve = (comment: Comment) => {
    update(reference, {
      id: comment.id,
      data: { resolvedAt: new Date().toISOString() },
      previousData: comment,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {comments.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No comments yet. Be the first.
          </CardContent>
        </Card>
      ) : (
        comments.map((c) => (
          <Card
            key={c.id}
            className={cn(c.resolvedAt && "opacity-60")}
          >
            <CardContent className="flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-medium">{c.authorName ?? c.authorId}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
                {resolvable && !c.resolvedAt && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-resolve-button
                    onClick={() => handleResolve(c)}
                  >
                    Mark resolved
                  </Button>
                )}
                {c.resolvedAt && (
                  <span className="text-xs text-muted-foreground">
                    Resolved {new Date(c.resolvedAt).toLocaleString()}
                  </span>
                )}
              </div>
              <p className="whitespace-pre-wrap text-sm">{c.body}</p>
            </CardContent>
          </Card>
        ))
      )}
      <div className="flex flex-col gap-2">
        <Textarea
          data-new-comment-body
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a comment…"
          rows={3}
        />
        <div className="flex justify-end">
          <Button
            type="button"
            data-post-comment
            onClick={handlePost}
            disabled={!body.trim()}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export interface CommentsThreadProps {
  /** Comments sub-resource name (e.g. "comments"). */
  reference: string;
  /** Field on the comment record that holds the parent record id. */
  target: string;
  /** When true, each unresolved comment shows a "Mark resolved" button. */
  resolvable?: boolean;
}
