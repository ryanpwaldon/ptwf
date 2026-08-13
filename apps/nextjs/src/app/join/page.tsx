"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { useSessionMutation } from "convex-helpers/react/sessions";
import { ConvexError } from "convex/values";
import { z } from "zod";

import { api, gameCodeZodSchema } from "@acme/convex";
import { Field, FieldError, FieldLabel } from "@acme/ui/field";
import { Input } from "@acme/ui/input";

import { AppShell, PageContainer } from "~/components/app-shell";
import { LoadingButton } from "~/components/loading-button";
import { PageHeader } from "~/components/page-header";

export default function JoinPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const joinGame = useSessionMutation(api.players.join);

  const form = useForm({
    defaultValues: { code: "" },
    validators: { onSubmit: z.object({ code: gameCodeZodSchema }) },
    onSubmit: async ({ value }) => {
      try {
        await joinGame({ code: value.code });
        router.push(`/game/${value.code}`);
      } catch (err) {
        setServerError(
          err instanceof ConvexError
            ? String(err.data)
            : "Failed to join game.",
        );
      }
    },
  });

  return (
    <AppShell>
      <PageHeader title="Join game" />
      <PageContainer className="flex flex-1 flex-col">
        <main className="flex-1 px-4">
          <div className="mt-8 space-y-1">
            <h1 className="text-[1.75rem] leading-8 font-bold tracking-tight">
              Join a game
            </h1>
            <p className="text-muted-foreground">
              Enter the code your friend shared.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit();
            }}
            className="mt-6 flex w-full flex-col gap-2"
          >
            <form.Field name="code">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const hasError = isInvalid || !!serverError;
                return (
                  <Field data-invalid={hasError || undefined}>
                    <FieldLabel className="sr-only">Game code</FieldLabel>
                    <div className="flex w-full items-center gap-2">
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder="Enter your code"
                        aria-invalid={hasError || undefined}
                        className="bg-card h-12 font-mono text-base! uppercase placeholder:normal-case"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                          setServerError(null);
                        }}
                      />
                      <form.Subscribe selector={(s) => s.isSubmitting}>
                        {(isSubmitting) => (
                          <LoadingButton
                            size="xl"
                            type="submit"
                            isLoading={isSubmitting}
                            className="disabled:opacity-100"
                          >
                            Join
                          </LoadingButton>
                        )}
                      </form.Subscribe>
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                    {!isInvalid && serverError && (
                      <FieldError>{serverError}</FieldError>
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </form>
        </main>
      </PageContainer>
    </AppShell>
  );
}
