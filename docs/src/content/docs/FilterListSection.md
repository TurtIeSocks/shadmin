---
title: "FilterListSection"
---

Wrapper that renders a labeled section inside a filter sidebar.

## Usage

`<FilterListSection>` provides the title row used by [`<FilterList>`](./FilterList.md), but can also be used standalone to group custom controls (for example a [`<FilterLiveForm>`](./FilterLiveForm.md)) alongside other filter widgets:

```tsx
import { Card } from "@/components/ui/card";
import { Type } from "lucide-react";
import {
  FilterListSection,
  FilterLiveForm,
  TextInput,
} from "@/components/admin";

export const BookListAside = () => (
  <Card className="p-4">
    <FilterListSection label="Title" icon={<Type className="size-4" />}>
      <FilterLiveForm>
        <TextInput source="title" helperText={false} />
      </FilterLiveForm>
    </FilterListSection>
  </Card>
);
```

## Props

| Prop | Required | Type | Default | Description |
|------|----------|------|---------|-------------|
| `label` | Required | `string` | - | Section header label, translated through the i18n provider |
| `icon` | Optional | `ReactNode` | - | Icon displayed before the label |
| `children` | Required | `ReactNode` | - | Content rendered below the header |
| `className` | Optional | `string` | - | Extra Tailwind classes appended to the root element |
