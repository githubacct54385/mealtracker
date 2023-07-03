import { Form, useActionData, useNavigation } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { prisma } from "~/db";
import { z } from "zod";
import { Link } from "@remix-run/react";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  const tagSchema = z.object({
    tagName: z
      .string()
      .min(2)
      .max(255)
      .refine((value) => /[a-zA-Z]/.test(value), {
        message: "Must contain at least one alphabetical character.",
      }),
  });

  const parseResult = tagSchema.safeParse({
    tagName: formData.get("tagName"),
  });
  if (!parseResult.success) {
    return json({
      message: parseResult.error.errors.find((p) => p.path[0] === "tagName")
        ?.message,
    });
  }

  await prisma.tag.create({
    data: {
      tagName: parseResult.data.tagName,
      userId: "userId",
    },
  });
  return redirect("/sample/tags");
};

export default function CreateTag() {
  const errors = useActionData<typeof action>();
  const navigation = useNavigation();
  const isCreating = Boolean(navigation.state === "submitting");

  return (
    <div>
      <Link to="/Sample/tags">Tags</Link>
      <Form method="POST">
        <p>
          <label htmlFor="tagName">
            Tag Name:
            {errors?.message && <FormError message={errors.message} />}
            <input
              name="tagName"
              type="text"
              min={2}
              max={255}
              required={true}
            />
          </label>
        </p>
        <p>
          <button type="submit" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Tag"}
          </button>
        </p>
      </Form>
    </div>
  );
}

function FormError(props: { message: string }) {
  return <em className="text-red-600">{props.message}</em>;
}
