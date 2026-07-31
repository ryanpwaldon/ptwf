import { v } from "convex/values";

export const animalValidator = v.object({
  value: v.string(),
  label: v.string(),
  description: v.string(),
  imagePath: v.string(),
});
