import type {
  CategoryId,
  Difficulty,
  Level,
  VocabularyWord,
} from "../game/engine";
import vocabularyLibrary from "./vocabulary-library.json";

const definitions: Record<string, string> = {
  menu: "a list of food and drinks you can order",
  meal: "food eaten at a regular time of day",
  rice: "small white or brown grains cooked as food",
  soup: "a liquid food usually served warm",
  fork: "a tool with pointed parts used for eating",
  bill: "a paper showing how much you must pay",
  beverage: "any drink, especially one served with a meal",
  appetizer: "a small dish eaten before the main meal",
  dessert: "sweet food eaten at the end of a meal",
  waiter: "a person who serves food in a restaurant",
  reservation: "an arrangement to keep a table for you",
  delicious: "having a very pleasant taste",
  ingredients: "foods used together to make a dish",
  vegetarian: "a person or dish that does not include meat",
  recommendation: "a suggestion about a good choice",
  allergy: "a harmful reaction to a food or substance",
  signature: "a special dish a restaurant is known for",
  complimentary: "given free without needing payment",
  taxi: "a car with a driver that you pay for a journey",
  train: "connected vehicles that travel on railway tracks",
  ticket: "a document that lets you travel or enter",
  map: "a drawing that shows roads and places",
  gate: "the place where passengers enter an aircraft",
  bus: "a large road vehicle carrying many passengers",
  passport: "an official document used to travel abroad",
  luggage: "bags and suitcases taken on a journey",
  departure: "the act or time of leaving a place",
  arrival: "the act or time of reaching a place",
  platform: "the area beside a train where passengers wait",
  transfer: "a change from one vehicle or route to another",
  immigration: "the airport control for entering a country",
  itinerary: "a plan showing places and times for a trip",
  connection: "a second flight, train, or bus in one journey",
  turbulence: "rough movement felt during a flight",
  destination: "the place you are travelling to",
  transportation: "ways of moving people from place to place",
  hotel: "a place where travellers pay to stay overnight",
  room: "a private space in a hotel where a guest stays",
  key: "an object or card used to open a lock",
  bed: "furniture used for sleeping",
  towel: "cloth used for drying your body",
  lobby: "the main entrance area of a hotel",
  reception: "the desk where hotel guests get help",
  booking: "an arrangement to keep a room for you",
  checkout: "the process of leaving and paying at a hotel",
  balcony: "an outdoor platform attached to a room",
  housekeeping: "the hotel service that cleans guest rooms",
  elevator: "a machine that carries people between floors",
  accommodation: "a place where someone can stay or live",
  availability: "the state of being free and ready to book",
  occupancy: "the number of people staying in a room",
  hospitality: "friendly care given to guests and visitors",
  concierge: "a hotel worker who helps guests with local plans",
  amenities: "useful hotel features such as a pool or gym",
  beach: "a sandy or stony area beside the sea",
  park: "a green public area for relaxing or exercise",
  zoo: "a place where people can see many animals",
  temple: "a building used for religious worship",
  museum: "a building where important objects are displayed",
  guide: "a person who shows visitors around a place",
  monument: "a structure built to remember a person or event",
  gallery: "a place where works of art are displayed",
  waterfall: "water dropping from a high place in a river",
  viewpoint: "a place with a wide and beautiful view",
  entrance: "a door or way used to go into a place",
  souvenir: "an object kept to remember a trip",
  architecture: "the style and design of buildings",
  archaeological: "related to the study of ancient people and places",
  exhibition: "a public display of art or interesting objects",
  heritage: "traditions and places passed down from the past",
  landmark: "a famous place that is easy to recognize",
  admission: "the price or permission needed to enter",
};

const words = (entries: Array<[word: string, thai: string]>): VocabularyWord[] =>
  entries.map(([word, thai]) => ({
    id: word.toLowerCase(),
    word,
    thai,
    definition: definitions[word.toLowerCase()],
  }));

