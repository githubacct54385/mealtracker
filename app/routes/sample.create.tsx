import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import type { ActionArgs } from "@remix-run/node";
import type { MealType } from "@prisma/client";
import { redirect, json } from "@remix-run/node";
import { prisma } from "~/db";
import { z } from "zod";
import { Link } from "@remix-run/react";
import { getAllTagsByUser } from "~/models/meal.server";
import { useState } from "react";

type FormInput = "date" | "mealName" | "mealType" | "calories" | "tags";

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const mealSchema = z.object({
    date: z.date(),
    mealName: z
      .string()
      .min(2)
      .max(255)
      .refine((value) => /[a-zA-Z]/.test(value), {
        message: "Must contain at least one alphabetical character.",
      }),
    mealType: z.string().refine(
      (value) => {
        return (
          value === "BREAKFAST" ||
          value === "BRUNCH" ||
          value === "LUNCH" ||
          value === "DINNER" ||
          value === "SNACK" ||
          value === "SUPPER"
        );
      },
      { message: "Must be a valid select option." }
    ),
    calories: z.number().min(1).max(10000).optional(),
    tags: z.array(
      z.object({
        id: z.string(),
        tagName: z.string(),
      })
    ),
  });

  const newMeal = mealSchema.safeParse({
    date: new Date(formData.get("date")?.toString() || ""),
    mealName: formData.get("mealName")?.toString(),
    mealType: formData.get("mealType")?.toString(),
    calories:
      formData.get("calories") && formData.get("calories")?.toString() !== ""
        ? parseInt(formData.get("calories")?.toString() || "")
        : undefined,
    tags:
      formData.get("tags") && formData.get("tags")?.toString() !== ""
        ? JSON.parse(formData.get("tags")?.toString() || "")
        : undefined,
  });
  if (!newMeal.success) {
    const mappedErrors = newMeal.error.errors.map((err) => {
      return {
        path: err.path[0] as FormInput,
        message: err.message,
      };
    });
    return json(mappedErrors);
  }

  await prisma.meal.create({
    data: {
      year: newMeal.data.date.getFullYear(),
      day: newMeal.data.date.getDate(),
      month: newMeal.data.date.getMonth(),
      mealName: newMeal.data.mealName,
      mealType: newMeal.data.mealType as MealType,
      userId: "userId",
      dayOfWeek: newMeal.data.date.getDay(),
      calories: newMeal.data.calories,
      mealTags: {
        createMany: {
          data: newMeal.data.tags.map((p) => {
            return {
              tagId: p.id,
            };
          }),
        },
      },
    },
  });

  return redirect("/sample");
};

export const loader = async () => {
  const tags = await getAllTagsByUser("userId");

  return json(tags);
};

export default function CreateMeal() {
  const tags = useLoaderData<typeof loader>();
  const mappedErrors = useActionData<typeof action>();
  const navigation = useNavigation();
  const isCreating = Boolean(navigation.state === "submitting");

  const [assignedTags, setAssignedTags] = useState<
    { id: string; tagName: string }[]
  >([]);

  function handleClickTag(tag: { id: string; tagName: string }) {
    if (!assignedTags.some((p) => p.id === tag.id)) {
      setAssignedTags([...assignedTags, { id: tag.id, tagName: tag.tagName }]);
    } else {
      setAssignedTags(assignedTags.filter((p) => p.id !== tag.id));
    }
  }

  return (
    <div>
      <Link to="/Sample">Meals</Link>
      <Form method="POST">
        <div style={{ margin: "1rem" }}>
          <label htmlFor="date">
            Date:
            {mappedErrors?.some((x) => x.path === "date") && (
              <FormError mappedErrors={mappedErrors} path="date" />
            )}
            <input name="date" type="date" required={true} />
          </label>
        </div>
        <div style={{ margin: "1rem" }}>
          <label htmlFor="mealName">
            Meal Name:
            {mappedErrors?.some((x) => x.path === "mealName") && (
              <FormError mappedErrors={mappedErrors} path="mealName" />
            )}
            <input
              name="mealName"
              type="text"
              min={2}
              max={255}
              required={true}
            />
          </label>
        </div>
        <div style={{ margin: "1rem" }}>
          <label htmlFor="mealType">
            Meal Type:
            {mappedErrors?.some((x) => x.path === "mealType") && (
              <FormError mappedErrors={mappedErrors} path="mealType" />
            )}
            <select name="mealType" required={true}>
              <option value="BREAKFAST">Breakfast</option>
              <option value="BRUNCH">Brunch</option>
              <option value="LUNCH">Lunch</option>
              <option value="DINNER">Dinner</option>
              <option value="SNACK">Snack</option>
              <option value="SUPPER">Supper</option>
            </select>
          </label>
        </div>
        <div style={{ margin: "1rem" }}>
          <label htmlFor="calories">
            Calories:
            {mappedErrors?.some((x) => x.path === "calories") && (
              <FormError mappedErrors={mappedErrors} path="calories" />
            )}
            <input
              name="calories"
              type="number"
              min={0}
              max={10000}
              required={false}
            />
          </label>
        </div>
        <div style={{ margin: "1rem" }}>
          <label htmlFor="tags">
            Tags:
            {mappedErrors?.some((x) => x.path === "tags") && (
              <FormError mappedErrors={mappedErrors} path="tags" />
            )}
            <br />
            <TagsCollection
              tags={tags}
              assignedTags={assignedTags}
              onClickTag={handleClickTag}
            />
          </label>
        </div>
        <div style={{ margin: "1rem" }}>
          <button type="submit" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Meal"}
          </button>
        </div>
      </Form>
    </div>
  );
}

function TagsCollection(props: {
  tags: { id: string; tagName: string }[];
  assignedTags: { id: string; tagName: string }[];
  onClickTag: (tag: { id: string; tagName: string }) => void;
}) {
  if (!props.tags || props.tags.length === 0) {
    return <div>No tags available</div>;
  }

  const unassignedTags = props.tags.filter(
    (p) => !props.assignedTags.map((x) => x.id).includes(p.id)
  );

  return (
    <div>
      <input
        type="hidden"
        value={JSON.stringify(props.assignedTags)}
        name="tags"
        required={false}
      />
      <p>Unassigned Tags</p>
      <ul style={{ listStyle: "none" }}>
        {unassignedTags.map((tag) => (
          <li key={tag.id}>
            <button onClick={() => props.onClickTag(tag)}>{tag.tagName}</button>
          </li>
        ))}
      </ul>
      <p>Assigned Tags</p>
      <ul style={{ listStyle: "none" }}>
        {props.assignedTags.map((tag) => (
          <li key={tag.id}>
            <button onClick={() => props.onClickTag(tag)}>{tag.tagName}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FormError(props: {
  mappedErrors: { path: FormInput; message: string }[];
  path: FormInput;
}) {
  return (
    <em className="text-red-600">
      {props.mappedErrors.find((p) => p.path === props.path)?.message}
    </em>
  );
}
