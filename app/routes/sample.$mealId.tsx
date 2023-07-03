import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  useParams,
} from "@remix-run/react";
import { getMealById, deleteMealById } from "~/models/meal.server";

export const loader = async ({ params }: LoaderArgs) => {
  if (!params.mealId) {
    return redirect("/sample");
  }
  const meal = await getMealById(params.mealId);
  return json({ meal });
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const mealId = formData.get("mealId");
  if (!mealId || mealId.toString() === "") {
    return json({
      meal: "MealId is not defined please refresh the page and try again",
    });
  }
  await deleteMealById(mealId.toString());
  return redirect("/sample");
};

export default function ShowSingleMeal() {
  const { meal } = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();
  const params = useParams();
  const navigation = useNavigation();
  const isDeleting = Boolean(navigation.state === "submitting");

  return (
    <main className="mx-auto max-w-4xl">
      <Link to="/sample">Meals</Link>
      <h1 className="my-6 border-b-2 text-center text-3xl">
        Meal Name: {meal?.mealName}
      </h1>
      <p>Calories: {meal?.calories || "Not available"}</p>
      <p>Meal Type: {meal?.mealType}</p>
      <ul>
        {meal?.mealTags.map((m) => (
          <li key={m.tag.id}>{m.tag.tagName}</li>
        ))}
      </ul>
      <div>
        <Form method="DELETE">
          {errors?.meal && <em className="text-red-600">{errors.meal}</em>}
          <input type="hidden" name="mealId" value={params.mealId} />
          <button>{isDeleting ? "Deleting..." : "Delete"}</button>
        </Form>
      </div>
    </main>
  );
}
