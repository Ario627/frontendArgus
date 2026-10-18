import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isApiError } from "@/api/api-error";
import { Button } from "@/shared/components/ui/button";
import { Field } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { useLogin } from "@/features/auth/hooks/use-login";
import { loginSchema, type LoginPayload } from "@/features/auth/schemas/login.schema";

const RATE_LIMITED_MESSAGE = "Terlalu banyak percobaan masuk. Tunggu sebentar, lalu coba lagi.";

function messageForLoginError(error: unknown): string {
  if (!isApiError(error)) return "Tidak dapat masuk saat ini. Coba lagi.";
  if (error.code === "RATE_LIMITED") return RATE_LIMITED_MESSAGE;
  return error.message;
}

export interface LoginFormProps {
  readonly onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const mutation = useLogin();

  const form = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { username: "", password: "" }
  });

  const submit = form.handleSubmit((payload) => {
    setFormError(null);
    mutation.mutate(payload, {
      onSuccess: () => {
        onSuccess();
      },
      onError: (error) => {
        setFormError(messageForLoginError(error));
      }
    });
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {formError === null ? null : (
        <p
          role="alert"
          className="rounded-kontainer border border-bata/40 bg-bata/5 px-3 py-2 text-sm text-bata"
        >
          {formError}
        </p>
      )}
      <Field label="Nama pengguna" required error={form.formState.errors.username?.message}>
        {(control) => (
          <Input
            id={control.id}
            aria-describedby={control.describedBy}
            invalid={control.invalid}
            required={control.required}
            inputSize="field"
            autoComplete="username"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            {...form.register("username")}
          />
        )}
      </Field>
      <Field label="Kata sandi" required error={form.formState.errors.password?.message}>
        {(control) => (
          <Input
            id={control.id}
            aria-describedby={control.describedBy}
            invalid={control.invalid}
            required={control.required}
            inputSize="field"
            type="password"
            autoComplete="current-password"
            enterKeyHint="go"
            {...form.register("password")}
          />
        )}
      </Field>
      <Button type="submit" size="lg" fullWidth loading={mutation.isPending}>
        Masuk
      </Button>
    </form>
  );
}