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

const COOKING =
  /\b(cook(?:ing)?|recipes?|bake|baking|ingredients?|fridge|dinner|lunch|breakfast|dessert|tiramisu|what (?:can|should) i (?:make|eat|cook))\b|[做煮烧炒].{0,3}[菜饭]|下厨|烹饪|菜谱|食谱|烘焙|食材|冰箱|早餐|早饭|午饭|午餐|晚饭|晚餐|夜宵|甜点|甜品|提拉米苏|吃什么/i

export function isCookingQuestion(text: string) {
  return COOKING.test(text)
}
