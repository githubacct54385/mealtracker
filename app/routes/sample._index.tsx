import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { getMealsForDay } from "~/models/meal.server";

export const loader = async () => {
  let now = new Date();
  console.log("now: ", now);

  // get UTC date
  let dateInUTC = new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds()
  );
  console.log("dateInUTC: ", dateInUTC);
  const meals = await getMealsForDay("userId", now);

  return json(meals);
};
export default function SampleIndex() {
  const meals = useLoaderData<typeof loader>();
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">
        <p>Sample Root</p>
        <p>
          <Link to="/sample/create">Create Meal</Link>
        </p>
        <p>
          <Link to="/sample/tags">Show Tags</Link>
        </p>
      </h1>
      <section>
        <h2>My Meals Today</h2>
        {meals?.length === 0 && (
          <div>
            <p>No meals please add one</p>
          </div>
        )}
        <ul style={{ listStyle: "none" }}>
          {meals?.map((m) => (
            <li key={m.id} style={{ border: "1px solid black" }}>
              <Link to={`/sample/${m.id}`}>{m.mealName}</Link>
              <p>{m.mealType[0] + m.mealType.substring(1).toLowerCase()}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
