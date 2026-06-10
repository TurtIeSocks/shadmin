---
title: "ImageInput"
---

`<ImageInput>` allows editing and uploading image attachments. It is a thin wrapper around [`<FileInput>`](./file-input) that defaults to accepting only images and renders an `<ImageField>` thumbnail preview by default.

## Usage

```tsx
import { ImageInput, ImageField } from "@/components/admin";

<ImageInput source="pictures" multiple>
  <ImageField source="src" title="title" />
</ImageInput>;
```

`<ImageInput>` uses its child component to give a preview of the images. `<ImageInput>` renders its child once per file, inside a `<RecordContext>`, so the child can be a Field component. When no child is provided, a default `<ImageField>` is used with a thumbnail style.

The input value must be an object or an array of objects with a `title` and a `src` property, e.g.:

```js
{
    id: 123,
    pictures: [
        {
            title: 'photo-1.jpg',
            src: 'https://example.com/uploads/photo-1.jpg',
        },
        {
            title: 'photo-2.jpg',
            src: 'https://example.com/uploads/photo-2.jpg',
        },
    ],
}
```

After modification by the user, the value is stored as an array of objects with 3 properties:

- `title`: the file name with extension, e.g. 'photo-1.jpg'
- `src`: An [object URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL) for the `File`, e.g. 'blob:<https://example.com/1e67e00e-860d-40a5-89ae-6ab0cbee6273>'
- `rawFile`: [The `File` object](https://developer.mozilla.org/fr/docs/Web/API/File) itself

It is the responsibility of your `dataProvider` to send the file to the server (encoded in Base64, or using multipart upload) and to transform the `src` property. See [the Data Provider documentation](https://marmelab.com/ra-core/dataproviders/#handling-file-uploads) for an example.

Files are accepted or rejected based on the `accept`, `multiple`, `minSize` and `maxSize` props. By default, `<ImageInput>` accepts any image MIME type (`{ "image/*": [] }`).

## Props

`<ImageInput>` accepts the same props as [`<FileInput>`](./file-input):

| Prop                  | Required | Type                                    | Default                         | Description                       |
| --------------------- | -------- | --------------------------------------- | ------------------------------- | --------------------------------- |
| `source`              | Required | `string`                                | -                               | Field name                        |
| `accept`              | Optional | `DropzoneOptions['accept']`             | `{ "image/*": [] }`             | MIME / extension accept map       |
| `children`            | Optional | `ReactNode`                             | `<ImageField>`                  | Preview element (single)          |
| `className`           | Optional | `string`                                | -                               | Wrapper classes                   |
| `helperText`          | Optional | `ReactNode`                             | -                               | Help text                         |
| `labelMultiple`       | Optional | `string`                                | `ra.input.image.upload_several` | i18n key for multiple placeholder |
| `labelSingle`         | Optional | `string`                                | `ra.input.image.upload_single`  | i18n key for single placeholder   |
| `maxSize`             | Optional | `number`                                | -                               | Max bytes                         |
| `minSize`             | Optional | `number`                                | -                               | Min bytes                         |
| `multiple`            | Optional | `boolean`                               | `false`                         | Allow multiple files              |
| `onRemove`            | Optional | `(file:any)=>void`                      | -                               | Callback after removing a file    |
| `options`             | Optional | `DropzoneOptions`                       | -                               | Extra dropzone options            |
| `placeholder`         | Optional | `ReactNode`                             | -                               | Custom placeholder content        |
| `validateFileRemoval` | Optional | `(file:any)=>boolean\|Promise<boolean>` | -                               | Throw/cancel to prevent removal   |

## `accept`

By default, `<ImageInput>` accepts any image MIME type. Override this prop to restrict the accepted formats:

```tsx
<ImageInput source="picture" accept={{ "image/png": [], "image/jpeg": [] }}>
  <ImageField source="src" title="title" />
</ImageInput>
```

## `children`

Provide a custom preview element to control how thumbnails are rendered. When omitted, a default `<ImageField>` is used:

```tsx
<ImageInput source="pictures" multiple>
  <ImageField
    source="src"
    title="title"
    className="[&_img]:h-32 [&_img]:w-32 [&_img]:rounded-md [&_img]:object-cover"
  />
</ImageInput>
```

## `multiple`

Set to `true` to accept a list of images, `false` to accept only one. Defaults to `false`.

```tsx
<ImageInput source="pictures" multiple>
  <ImageField source="src" title="title" />
</ImageInput>
```
