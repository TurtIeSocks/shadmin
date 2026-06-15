import { z } from "zod";
import { Image as ImageIcon } from "lucide-react";
import {
  defineBlock,
  type BlockRenderProps,
  type BlockConfigProps,
} from "../define-block";
import { BlockEmpty } from "./block-states";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

const schema = z.object({
  src: z.string().default(""),
  alt: z.string().default(""),
  widthPct: z.number().min(10).max(100).default(100),
});
type ImageAttrs = z.infer<typeof schema>;

function ImageRender({ attrs }: BlockRenderProps<ImageAttrs>) {
  if (!attrs.src)
    return (
      <BlockEmpty label="Add an image (configure to upload or paste a URL)" />
    );
  return (
    <div className="flex justify-center">
      <img
        src={attrs.src}
        alt={attrs.alt}
        style={{ width: `${attrs.widthPct}%` }}
        className="h-auto rounded-md"
      />
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function ImageConfig({ attrs, onChange }: BlockConfigProps<ImageAttrs>) {
  return (
    <div className="flex w-56 flex-col gap-3 p-1">
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Upload</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) onChange({ src: await readFileAsDataUrl(file) });
          }}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Image URL</Label>
        <Input
          value={attrs.src.startsWith("data:") ? "" : attrs.src}
          placeholder="https://…"
          onChange={(e) => onChange({ src: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Alt text</Label>
        <Input
          value={attrs.alt}
          onChange={(e) => onChange({ alt: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Width: {attrs.widthPct}%</Label>
        <Slider
          min={10}
          max={100}
          step={5}
          value={[attrs.widthPct]}
          onValueChange={([v]) => onChange({ widthPct: v })}
        />
      </div>
    </div>
  );
}

export const imageBlock = defineBlock<ImageAttrs>({
  name: "image",
  label: "Image",
  group: "media",
  icon: ImageIcon,
  keywords: ["picture", "photo", "img"],
  description: "An image (upload or URL)",
  schema,
  config: ImageConfig,
  render: ImageRender,
});
