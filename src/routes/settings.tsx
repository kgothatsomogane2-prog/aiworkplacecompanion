import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ResponsibleAi } from "@/components/responsible-ai";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/stores/theme";
import { useActivityStore } from "@/stores/activity";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Workly AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, set } = useThemeStore();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Settings"
        description="Preferences and about."
        icon={<SettingsIcon className="h-5 w-5" />}
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div>
            <div className="font-medium">Appearance</div>
            <p className="text-sm text-muted-foreground">Choose your theme.</p>
          </div>
          <div className="flex gap-2">
            <Button variant={theme === "light" ? "default" : "outline"} onClick={() => set("light")}>Light</Button>
            <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => set("dark")}>Dark</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div>
            <div className="font-medium">Session data</div>
            <p className="text-sm text-muted-foreground">
              Workly AI doesn't persist your data. Activity is in-memory and clears on refresh.
            </p>
          </div>
          <Button variant="outline" onClick={() => useActivityStore.getState().clear()}>
            Clear activity now
          </Button>
        </CardContent>
      </Card>

      <ResponsibleAi />
    </div>
  );
}
