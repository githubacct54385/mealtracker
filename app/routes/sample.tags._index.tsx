import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { getAllTagsByUser } from "~/models/meal.server";

export const loader = async () => {
  const tags = await getAllTagsByUser("userId");

  return json(tags);
};
export default function TagsIndex() {
  const tags = useLoaderData<typeof loader>();
  return (
    <main className="mx-auto max-w-4xl">
      <Link to="/Sample">Meals</Link>

      <div className="my-6 border-b-2 text-center text-3xl">
        <p>Tags</p>
        <p>
          <Link to="/sample/tags/create">Create Tag</Link>
        </p>
      </div>
      <section>
        <h2>My Tags</h2>
        {tags?.length === 0 && (
          <div>
            <p>No tags please add one</p>
          </div>
        )}
        <ul style={{ listStyle: "none" }}>
          {tags?.map((t) => (
            <li key={t.id} style={{ border: "1px solid black" }}>
              <p>{t.tagName}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
