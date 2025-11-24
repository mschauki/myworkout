import { db } from "./db";
import { exercises } from "@shared/schema";

const seedExercises = async () => {
  // Clear existing exercises for idempotent seeding
  await db.delete(exercises);
  console.log("✅ Cleared existing exercises");
  
  const exerciseData = [
    // Chest (15 exercises)
    { name: "Barbell Bench Press", description: "Lie on a bench and press the barbell up from chest level", muscleGroup: "chest", equipment: "barbell", imageUrl: null },
    { name: "Dumbbell Bench Press", description: "Press dumbbells up from chest level while lying on a bench", muscleGroup: "chest", equipment: "dumbbell", imageUrl: null },
    { name: "Incline Bench Press", description: "Press barbell on an inclined bench to target upper chest", muscleGroup: "chest", equipment: "barbell", imageUrl: null },
    { name: "Decline Bench Press", description: "Press barbell on a declined bench to target lower chest", muscleGroup: "chest", equipment: "barbell", imageUrl: null },
    { name: "Incline Dumbbell Press", description: "Press dumbbells on incline bench for upper chest", muscleGroup: "chest", equipment: "dumbbell", imageUrl: null },
    { name: "Cable Flyes", description: "Perform chest flyes using cable machine for constant tension", muscleGroup: "chest", equipment: "cable", imageUrl: null },
    { name: "Dumbbell Flyes", description: "Lower dumbbells out to sides in arcing motion", muscleGroup: "chest", equipment: "dumbbell", imageUrl: null },
    { name: "Push-ups", description: "Classic bodyweight exercise for chest, shoulders, and triceps", muscleGroup: "chest", equipment: "bodyweight", imageUrl: null },
    { name: "Diamond Push-ups", description: "Push-ups with hands close together to emphasize triceps", muscleGroup: "chest", equipment: "bodyweight", imageUrl: null },
    { name: "Chest Dips", description: "Lean forward on dip bars to target chest", muscleGroup: "chest", equipment: "bodyweight", imageUrl: null },
    { name: "Cable Crossover", description: "Cross cables across body for chest contraction", muscleGroup: "chest", equipment: "cable", imageUrl: null },
    { name: "Machine Chest Press", description: "Press using chest press machine for controlled movement", muscleGroup: "chest", equipment: "machine", imageUrl: null },
    { name: "Pec Deck", description: "Bring handles together using pec deck machine", muscleGroup: "chest", equipment: "machine", imageUrl: null },
    { name: "Landmine Press", description: "Press barbell loaded in landmine attachment at angle", muscleGroup: "chest", equipment: "barbell", imageUrl: null },
    { name: "Svend Press", description: "Press plates together while pushing forward", muscleGroup: "chest", equipment: "dumbbell", imageUrl: null },
    
    // Back (20 exercises)
    { name: "Barbell Row", description: "Row a barbell to your chest while bent over", muscleGroup: "back", equipment: "barbell", imageUrl: null },
    { name: "Pull-ups", description: "Pull your body up until chin is over the bar", muscleGroup: "back", equipment: "bodyweight", imageUrl: null },
    { name: "Chin-ups", description: "Pull-ups with underhand grip emphasizing biceps", muscleGroup: "back", equipment: "bodyweight", imageUrl: null },
    { name: "Lat Pulldown", description: "Pull cable bar down to chest level", muscleGroup: "back", equipment: "machine", imageUrl: null },
    { name: "Dumbbell Row", description: "Row dumbbell to hip while supporting body on bench", muscleGroup: "back", equipment: "dumbbell", imageUrl: null },
    { name: "Deadlift", description: "Lift barbell from ground to standing position", muscleGroup: "back", equipment: "barbell", imageUrl: null },
    { name: "Seated Cable Row", description: "Pull cable handle to torso while seated", muscleGroup: "back", equipment: "cable", imageUrl: null },
    { name: "T-Bar Row", description: "Row T-bar attachment to chest while bent over", muscleGroup: "back", equipment: "barbell", imageUrl: null },
    { name: "Pendlay Row", description: "Explosive row starting from floor each rep", muscleGroup: "back", equipment: "barbell", imageUrl: null },
    { name: "Cable Pullover", description: "Pull cable from overhead to hips", muscleGroup: "back", equipment: "cable", imageUrl: null },
    { name: "Inverted Row", description: "Pull body up to bar from underneath", muscleGroup: "back", equipment: "bodyweight", imageUrl: null },
    { name: "Face Pull", description: "Pull rope to face with elbows high", muscleGroup: "back", equipment: "cable", imageUrl: null },
    { name: "Rack Pull", description: "Deadlift from elevated position in power rack", muscleGroup: "back", equipment: "barbell", imageUrl: null },
    { name: "Good Morning", description: "Hinge at hips with barbell on upper back", muscleGroup: "back", equipment: "barbell", imageUrl: null },
    { name: "Hyperextension", description: "Extend torso against gravity on hyperextension bench", muscleGroup: "back", equipment: "bodyweight", imageUrl: null },
    { name: "Single-Arm Dumbbell Row", description: "Row one dumbbell at a time for unilateral work", muscleGroup: "back", equipment: "dumbbell", imageUrl: null },
    { name: "Meadows Row", description: "Row landmine barbell with one arm", muscleGroup: "back", equipment: "barbell", imageUrl: null },
    { name: "Wide Grip Pulldown", description: "Lat pulldown with wide grip for lat width", muscleGroup: "back", equipment: "machine", imageUrl: null },
    { name: "Close Grip Pulldown", description: "Lat pulldown with narrow grip for lat thickness", muscleGroup: "back", equipment: "machine", imageUrl: null },
    { name: "Assisted Pull-up", description: "Pull-ups with machine assistance for beginners", muscleGroup: "back", equipment: "machine", imageUrl: null },
    
    // Upper Legs (20 exercises)
    { name: "Barbell Squat", description: "Squat with barbell on upper back", muscleGroup: "upper legs", equipment: "barbell", imageUrl: null },
    { name: "Front Squat", description: "Squat with barbell on front of shoulders", muscleGroup: "upper legs", equipment: "barbell", imageUrl: null },
    { name: "Goblet Squat", description: "Squat holding dumbbell or kettlebell at chest", muscleGroup: "upper legs", equipment: "dumbbell", imageUrl: null },
    { name: "Leg Press", description: "Press weight away using leg press machine", muscleGroup: "upper legs", equipment: "machine", imageUrl: null },
    { name: "Romanian Deadlift", description: "Hinge at hips while lowering barbell to shins", muscleGroup: "upper legs", equipment: "barbell", imageUrl: null },
    { name: "Leg Curl", description: "Curl legs up against resistance on machine", muscleGroup: "upper legs", equipment: "machine", imageUrl: null },
    { name: "Leg Extension", description: "Extend legs against resistance on machine", muscleGroup: "upper legs", equipment: "machine", imageUrl: null },
    { name: "Lunges", description: "Step forward and lower body until both knees are bent", muscleGroup: "upper legs", equipment: "bodyweight", imageUrl: null },
    { name: "Walking Lunges", description: "Perform lunges while walking forward", muscleGroup: "upper legs", equipment: "bodyweight", imageUrl: null },
    { name: "Bulgarian Split Squat", description: "Single-leg squat with rear foot elevated", muscleGroup: "upper legs", equipment: "bodyweight", imageUrl: null },
    { name: "Hack Squat", description: "Squat on hack squat machine at angle", muscleGroup: "upper legs", equipment: "machine", imageUrl: null },
    { name: "Sumo Deadlift", description: "Deadlift with wide stance and toes pointed out", muscleGroup: "upper legs", equipment: "barbell", imageUrl: null },
    { name: "Step-ups", description: "Step up onto elevated platform", muscleGroup: "upper legs", equipment: "bodyweight", imageUrl: null },
    { name: "Box Jumps", description: "Jump explosively onto box or platform", muscleGroup: "upper legs", equipment: "bodyweight", imageUrl: null },
    { name: "Nordic Curls", description: "Lower body forward while kneeling for hamstring work", muscleGroup: "upper legs", equipment: "bodyweight", imageUrl: null },
    { name: "Hip Thrust", description: "Thrust hips with upper back on bench", muscleGroup: "upper legs", equipment: "barbell", imageUrl: null },
    { name: "Single-Leg Deadlift", description: "Deadlift on one leg for balance and unilateral work", muscleGroup: "upper legs", equipment: "dumbbell", imageUrl: null },
    { name: "Pistol Squat", description: "Single-leg squat to full depth", muscleGroup: "upper legs", equipment: "bodyweight", imageUrl: null },
    { name: "Wall Sit", description: "Hold squat position against wall", muscleGroup: "upper legs", equipment: "bodyweight", imageUrl: null },
    { name: "Dumbbell Squat", description: "Squat while holding dumbbells at sides or shoulders", muscleGroup: "upper legs", equipment: "dumbbell", imageUrl: null },
    { name: "Cable Hip Abduction", description: "Abduct leg against cable resistance to target hip and glute", muscleGroup: "upper legs", equipment: "cable", imageUrl: null },
    { name: "Bridge", description: "Hold bridge position while lying on back", muscleGroup: "upper legs", equipment: "bodyweight", imageUrl: null, isTimeBased: true },
    
    // Lower Legs (2 exercises)
    { name: "Calf Raise", description: "Raise heels to stand on toes", muscleGroup: "lower legs", equipment: "machine", imageUrl: null },
    { name: "Seated Calf Raise", description: "Raise heels while seated for soleus emphasis", muscleGroup: "lower legs", equipment: "machine", imageUrl: null },
    
    // Shoulders (18 exercises)
    { name: "Overhead Press", description: "Press barbell overhead from shoulder level", muscleGroup: "shoulders", equipment: "barbell", imageUrl: null },
    { name: "Dumbbell Shoulder Press", description: "Press dumbbells overhead from shoulder level", muscleGroup: "shoulders", equipment: "dumbbell", imageUrl: null },
    { name: "Arnold Press", description: "Press dumbbells while rotating palms during movement", muscleGroup: "shoulders", equipment: "dumbbell", imageUrl: null },
    { name: "Lateral Raise", description: "Raise dumbbells to sides until arms are parallel to floor", muscleGroup: "shoulders", equipment: "dumbbell", imageUrl: null },
    { name: "Front Raise", description: "Raise dumbbells to front until arms are parallel to floor", muscleGroup: "shoulders", equipment: "dumbbell", imageUrl: null },
    { name: "Rear Delt Fly", description: "Raise dumbbells out to sides while bent over", muscleGroup: "shoulders", equipment: "dumbbell", imageUrl: null },
    { name: "Face Pull", description: "Pull cable to face level with rope attachment", muscleGroup: "shoulders", equipment: "cable", imageUrl: null },
    { name: "Upright Row", description: "Row barbell up to chin with elbows high", muscleGroup: "shoulders", equipment: "barbell", imageUrl: null },
    { name: "Cable Lateral Raise", description: "Raise cable to side for constant tension", muscleGroup: "shoulders", equipment: "cable", imageUrl: null },
    { name: "Machine Shoulder Press", description: "Press using shoulder press machine", muscleGroup: "shoulders", equipment: "machine", imageUrl: null },
    { name: "Pike Push-ups", description: "Push-ups in pike position to target shoulders", muscleGroup: "shoulders", equipment: "bodyweight", imageUrl: null },
    { name: "Handstand Push-ups", description: "Push-ups performed in handstand position", muscleGroup: "shoulders", equipment: "bodyweight", imageUrl: null },
    { name: "Landmine Press", description: "Press landmine barbell with one or both arms", muscleGroup: "shoulders", equipment: "barbell", imageUrl: null },
    { name: "Bent-Over Reverse Fly", description: "Fly motion bent over for rear delts", muscleGroup: "shoulders", equipment: "dumbbell", imageUrl: null },
    { name: "Y-Raise", description: "Raise arms in Y pattern for shoulder stability", muscleGroup: "shoulders", equipment: "dumbbell", imageUrl: null },
    { name: "Cuban Press", description: "External rotation combined with overhead press", muscleGroup: "shoulders", equipment: "dumbbell", imageUrl: null },
    { name: "Bradford Press", description: "Press barbell alternating front and back of head", muscleGroup: "shoulders", equipment: "barbell", imageUrl: null },
    { name: "Shrugs", description: "Elevate shoulders to work upper traps", muscleGroup: "shoulders", equipment: "dumbbell", imageUrl: null },
    { name: "Dumbbell Shoulder Shrug", description: "Shrug dumbbells up to elevate shoulders", muscleGroup: "shoulders", equipment: "dumbbell", imageUrl: null },
    { name: "Dumbbell Front Raise", description: "Raise dumbbells to front until arms are parallel to floor", muscleGroup: "shoulders", equipment: "dumbbell", imageUrl: null },
    { name: "Dumbbell Lateral Raise", description: "Raise dumbbells to sides until arms are parallel to floor", muscleGroup: "shoulders", equipment: "dumbbell", imageUrl: null },
    { name: "Dumbbell Reverse Fly", description: "Raise dumbbells out to sides while bent over for rear delts", muscleGroup: "shoulders", equipment: "dumbbell", imageUrl: null },
    { name: "Dumbbell Seated Shoulder Press", description: "Press dumbbells overhead while seated on bench", muscleGroup: "shoulders", equipment: "dumbbell", imageUrl: null },
    
    // Arms (20 exercises)
    { name: "Barbell Curl", description: "Curl barbell up to shoulders", muscleGroup: "arms", equipment: "barbell", imageUrl: null },
    { name: "Dumbbell Curl", description: "Curl dumbbells up to shoulders", muscleGroup: "arms", equipment: "dumbbell", imageUrl: null },
    { name: "Hammer Curl", description: "Curl dumbbells with neutral grip", muscleGroup: "arms", equipment: "dumbbell", imageUrl: null },
    { name: "Preacher Curl", description: "Curl barbell or dumbbells on preacher bench", muscleGroup: "arms", equipment: "barbell", imageUrl: null },
    { name: "Concentration Curl", description: "Curl one dumbbell while seated with elbow braced", muscleGroup: "arms", equipment: "dumbbell", imageUrl: null },
    { name: "Cable Curl", description: "Curl using cable machine for constant tension", muscleGroup: "arms", equipment: "cable", imageUrl: null },
    { name: "Incline Dumbbell Curl", description: "Curl dumbbells on incline bench for stretch", muscleGroup: "arms", equipment: "dumbbell", imageUrl: null },
    { name: "Spider Curl", description: "Curl over incline bench face down", muscleGroup: "arms", equipment: "dumbbell", imageUrl: null },
    { name: "21s", description: "Curl variation with 7 reps in three different ranges", muscleGroup: "arms", equipment: "barbell", imageUrl: null },
    { name: "Zottman Curl", description: "Curl with rotation between concentric and eccentric", muscleGroup: "arms", equipment: "dumbbell", imageUrl: null },
    { name: "Tricep Pushdown", description: "Push cable bar down using triceps", muscleGroup: "arms", equipment: "cable", imageUrl: null },
    { name: "Rope Pushdown", description: "Push rope attachment down with spread at bottom", muscleGroup: "arms", equipment: "cable", imageUrl: null },
    { name: "Skull Crusher", description: "Lower barbell to forehead while lying on bench", muscleGroup: "arms", equipment: "barbell", imageUrl: null },
    { name: "Overhead Tricep Extension", description: "Extend arms overhead with dumbbell or cable", muscleGroup: "arms", equipment: "dumbbell", imageUrl: null },
    { name: "Close-Grip Bench Press", description: "Bench press with narrow grip for triceps", muscleGroup: "arms", equipment: "barbell", imageUrl: null },
    { name: "Dips", description: "Lower body between parallel bars and push back up", muscleGroup: "arms", equipment: "bodyweight", imageUrl: null },
    { name: "Diamond Push-ups", description: "Push-ups with hands in diamond shape", muscleGroup: "arms", equipment: "bodyweight", imageUrl: null },
    { name: "Kickback", description: "Extend arm back while bent over", muscleGroup: "arms", equipment: "dumbbell", imageUrl: null },
    { name: "JM Press", description: "Hybrid between close-grip bench and skull crusher", muscleGroup: "arms", equipment: "barbell", imageUrl: null },
    { name: "Tate Press", description: "Press dumbbells together and down toward chest", muscleGroup: "arms", equipment: "dumbbell", imageUrl: null },
    { name: "Dumbbell Isometric Bicep Curl", description: "Hold isometric bicep position against dumbbell resistance", muscleGroup: "arms", equipment: "dumbbell", imageUrl: null },
    { name: "Cable Rope Overhead Tricep Extension", description: "Extend arms overhead with rope attachment using cable", muscleGroup: "arms", equipment: "cable", imageUrl: null },
    { name: "Cable Rope Tricep Pushdown", description: "Push rope attachment down with cable resistance", muscleGroup: "arms", equipment: "cable", imageUrl: null },
    
    // Core (15 exercises)
    { name: "Plank", description: "Hold body in straight line supported on forearms and toes", muscleGroup: "core", equipment: "bodyweight", imageUrl: null },
    { name: "Side Plank", description: "Hold body in straight line on one side", muscleGroup: "core", equipment: "bodyweight", imageUrl: null },
    { name: "Crunches", description: "Curl upper body towards knees while lying on back", muscleGroup: "core", equipment: "bodyweight", imageUrl: null },
    { name: "Russian Twist", description: "Rotate torso side to side while seated", muscleGroup: "core", equipment: "bodyweight", imageUrl: null },
    { name: "Hanging Leg Raise", description: "Raise legs while hanging from bar", muscleGroup: "core", equipment: "bodyweight", imageUrl: null },
    { name: "Cable Crunch", description: "Crunch down using cable resistance", muscleGroup: "core", equipment: "cable", imageUrl: null },
    { name: "Ab Wheel Rollout", description: "Roll ab wheel forward while kneeling", muscleGroup: "core", equipment: "bodyweight", imageUrl: null },
    { name: "Bicycle Crunches", description: "Alternate elbow to opposite knee while crunching", muscleGroup: "core", equipment: "bodyweight", imageUrl: null },
    { name: "Mountain Climbers", description: "Alternate bringing knees to chest in plank position", muscleGroup: "core", equipment: "bodyweight", imageUrl: null },
    { name: "Dead Bug", description: "Extend opposite arm and leg while lying on back", muscleGroup: "core", equipment: "bodyweight", imageUrl: null },
    { name: "Pallof Press", description: "Press cable away from body resisting rotation", muscleGroup: "core", equipment: "cable", imageUrl: null },
    { name: "V-Ups", description: "Raise torso and legs simultaneously to V position", muscleGroup: "core", equipment: "bodyweight", imageUrl: null },
    { name: "Flutter Kicks", description: "Alternate kicking legs while lying on back", muscleGroup: "core", equipment: "bodyweight", imageUrl: null },
    { name: "Woodchoppers", description: "Rotate cable from high to low or low to high", muscleGroup: "core", equipment: "cable", imageUrl: null },
    { name: "Dragon Flag", description: "Advanced exercise holding body straight while anchored", muscleGroup: "core", equipment: "bodyweight", imageUrl: null },
    { name: "Cable Standing Crunch", description: "Crunch downward using cable resistance while standing", muscleGroup: "core", equipment: "cable", imageUrl: null },
    { name: "High Side Plank", description: "Hold high side plank position on hands", muscleGroup: "core", equipment: "bodyweight", imageUrl: null, isTimeBased: true },
    { name: "Cobra Stretch", description: "Hold cobra stretch position for core and flexibility", muscleGroup: "core", equipment: "bodyweight", imageUrl: null, isTimeBased: true },
  ];

  // Mark all seeded exercises as not custom
  const exerciseDataWithIsCustom = exerciseData.map(ex => ({ ...ex, isCustom: false }));
  await db.insert(exercises).values(exerciseDataWithIsCustom);
  console.log("✅ Seeded", exerciseData.length, "exercises");
};

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedExercises()
    .then(() => {
      console.log("✅ Seed complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seed failed:", error);
      process.exit(1);
    });
}

export { seedExercises };
