import type { Meal } from "@prisma/client";
import { prisma } from "../db";

export async function getMealsForDay(
  userId: string,
  date: Date
): Promise<Meal[]> {
  const meals = await prisma.meal.findMany({
    take: 100,
    where: {
      userId: userId,
      isDeleted: false,
      year: date.getUTCFullYear(),
      month: date.getUTCMonth(),
      day: date.getUTCDate(),
    },
  });
  return meals;
}

export async function getMealById(mealId: string) {
  return await prisma.meal.findUnique({
    where: {
      id: mealId,
    },
    select: {
      id: true,
      calories: true,
      mealName: true,
      mealType: true,
      mealTags: {
        select: {
          tag: {
            select: {
              id: true,
              tagName: true,
            },
          },
        },
      },
    },
  });
}

export async function deleteMealById(mealId: string) {
  await prisma.meal.update({
    where: {
      id: mealId,
    },
    data: {
      isDeleted: true,
    },
  });
}

export async function getAllTagsByUser(userId: string) {
  return await prisma.tag.findMany({
    take: 1000,
    where: {
      userId: userId,
    },
    select: {
      id: true,
      tagName: true,
    },
  });
}
