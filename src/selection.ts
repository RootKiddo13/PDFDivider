import type { Mode, SelectionPlan } from './contracts';
import { LIMITS } from './limits';

const INVALID_SELECTION = 'Sayfa seçimi geçersiz. Sayfa numarası veya dahil aralık girin; örnek: 1,5-8.';

function parsePageNumber(value: string, pageCount: number): number {
  const token = value.trim();
  if (!/^\d+$/.test(token)) {
    throw new Error(INVALID_SELECTION);
  }

  const page = Number(token);
  if (!Number.isSafeInteger(page) || page < 1) {
    throw new Error('Sayfa numarası güvenli bir pozitif tam sayı olmalıdır.');
  }
  if (page > pageCount) {
    throw new Error(`Sayfa numarası dosyanın toplam ${pageCount} sayfasını aşıyor.`);
  }
  return page;
}

function parseItem(token: string, pageCount: number): [number, number] {
  const parts = token.split('-');
  if (parts.length === 1) {
    const page = parsePageNumber(parts[0], pageCount);
    return [page, page];
  }
  if (parts.length !== 2) {
    throw new Error(INVALID_SELECTION);
  }

  const start = parsePageNumber(parts[0], pageCount);
  const end = parsePageNumber(parts[1], pageCount);
  if (start > end) {
    throw new Error('Aralık başlangıcı bitişinden büyük olamaz.');
  }
  return [start, end];
}

function countUniquePages(ranges: Array<[number, number]>): number {
  const ordered = [...ranges].sort((left, right) => left[0] - right[0] || left[1] - right[1]);
  let count = 0;
  let activeStart = 0;
  let activeEnd = -1;

  for (const [start, end] of ordered) {
    if (start > activeEnd + 1) {
      if (activeEnd >= activeStart) count += activeEnd - activeStart + 1;
      activeStart = start;
      activeEnd = end;
    } else {
      activeEnd = Math.max(activeEnd, end);
    }
  }
  if (activeEnd >= activeStart) count += activeEnd - activeStart + 1;
  return count;
}

function readGroups(input: string, mode: Mode): string[][] {
  if (input.length > LIMITS.inputCharacters) {
    throw new Error('Seçim metni izin verilen uzunluğu aşıyor. Daha küçük bir seçim girin.');
  }
  const value = input.trim();
  if (!value) {
    throw new Error('Önce en az bir sayfa seçin.');
  }

  if (mode === 'cuts') {
    if (value.includes(';')) {
      throw new Error('Klasik bölmede kesim noktalarını virgülle ayırın.');
    }
    return [value.split(',')];
  }

  if (mode !== 'groups' && value.includes(';')) {
    throw new Error('Noktalı virgül yalnız ayrı çıktı grupları modunda kullanılabilir.');
  }

  const groups = mode === 'groups' ? value.split(';') : [value];
  if (groups.length > LIMITS.groups) {
    throw new Error(`En fazla ${LIMITS.groups} çıktı grubu seçilebilir.`);
  }
  if (groups.some((group) => !group.trim())) {
    throw new Error('Boş çıktı grubu olamaz. Her grubun içine sayfa seçin.');
  }

  return groups.map((group) => group.split(','));
}

/**
 * Parses a user selection without expanding any range until all endpoints,
 * source bounds, item counts, and output budgets have passed.
 */