export const levels: Level[] = [
  {
    id: "food-easy-1",
    category: "food",
    difficulty: "easy",
    words: words([
      ["menu", "เมนู"],
      ["meal", "มื้ออาหาร"],
      ["rice", "ข้าว"],
      ["soup", "ซุป"],
      ["fork", "ส้อม"],
      ["bill", "ใบเรียกเก็บเงิน"],
    ]),
  },
  {
    id: "food-medium-1",
    category: "food",
    difficulty: "medium",
    words: words([
      ["beverage", "เครื่องดื่ม"],
      ["appetizer", "อาหารเรียกน้ำย่อย"],
      ["dessert", "ของหวาน"],
      ["waiter", "พนักงานเสิร์ฟชาย"],
      ["reservation", "การจองโต๊ะ"],
      ["delicious", "อร่อย"],
    ]),
  },
  {
    id: "food-hard-1",
    category: "food",
    difficulty: "hard",
    words: words([
      ["ingredients", "ส่วนผสม"],
      ["vegetarian", "อาหารมังสวิรัติ"],
      ["recommendation", "คำแนะนำ"],
      ["allergy", "อาการแพ้"],
      ["signature", "เมนูเอกลักษณ์ของร้าน"],
      ["complimentary", "ให้ฟรีโดยไม่คิดค่าใช้จ่าย"],
    ]),
  },
  {
    id: "travel-easy-1",
    category: "travel",
    difficulty: "easy",
    words: words([
      ["taxi", "รถแท็กซี่"],
      ["train", "รถไฟ"],
      ["ticket", "ตั๋ว"],
      ["map", "แผนที่"],
      ["gate", "ประตูขึ้นเครื่อง"],
      ["bus", "รถโดยสาร"],
    ]),
  },
  {
    id: "travel-medium-1",
    category: "travel",
    difficulty: "medium",
    words: words([
      ["passport", "หนังสือเดินทาง"],
      ["luggage", "สัมภาระ"],
      ["departure", "การออกเดินทาง"],
      ["arrival", "การมาถึง"],
      ["platform", "ชานชาลา"],
      ["transfer", "การเปลี่ยนเที่ยวเดินทาง"],
    ]),
  },
  {
    id: "travel-hard-1",
    category: "travel",
    difficulty: "hard",
    words: words([
      ["immigration", "ด่านตรวจคนเข้าเมือง"],
      ["itinerary", "กำหนดการเดินทาง"],
      ["connection", "เที่ยวเดินทางต่อ"],
      ["turbulence", "สภาพอากาศแปรปรวนบนเครื่องบิน"],
      ["destination", "จุดหมายปลายทาง"],
      ["transportation", "การคมนาคม"],
    ]),
  },
  {
    id: "accommodations-easy-1",
    category: "accommodations",
    difficulty: "easy",
    words: words([
      ["hotel", "โรงแรม"],
      ["room", "ห้องพัก"],
      ["key", "กุญแจ"],
      ["bed", "เตียง"],
      ["towel", "ผ้าเช็ดตัว"],
      ["lobby", "ล็อบบี้"],
    ]),
  },
  {
    id: "accommodations-medium-1",
    category: "accommodations",
    difficulty: "medium",
    words: words([
      ["reception", "แผนกต้อนรับ"],
      ["booking", "การจอง"],
      ["checkout", "การคืนห้องพัก"],
      ["balcony", "ระเบียง"],
      ["housekeeping", "แผนกแม่บ้าน"],
      ["elevator", "ลิฟต์"],
    ]),
  },
  {
    id: "accommodations-hard-1",
    category: "accommodations",
    difficulty: "hard",
    words: words([
      ["accommodation", "ที่พัก"],
      ["availability", "ห้องว่าง"],
      ["occupancy", "จำนวนผู้เข้าพัก"],
      ["hospitality", "การต้อนรับ"],
      ["concierge", "พนักงานอำนวยความสะดวก"],
      ["amenities", "สิ่งอำนวยความสะดวก"],
    ]),
  },
  {
    id: "attractions-easy-1",
    category: "attractions",
    difficulty: "easy",
    words: words([
      ["beach", "ชายหาด"],
      ["park", "สวนสาธารณะ"],
      ["zoo", "สวนสัตว์"],
      ["temple", "วัด"],
      ["museum", "พิพิธภัณฑ์"],
      ["guide", "มัคคุเทศก์"],
    ]),
  },
  {
    id: "attractions-medium-1",
    category: "attractions",
    difficulty: "medium",
    words: words([
      ["monument", "อนุสาวรีย์"],
      ["gallery", "หอศิลป์"],
      ["waterfall", "น้ำตก"],
      ["viewpoint", "จุดชมวิว"],
      ["entrance", "ทางเข้า"],
      ["souvenir", "ของที่ระลึก"],
    ]),
  },
  {
    id: "attractions-hard-1",
    category: "attractions",
    difficulty: "hard",
    words: words([
      ["architecture", "สถาปัตยกรรม"],
      ["archaeological", "เกี่ยวกับโบราณคดี"],
      ["exhibition", "นิทรรศการ"],
      ["heritage", "มรดกทางวัฒนธรรม"],
      ["landmark", "สถานที่สำคัญ"],
      ["admission", "ค่าเข้าชม"],
    ]),
  },
];

type LibraryEntry = VocabularyWord & { category: CategoryId };

const categoryIds: CategoryId[] = [
  "food",
  "travel",
  "accommodations",
  "attractions",
];

function chunks<T>(items: T[], size: number) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size),
  );
}

function buildLibraryLevels(): Level[] {
  const entries = vocabularyLibrary as LibraryEntry[];
  const generated: Level[] = [];

  for (const category of categoryIds) {
    const categoryWords = entries
      .filter((entry) => entry.category === category)
      .sort((left, right) =>
        left.word.length - right.word.length || left.word.localeCompare(right.word),
      );
    const firstCut = Math.floor(categoryWords.length / 3);
    const secondCut = Math.floor((categoryWords.length * 2) / 3);
    const groups: Array<[Difficulty, LibraryEntry[]]> = [
      ["easy", categoryWords.slice(0, firstCut)],
      ["medium", categoryWords.slice(firstCut, secondCut)],
      ["hard", categoryWords.slice(secondCut)],
    ];

    for (const [difficulty, group] of groups) {
      chunks(group, 7).forEach((levelWords, index) => {
        generated.push({
          id: `${category}-${difficulty}-library-${index + 1}`,
          category,
          difficulty,
          words: levelWords,
        });
      });
    }
  }

  return generated;
}

export const allLevels = [...levels, ...buildLibraryLevels()];

export const vocabularyCount = new Set(
  allLevels.flatMap((level) => level.words.map((word) => word.id)),
).size;

const vocabularyById = new Map(
  allLevels.flatMap((level) => level.words.map((word) => [word.id, word] as const)),
);

export function getVocabularyWord(wordId: string) {
  return vocabularyById.get(wordId.toLocaleLowerCase("en-US")) ?? null;
}

export function getLevel(
  category: CategoryId,
  difficulty: Difficulty,
  completedLevelIds: string[] = [],
) {
  const candidates = allLevels.filter(
    (candidate) =>
      candidate.category === category &&
      candidate.difficulty === difficulty,
  );
  const level =
    candidates.find((candidate) => !completedLevelIds.includes(candidate.id)) ??
    candidates[0];

  if (!level) {
    throw new Error(`No level found for ${category}/${difficulty}`);
  }

  return level;
}

