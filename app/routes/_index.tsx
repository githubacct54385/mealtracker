import type { V2_MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "My Meal Tracker" },
    { name: "description", content: "Track your daily meals" },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to My Meal Tracker</h1>
      <Link to="/Sample">Sample</Link>
    </div>
  );
}