export function parseSelection(input: string, mode: Mode, pageCount: number): SelectionPlan {
  if (!Number.isSafeInteger(pageCount) || pageCount < 1) {
    throw new Error('PDF sayfa sayısı geçersiz.');
  }
  if (pageCount > LIMITS.sourcePages) {
    throw new Error(`Bu dosya en fazla ${LIMITS.sourcePages} sayfa destekleyen geçici geliştirme sınırını aşıyor.`);
  }
  if (!['single', 'pages', 'groups', 'cuts'].includes(mode)) {
    throw new Error('Bölme modu geçersiz.');
  }
  if (mode === 'cuts' && pageCount < 2) {
    throw new Error('Klasik bölme için kaynak PDF en az 2 sayfa içermelidir.');
  }

  const groups = readGroups(input, mode);
  let itemCount = 0;
  const parsedGroups: Array<Array<[number, number]>> = [];

  for (const group of groups) {
    const tokens = group.map((item) => item.trim());
    if (tokens.some((item) => !item)) {
      throw new Error('Boş seçim öğesi olamaz. Virgüllerin arasına bir sayfa veya aralık girin.');
    }
    if (mode === 'cuts' && tokens.some((item) => item.includes('-'))) {
      throw new Error('Klasik bölmede aralık değil, kesim yapılacak tek sayfa numaralarını girin.');
    }
    itemCount += tokens.length;
    if (itemCount > LIMITS.items) {
      throw new Error(`En fazla ${LIMITS.items} sayfa seçimi öğesi kullanılabilir.`);
    }

    parsedGroups.push(tokens.map((item) => parseItem(item, pageCount)));
  }

  // Check output count and copied-page budgets from merged interval bounds before expansion.
  if (mode === 'groups' && parsedGroups.length > LIMITS.outputs) {
    throw new Error(`Bu seçim ${LIMITS.outputs} çıktı sınırını aşıyor.`);
  }
  if (mode === 'cuts' && pageCount > LIMITS.copiedPages) {
    throw new Error('Bölme işlemi geçici kopyalama bütçesini aşıyor.');
  }
  let expectedCopiedPages = 0;
  if (mode === 'cuts') {
    expectedCopiedPages = pageCount;
  } else {
    for (const ranges of parsedGroups) expectedCopiedPages += countUniquePages(ranges);
  }
  if (expectedCopiedPages > LIMITS.copiedPages) {
    throw new Error(`Seçim ${LIMITS.copiedPages} toplam sayfa kopyalama geçici sınırını aşıyor.`);
  }

  if (mode === 'pages') {
    const expectedOutputCount = countUniquePages(parsedGroups[0]);
    if (expectedOutputCount > LIMITS.outputs) {
      throw new Error(`Bu seçim ${LIMITS.outputs} çıktı sınırını aşıyor.`);
    }
  }

  let duplicateCount = 0;
  let outputGroups: number[][];

  if (mode === 'cuts') {
    const uniqueCuts = new Set<number>();
    for (const [start] of parsedGroups[0]) {
      if (start >= pageCount) {
        throw new Error(`Kesim noktaları 1 ile ${pageCount - 1} arasında tam sayfa numarası olmalıdır.`);
      }
      if (uniqueCuts.has(start)) duplicateCount += 1;
      uniqueCuts.add(start);
    }
    const cuts = [...uniqueCuts].sort((a, b) => a - b);
    const outputCount = cuts.length + 1;
    if (outputCount > LIMITS.outputs) {
      throw new Error(`Bu seçim ${LIMITS.outputs} çıktı sınırını aşıyor.`);
    }
    outputGroups = [];
    let firstPage = 1;
    for (const cutAfter of cuts) {
      const part: number[] = [];
      for (let page = firstPage; page <= cutAfter; page += 1) part.push(page);
      outputGroups.push(part);
      firstPage = cutAfter + 1;
    }
    const lastPart: number[] = [];
    for (let page = firstPage; page <= pageCount; page += 1) lastPart.push(page);
    outputGroups.push(lastPart);
  } else {
    outputGroups = parsedGroups.map((ranges) => {
      const selected = new Set<number>();
      for (const [start, end] of ranges) {
        for (let page = start; page <= end; page += 1) {
          if (selected.has(page)) duplicateCount += 1;
          else selected.add(page);
        }
      }
      return [...selected].sort((a, b) => a - b);
    });

    if (mode === 'pages') {
      outputGroups = outputGroups.flatMap((pages) => pages.map((page) => [page]));
    }
    if (outputGroups.length > LIMITS.outputs) {
      throw new Error(`Bu seçim ${LIMITS.outputs} çıktı sınırını aşıyor.`);
    }
  }

  const totalPages = outputGroups.reduce((total, group) => total + group.length, 0);
  if (totalPages > LIMITS.copiedPages) {
    throw new Error(`Seçim ${LIMITS.copiedPages} toplam sayfa kopyalama geçici sınırını aşıyor.`);
  }

  return { groups: outputGroups, duplicateCount, totalPages };
}
