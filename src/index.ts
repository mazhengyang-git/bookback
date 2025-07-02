//一个接口，限制person具体属性
export interface PersonInter {
  id: string
  name: string
  age: number
  x?: number //加?号可有可无
}
export type Persons = Array<PersonInter>
