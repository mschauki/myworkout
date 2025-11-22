import { db } from "../server/db";
import { exercises } from "../shared/schema";
import { eq, sql } from "drizzle-orm";

const EQUIPMENT_IMAGE_MAP: Record<string, string> = {
  "barbell": "/attached_assets/stock_images/person_doing_barbell_8c45a914.jpg",
  "dumbbell": "/attached_assets/stock_images/person_doing_dumbbel_24e68ee0.jpg",
  "bodyweight": "/attached_assets/stock_images/person_doing_pull-up_cc123d4e.jpg",
  "cable": "/attached_assets/stock_images/person_using_cable_m_690be52c.jpg",
  "machine": "/attached_assets/stock_images/person_using_leg_pre_ca4f2376.jpg",
};

const EXERCISE_SPECIFIC_IMAGES: Record<string, string> = {
  "barbell squat": "/attached_assets/stock_images/person_doing_squat_e_d3c8c65c.jpg",
  "front squat": "/attached_assets/stock_images/person_doing_squat_e_d3c8c65c.jpg",
  "deadlift": "/attached_assets/stock_images/person_doing_deadlif_6e4b4091.jpg",
  "sumo deadlift": "/attached_assets/stock_images/person_doing_deadlif_6e4b4091.jpg",
  "romanian deadlift": "/attached_assets/stock_images/person_doing_deadlif_6e4b4091.jpg",
  "dumbbell shoulder press": "/attached_assets/stock_images/person_doing_shoulde_08ed6d86.jpg",
  "arnold press": "/attached_assets/stock_images/person_doing_shoulde_08ed6d86.jpg",
  "overhead press": "/attached_assets/stock_images/person_doing_shoulde_08ed6d86.jpg",
  "plank": "/attached_assets/stock_images/person_doing_plank_c_32fc56c2.jpg",
  "side plank": "/attached_assets/stock_images/person_doing_plank_c_32fc56c2.jpg",
  "lunges": "/attached_assets/stock_images/person_doing_lunges__4a8cf8d2.jpg",
  "walking lunges": "/attached_assets/stock_images/person_doing_lunges__4a8cf8d2.jpg",
  "bulgarian split squat": "/attached_assets/stock_images/person_doing_lunges__4a8cf8d2.jpg",
};

async function updateExerciseImages() {
  try {
    console.log("Fetching all exercises...");
    const allExercises = await db.select().from(exercises);
    
    console.log(`Found ${allExercises.length} exercises. Updating images...`);
    
    let updatedCount = 0;
    
    for (const exercise of allExercises) {
      const exerciseNameLower = exercise.name.toLowerCase();
      const equipmentLower = (exercise.equipment || "").toLowerCase();
      
      // Check if there's a specific image for this exercise
      let imageUrl = EXERCISE_SPECIFIC_IMAGES[exerciseNameLower];
      
      // If not, use the equipment-based image
      if (!imageUrl && equipmentLower) {
        imageUrl = EQUIPMENT_IMAGE_MAP[equipmentLower];
      }
      
      // Default to barbell image if no match found
      if (!imageUrl) {
        imageUrl = EQUIPMENT_IMAGE_MAP["barbell"];
      }
      
      // Update the exercise
      await db
        .update(exercises)
        .set({ imageUrl })
        .where(eq(exercises.id, exercise.id));
      
      updatedCount++;
      
      if (updatedCount % 10 === 0) {
        console.log(`Updated ${updatedCount}/${allExercises.length} exercises...`);
      }
    }
    
    console.log(`✅ Successfully updated ${updatedCount} exercises with images!`);
  } catch (error) {
    console.error("Error updating exercise images:", error);
    throw error;
  }
}

updateExerciseImages()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
