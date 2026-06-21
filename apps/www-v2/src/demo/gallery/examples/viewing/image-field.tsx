import { RecordContextProvider } from "shadmin-core";
import { ImageField } from "shadmin/components/admin";

export default function ImageFieldExample() {
  return (
    <RecordContextProvider
      value={{
        id: 1,
        avatar: { src: "https://i.pravatar.cc/150?img=1", title: "Jane Doe" },
      }}
    >
      <ImageField source="avatar" src="src" title="title" />
    </RecordContextProvider>
  );
}
