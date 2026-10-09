import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { byCity, DishCard, live, RestaurantRow } from "@/components/interests/Items";
import SectionPage, { Subsection } from "@/components/interests/SectionPage";
import { getSection } from "@/components/interests/sections";
import { dishes, interestIntros, restaurants } from "@/data";

export const metadata: Metadata = { title: "Food | Anthony Lam" };

export default function FoodPage() {
  const section = getSection("food");
  const shownDishes = live(dishes);
  const shownRestaurants = live(restaurants);

  const subsections = [
    shownDishes.length > 0 && { id: "cook", label: "What I cook" },
    shownRestaurants.length > 0 && { id: "eat", label: "Where I eat" },
  ].filter((s) => s !== false);
  if (subsections.length === 0) notFound();

  return (
    <SectionPage section={section} subsections={subsections}>
      {shownDishes.length > 0 && (
        <Subsection id="cook" title="What I cook" intro={interestIntros.cook}>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {shownDishes.map((d) => (
              <DishCard key={d.id} dish={d} />
            ))}
          </ul>
        </Subsection>
      )}

      {shownRestaurants.length > 0 && (
        <Subsection id="eat" title="Where I eat" intro={interestIntros.eat}>
          {byCity(shownRestaurants).map(([city, list]) => (
            <div key={city} className="mt-5">
              <h3 className="font-mono text-xs tracking-wide text-foreground/50 uppercase">
                {city}
              </h3>
              <ul className="mt-1 divide-y divide-foreground/10">
                {list.map((r) => (
                  <RestaurantRow key={r.id} restaurant={r} />
                ))}
              </ul>
            </div>
          ))}
        </Subsection>
      )}
    </SectionPage>
  );
}
