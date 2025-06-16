import { log } from 'console'
import { VoiceEntry, ProcessedResult, FILTER_DAYS } from './types.js'

/**
 * processEntries
 * --------------
 * PURE function — no IO, no mutation, deterministic.
 */

/* CONSTANTS START */
const DAYS = 1000 * 60 * 60 * 24
// Predefine stop words
const STOPWORDS = new Set([
  "a", "the", "and", "an", "or", "but", "on", "in", "at", "to",
  "of", "for", "with", "is", "are", "was", "were", "it",
  "i", "i'm", "me", "my", "myself", "we", "us", "our", "ours", "ourselves",
  "you", "you're", "your", "yours", "yourself", "yourselves",
  "he", "he's", "him", "his", "himself", 
  "she", "her", "hers", "herself",
  "it", "it's", "its", "itself",
  "they", "them", "their", "theirs", "themselves", "there's",
  "is", "are", "was", "were", "be", "been", "being", "this",
])
/* CONSTANTS END */

/* Return array of words after preprocessing */
function removeStopWords(s: string): string[] {
  return s.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"") // punctuation
  .replace(/\ufffd/g, "'") // replace unrecognised char to '
  .split(/\s+/) // white space
  .filter(char => !STOPWORDS.has(char.toLowerCase())) // remove stop words
}

/* Return true if data is less than filterDays old or all, else false */
function dateFilter(
  daysFromLastUpdated: number, 
  filterDays: string
): boolean {
  if (filterDays === "all") return true;
  return daysFromLastUpdated <= parseInt(filterDays);
}

/* Count frequency of each word */
function countWords(
  words: string[], 
  frequencies: Record<string, number>
): Record<string, number> {
  words.forEach(word => {
    frequencies[word] = (frequencies[word] || 0) + 1;
  });
  return frequencies;
}

function getTopK(
  frequencies: Record<string, number>, 
  topK: number
): Record<string, number> {
  return Object.fromEntries( // Array to object
    // Object to array
    Object.entries(frequencies)
  .sort(([,a],[,b]) => b-a) // sort by value in descending order
  .slice(0, topK) // get top K
  )
}

export function processEntries(
  entries: VoiceEntry[],
  topK: number = Infinity,
  days: FILTER_DAYS = FILTER_DAYS.ALL, // at last 7 days, 30 days, all time
): ProcessedResult {
  let tagFrequencies: Record<string, number> = {}
  for (const e of entries) {
    if (!e.transcript_raw) continue; // Skip if no content
    const words = removeStopWords(e.transcript_raw);
    // 7 days /30 days /all
    const daysFromLastUpdated = e.days_from_last_updated;
    if (dateFilter(daysFromLastUpdated, days)) {
      // Count frequency of each word
      tagFrequencies = countWords(words, tagFrequencies);
    }
  }
  
  // Fetch top K words
  tagFrequencies = getTopK(tagFrequencies, topK);
  return {
    summary: `Analysed ${entries.length} entries`,
    tagFrequencies,
  }
}

export default processEntries 