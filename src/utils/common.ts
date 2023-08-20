import { ObjectId } from 'mongodb'

export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number') as number[]
}

export const stringArrayToObjectIdArray = (stringArray: string[]) => {
  return stringArray.map((item) => new ObjectId(item))
}
