import { useState } from "react";
import { Form, useLogin } from "shadmin-core";
import type { SubmitHandler, FieldValues } from "react-hook-form";
import { useNavigate } from "react-router";
import { Button } from "shadmin/components/ui/button";
import { TextInput } from "shadmin/components/admin/inputs/text-input";

export default function DemoLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useLogin();
  const navigate = useNavigate();

  const handleSubmit: SubmitHandler<FieldValues> = (values) => {
    setLoading(true);
    setError(null);
    login(values)
      .then(() => {
        setLoading(false);
        navigate("/demo/app");
      })
      .catch((err: unknown) => {
        setLoading(false);
        setError(err instanceof Error ? err.message : "Login failed");
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Demo Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Prefilled — just click Sign in.
          </p>
        </div>

        <Form
          defaultValues={{ username: "demo", password: "demo" }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <TextInput
            label="Username"
            source="username"
            autoComplete="username"
          />
          <TextInput
            label="Password"
            source="password"
            type="password"
            autoComplete="current-password"
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </Form>
      </div>
    </div>
  );
}
