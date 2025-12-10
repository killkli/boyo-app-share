import { describe, it, expect } from 'vitest'
import { normalizeCreatorInput, type CreatorInput, type CreatorWithLink } from './creator'

describe('normalizeCreatorInput', () => {
  it('應該將字串轉換為創作者物件', () => {
    const result = normalizeCreatorInput('Alice')
    expect(result).toEqual({ name: 'Alice' })
  })

  it('應該修剪字串中的空白', () => {
    const result = normalizeCreatorInput('  Bob  ')
    expect(result).toEqual({ name: 'Bob' })
  })

  it('應該保留物件格式（僅名稱）', () => {
    const result = normalizeCreatorInput({ name: 'Charlie' })
    expect(result).toEqual({ name: 'Charlie' })
  })

  it('應該保留物件格式（名稱+連結）', () => {
    const result = normalizeCreatorInput({
      name: 'David',
      link: 'https://david.com'
    })
    expect(result).toEqual({
      name: 'David',
      link: 'https://david.com'
    })
  })

  it('應該修剪物件中的空白', () => {
    const result = normalizeCreatorInput({
      name: '  Eve  ',
      link: '  https://eve.com  '
    })
    expect(result).toEqual({
      name: 'Eve',
      link: 'https://eve.com'
    })
  })

  it('應該將空連結轉換為 undefined', () => {
    const result = normalizeCreatorInput({
      name: 'Frank',
      link: ''
    })
    expect(result).toEqual({ name: 'Frank' })
  })

  it('應該將空白連結轉換為 undefined', () => {
    const result = normalizeCreatorInput({
      name: 'Grace',
      link: '   '
    })
    expect(result).toEqual({ name: 'Grace' })
  })
})
