import { getDb } from "../db";
import {
  speciesTemplates,
  breeds,
} from "../../drizzle/schema";

/**
 * Ghana-specific livestock seed data
 * Includes cattle, poultry, goats, sheep, pigs, and rabbits
 * with breeds and characteristics suitable for Ghana's climate
 */

export async function seedGhanaLivestock() {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  console.log("🌍 Seeding Ghana-specific livestock data...");

  // Species Templates for Ghana
  const ghanaSpecies = [
    {
      speciesName: "Cattle",
      commonNames: "Cow, Bull, Beef cattle, Dairy cattle",
      description: "Beef and dairy cattle suitable for Ghana",
      icon: "🐄",
      averageLifespanYears: 15,
      matureWeightKg: "500",
      productionType: "Meat, Milk",
      gestationPeriodDays: 280,
      averageLitterSize: 1,
      sexualMaturityMonths: 12,
      isActive: true,
    },
    {
      speciesName: "Poultry",
      commonNames: "Chicken, Hen, Rooster, Broiler, Layer",
      description: "Chickens and other poultry for meat and egg production",
      icon: "🐔",
      averageLifespanYears: 5,
      matureWeightKg: "2",
      productionType: "Meat, Eggs",
      gestationPeriodDays: 21,
      averageLitterSize: 12,
      sexualMaturityMonths: 5,
      isActive: true,
    },
    {
      speciesName: "Goat",
      commonNames: "Goat, Billy, Doe, Kid",
      description: "Goats for meat and milk production",
      icon: "🐐",
      averageLifespanYears: 12,
      matureWeightKg: "50",
      productionType: "Meat, Milk",
      gestationPeriodDays: 150,
      averageLitterSize: 2,
      sexualMaturityMonths: 8,
      isActive: true,
    },
    {
      speciesName: "Sheep",
      commonNames: "Sheep, Ram, Ewe, Lamb",
      description: "Sheep for meat and wool production",
      icon: "🐑",
      averageLifespanYears: 10,
      matureWeightKg: "60",
      productionType: "Meat, Wool",
      gestationPeriodDays: 145,
      averageLitterSize: 1,
      sexualMaturityMonths: 6,
      isActive: true,
    },
    {
      speciesName: "Pig",
      commonNames: "Pig, Hog, Sow, Boar, Piglet",
      description: "Pigs for meat production",
      icon: "🐷",
      averageLifespanYears: 15,
      matureWeightKg: "100",
      productionType: "Meat",
      gestationPeriodDays: 114,
      averageLitterSize: 8,
      sexualMaturityMonths: 5,
      isActive: true,
    },
    {
      speciesName: "Rabbit",
      commonNames: "Rabbit, Bunny, Buck, Doe",
      description: "Rabbits for meat and fur production",
      icon: "🐰",
      averageLifespanYears: 8,
      matureWeightKg: "4",
      productionType: "Meat, Fur",
      gestationPeriodDays: 31,
      averageLitterSize: 6,
      sexualMaturityMonths: 3,
      isActive: true,
    },
  ];

  // Insert species
  await db.insert(speciesTemplates).values(ghanaSpecies);
  console.log(`✅ Inserted ${ghanaSpecies.length} species templates`);

  // Ghana-specific breeds with hardcoded speciesId (will be 1-6 for the 6 species)
  const ghanaBreeds = [
    // Cattle breeds (speciesId: 1)
    {
      speciesId: 1,
      breedName: "Sokoto Gudali",
      origin: "Ghana/Nigeria",
      characteristics: JSON.stringify({
        type: "Beef",
        weight: "400-600 kg",
        temperament: "Docile",
        adaptation: "Excellent for hot climate",
      }),
      description: "Large, hardy cattle breed well-adapted to West African climate",
      rarity: "common" as const,
    },
    {
      speciesId: 1,
      breedName: "NDama",
      origin: "Ghana/West Africa",
      characteristics: JSON.stringify({
        type: "Beef/Dairy",
        weight: "300-400 kg",
        temperament: "Calm",
        adaptation: "Trypanotolerant (resistant to sleeping sickness)",
      }),
      description: "Small but hardy cattle, resistant to trypanosomiasis",
      rarity: "common" as const,
    },
    {
      speciesId: 1,
      breedName: "Friesian",
      origin: "Imported",
      characteristics: JSON.stringify({
        type: "Dairy",
        weight: "500-700 kg",
        temperament: "Docile",
        adaptation: "Requires good management in hot climate",
      }),
      description: "High-producing dairy cattle, needs better management in Ghana",
      rarity: "uncommon" as const,
    },
    {
      speciesId: 1,
      breedName: "Jersey",
      origin: "Imported",
      characteristics: JSON.stringify({
        type: "Dairy",
        weight: "300-450 kg",
        temperament: "Calm",
        adaptation: "Better heat tolerance than Friesian",
      }),
      description: "Small dairy cattle with good butterfat content",
      rarity: "uncommon" as const,
    },

    // Poultry breeds (speciesId: 2)
    {
      speciesId: 2,
      breedName: "Ghanaian Local Chicken",
      origin: "Ghana",
      characteristics: JSON.stringify({
        type: "Meat/Egg",
        weight: "1.5-2 kg",
        temperament: "Hardy",
        adaptation: "Excellent for free-range",
      }),
      description: "Native chicken breed, hardy and disease-resistant",
      rarity: "common" as const,
    },
    {
      speciesId: 2,
      breedName: "Broiler",
      origin: "Imported",
      characteristics: JSON.stringify({
        type: "Meat",
        weight: "2-2.5 kg (8 weeks)",
        temperament: "Docile",
        adaptation: "Requires good housing and management",
      }),
      description: "Fast-growing meat chicken, ready for market in 8 weeks",
      rarity: "common" as const,
    },
    {
      speciesId: 2,
      breedName: "Layer",
      origin: "Imported",
      characteristics: JSON.stringify({
        type: "Egg",
        weight: "1.8-2.2 kg",
        temperament: "Active",
        adaptation: "Needs proper housing",
      }),
      description: "High-producing egg-laying chicken",
      rarity: "common" as const,
    },
    {
      speciesId: 2,
      breedName: "Guinea Fowl",
      origin: "Ghana/Africa",
      characteristics: JSON.stringify({
        type: "Meat/Pest control",
        weight: "1.5-2 kg",
        temperament: "Aggressive",
        adaptation: "Excellent for free-range",
      }),
      description: "Hardy bird for meat and pest control, requires minimal input",
      rarity: "common" as const,
    },

    // Goat breeds (speciesId: 3)
    {
      speciesId: 3,
      breedName: "West African Dwarf Goat",
      origin: "Ghana/West Africa",
      characteristics: JSON.stringify({
        type: "Meat/Milk",
        weight: "20-30 kg",
        temperament: "Active",
        adaptation: "Excellent for hot climate",
      }),
      description: "Small, hardy goat well-suited to Ghana's environment",
      rarity: "common" as const,
    },
    {
      speciesId: 3,
      breedName: "Saanen",
      origin: "Imported",
      characteristics: JSON.stringify({
        type: "Dairy",
        weight: "50-80 kg",
        temperament: "Docile",
        adaptation: "Needs shade and good management",
      }),
      description: "High-producing dairy goat, requires better management",
      rarity: "uncommon" as const,
    },
    {
      speciesId: 3,
      breedName: "Boer Goat",
      origin: "Imported",
      characteristics: JSON.stringify({
        type: "Meat",
        weight: "60-100 kg",
        temperament: "Calm",
        adaptation: "Good meat quality",
      }),
      description: "Meat breed with good carcass quality",
      rarity: "uncommon" as const,
    },

    // Sheep breeds (speciesId: 4)
    {
      speciesId: 4,
      breedName: "West African Dwarf Sheep",
      origin: "Ghana/West Africa",
      characteristics: JSON.stringify({
        type: "Meat",
        weight: "20-30 kg",
        temperament: "Docile",
        adaptation: "Excellent for hot climate",
      }),
      description: "Small, hardy sheep suited to Ghana's climate",
      rarity: "common" as const,
    },
    {
      speciesId: 4,
      breedName: "Ashanti Sheep",
      origin: "Ghana",
      characteristics: JSON.stringify({
        type: "Meat",
        weight: "25-35 kg",
        temperament: "Calm",
        adaptation: "Well-adapted to local conditions",
      }),
      description: "Local Ghanaian sheep breed with good meat quality",
      rarity: "common" as const,
    },

    // Pig breeds (speciesId: 5)
    {
      speciesId: 5,
      breedName: "Local Pig",
      origin: "Ghana",
      characteristics: JSON.stringify({
        type: "Meat",
        weight: "50-100 kg",
        temperament: "Hardy",
        adaptation: "Excellent for local conditions",
      }),
      description: "Native pig breed, hardy and disease-resistant",
      rarity: "common" as const,
    },
    {
      speciesId: 5,
      breedName: "Large Black Pig",
      origin: "Imported",
      characteristics: JSON.stringify({
        type: "Meat",
        weight: "100-150 kg",
        temperament: "Docile",
        adaptation: "Good meat quality",
      }),
      description: "Large meat pig breed with good carcass quality",
      rarity: "uncommon" as const,
    },

    // Rabbit breeds (speciesId: 6)
    {
      speciesId: 6,
      breedName: "Flemish Giant",
      origin: "Imported",
      characteristics: JSON.stringify({
        type: "Meat",
        weight: "5-7 kg",
        temperament: "Docile",
        adaptation: "Needs cooling in Ghana",
      }),
      description: "Large rabbit breed for meat production",
      rarity: "uncommon" as const,
    },
    {
      speciesId: 6,
      breedName: "New Zealand White",
      origin: "Imported",
      characteristics: JSON.stringify({
        type: "Meat/Fur",
        weight: "4-5 kg",
        temperament: "Calm",
        adaptation: "Good heat tolerance",
      }),
      description: "Popular meat rabbit breed with good productivity",
      rarity: "common" as const,
    },
  ];

  // Insert breeds
  await db.insert(breeds).values(ghanaBreeds);
  console.log(`✅ Inserted ${ghanaBreeds.length} Ghana-specific breeds`);

  console.log("🎉 Ghana livestock seed data population complete!");
  return { speciesCount: ghanaSpecies.length, breedCount: ghanaBreeds.length };
}
