export interface Ingredient {
  name: string
  have: boolean
  note: string
}

export interface Substitute {
  id: string
  name: string
  note: string
  /** 0 when it is already in the fridge. */
  price: number
}

/** The fridge's agent: what tonight's dish needs, what is missing, and what can stand in. */
export const fridge = {
  title: 'My fridge',
  avatar: '/fridge-avatar.png',
  dish: 'tiramisu',
  message: "You're almost ready to make tiramisu tonight!",
  ingredients: [
    { name: 'Eggs', have: true, note: '4 available' },
    { name: 'Cheese', have: false, note: 'none' },
    { name: 'Sugar', have: true, note: 'Enough' },
    { name: 'Coffee', have: true, note: 'Enough' },
  ] satisfies Ingredient[],
  missing: { name: 'Mascarpone Cheese 225 g', short: 'Mascarpone', price: 5.99, image: '/mascarpone.png', eta: '5 p.m.' },
  substitutes: [
    { id: 'yogurt', name: 'Greek yogurt + heavy cream', note: 'Both in your fridge · a little tangier', price: 0 },
    { id: 'cream-cheese', name: 'Cream cheese + heavy cream', note: 'Closest texture · 3 : 1, whipped', price: 4.49 },
    { id: 'ricotta', name: 'Ricotta, blended smooth', note: 'Lighter, slightly grainy', price: 3.99 },
  ] satisfies Substitute[],
}

const DISHES =
  'tiramisu|tira ?mi ?su|terr?a ?mi ?su|cakes?|cookies|brownies|pancakes|bread|pasta|spaghetti|pizza|soup|salad|curry|steak|noodles|dumplings|risotto|omelette|sushi'

// Whole sentences about cooking ("I want to make tiramisu tonight") as well as single cue words.
const COOKING = new RegExp(
  [
    `\\b(?:cook(?:ing)?|recipes?|bake|baking|ingredients?|fridge|dinner|lunch|breakfast|dessert|${DISHES})\\b`,
    String.raw`\bwhat (?:can|should) (?:i|we) (?:make|eat|cook)\b`,
    String.raw`[做煮烧炒].{0,3}[菜饭]|下厨|烹饪|菜谱|食谱|烘焙|食材|冰箱|早餐|早饭|午饭|午餐|晚饭|晚餐|夜宵|甜点|甜品|吃什么`,
    String.raw`[做烤煮].{0,3}(?:提拉米苏|蛋糕|面包|饼干|面条|饺子|意面|披萨|汤|沙拉)|提拉米苏`,
  ].join('|'),
  'i',
)

export function isCookingQuestion(text: string) {
  return COOKING.test(text)
}
