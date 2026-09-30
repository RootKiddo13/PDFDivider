import type { Mode, SelectionPlan } from './contracts';

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

function readGroups(input: string, mode: Mode): string[][] {
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
  if (groups.some((group) => !group.trim())) {
    throw new Error('Boş çıktı grubu olamaz. Her grubun içine sayfa seçin.');
  }

  return groups.map((group) => group.split(','));
}

/**
 * Validates selection syntax and source-page bounds before expanding ranges.
 */
export function parseSelection(input: string, mode: Mode, pageCount: number): SelectionPlan {
  if (!Number.isSafeInteger(pageCount) || pageCount < 1) {
    throw new Error('PDF sayfa sayısı geçersiz.');
  }
  if (!['single', 'pages', 'groups', 'cuts'].includes(mode)) {
    throw new Error('Bölme modu geçersiz.');
  }
  if (mode === 'cuts' && pageCount < 2) {
    throw new Error('Klasik bölme için kaynak PDF en az 2 sayfa içermelidir.');
  }

  const groups = readGroups(input, mode);
  const parsedGroups: Array<Array<[number, number]>> = [];

  for (const group of groups) {
    const tokens = group.map((item) => item.trim());
    if (tokens.some((item) => !item)) {
      throw new Error('Boş seçim öğesi olamaz. Virgüllerin arasına bir sayfa veya aralık girin.');
    }
    if (mode === 'cuts' && tokens.some((item) => item.includes('-'))) {
      throw new Error('Klasik bölmede aralık değil, kesim yapılacak tek sayfa numaralarını girin.');
    }
    parsedGroups.push(tokens.map((item) => parseItem(item, pageCount)));
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
  }

  const totalPages = outputGroups.reduce((total, group) => total + group.length, 0);

  return { groups: outputGroups, duplicateCount, totalPages };
}
