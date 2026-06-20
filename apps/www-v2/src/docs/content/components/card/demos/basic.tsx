import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "shadmin/components/ui/card";

export default function CardBasicDemo() {
  return (
    <Card className="w-72">
      <CardHeader>
        <CardTitle>shadmin Card</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Compose header, content, and footer slots to build any card layout.
        </p>
      </CardContent>
    </Card>
  );
}
