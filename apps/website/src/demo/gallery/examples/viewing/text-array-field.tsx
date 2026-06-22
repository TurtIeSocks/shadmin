import { RecordContextProvider } from "shadmin-core";
import { TextArrayField } from "shadmin/components/admin";

export default function TextArrayFieldExample() {
  return (
    <RecordContextProvider
      value={{ id: 1, skills: ["React", "TypeScript", "Node.js"] }}
    >
      <TextArrayField source="skills" />
    </RecordContextProvider>
  );
}
