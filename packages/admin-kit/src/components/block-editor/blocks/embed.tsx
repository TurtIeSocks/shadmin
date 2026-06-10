import { z } from "zod";
import { Video } from "lucide-react";
import { defineBlock, type BlockRenderProps } from "../define-block";
import { BlockEmpty } from "./block-states";

const schema = z.object({ url: z.string().default("") });
type EmbedAttrs = z.infer<typeof schema>;

const YT_ID = /^[\w-]{11}$/;
const VIMEO_ID = /^\d+$/;

/**
 * Map a user URL to a known-safe provider embed src, or null if not allowlisted.
 * Never returns a URL derived from raw user input — only constructed from a
 * strictly-validated video id, so the result can be trusted as an iframe src.
 */
export function toEmbedSrc(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = parsed.searchParams.get("v") ?? "";
    return YT_ID.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "youtu.be") {
    const id = parsed.pathname.slice(1);
    return YT_ID.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "vimeo.com") {
    const id = parsed.pathname.split("/").filter(Boolean)[0] ?? "";
    return VIMEO_ID.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}

function EmbedRender({ attrs }: BlockRenderProps<EmbedAttrs>) {
  if (!attrs.url) return <BlockEmpty label="Paste a YouTube or Vimeo URL (configure)" />;
  const src = toEmbedSrc(attrs.url);
  if (!src) {
    return <BlockEmpty label="Unsupported embed — only YouTube or Vimeo URLs are allowed" />;
  }
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md">
      <iframe
        src={src}
        title="Embedded video"
        className="absolute inset-0 h-full w-full"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    </div>
  );
}

export const embedBlock = defineBlock<EmbedAttrs>({
  name: "embed",
  label: "Embed",
  group: "media",
  icon: Video,
  keywords: ["video", "youtube", "vimeo", "iframe"],
  description: "Embed a YouTube or Vimeo video",
  schema,
  config: "auto", // single `url` string → text input
  render: EmbedRender,
});
