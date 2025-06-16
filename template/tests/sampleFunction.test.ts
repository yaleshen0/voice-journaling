// eslint-disable-next-line import/no-extraneous-dependencies
// @ts-expect-error vitest types are provided via tsconfig "types"
import { describe, it, expect } from 'vitest'
import { mockVoiceEntries } from '../src/lib/mockData.js'
import processEntries from '../src/lib/sampleFunction.js'
import { log } from 'console'
import { FILTER_DAYS } from '../src/lib/types.js'

// describe('processEntries', () => {
//   it('counts reflection tag correctly', () => {
//     const result = processEntries(mockVoiceEntries)
//     expect(result.tagFrequencies.reflection).toBe(mockVoiceEntries.length)
//   })
// }) 

describe('processEntries', () => {
  it('Count top K words correctly', () => {
    // Preprocess first 10 entries and get top 3 words of all time
    const resultAllTime = processEntries(mockVoiceEntries.slice(0,10), 3);
    
    expect(Object.keys(resultAllTime.tagFrequencies).length).toBe(3);
    const top3WordsAllTime = Object.keys(resultAllTime.tagFrequencies);
    expect(top3WordsAllTime).toContain('want');
    expect(top3WordsAllTime).toContain('don\'t');
    expect(top3WordsAllTime).toContain('think');

    // Preprocess first 10 entries and get all words of all time
    const resultAllTime2 = processEntries(mockVoiceEntries.slice(0,10));
    expect(Object.keys(resultAllTime2.tagFrequencies).length).toBe(80);

    // Preprocess first 10 entries and get top 3 words of last 7 days
    const resultLast7 = processEntries(mockVoiceEntries.slice(0,10), 3, FILTER_DAYS.LAST_7_DAYS);
    expect(Object.keys(resultLast7.tagFrequencies).length).lessThanOrEqual(3);

    // Preprocess first 10 entries and get top 3 words of last 30 days
    const resultLast30 = processEntries(mockVoiceEntries.slice(0,10), 3, FILTER_DAYS.LAST_30_DAYS);
    expect(Object.keys(resultLast30.tagFrequencies).length).lessThanOrEqual(3);
    const top3Words = Object.keys(resultLast30.tagFrequencies);
    
    if (top3Words.length > 0) {
      expect(top3Words).toContain("want");
      expect(resultLast30.tagFrequencies[top3Words[0]]).toBe(2);
    }
  })
}) 