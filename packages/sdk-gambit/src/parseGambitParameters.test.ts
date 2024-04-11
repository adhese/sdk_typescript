import { describe, expect, it } from 'vitest';
import { parseGambitParameters } from './parseGambitParameters';

describe('parseGambitParameters', () => {
  it('should return the correct parameters', () => {
    expect(parseGambitParameters({
      consent: true,
      pageType: 'pageType',
      category: ['category'],
      subCategory: 'subCategory',
      productGroup: ['productGroup'],
      searchTerm: 'searchTerm',
      userId: 'userId',
      userMode: 'userMode',
      inOrderMode: true,
      customerType: 'customerType',
      pagePath: 'pagePath',
    })).toEqual({
      tl: 'true',
      pt: 'pageType',
      ct: ['category', 'subCategory', 'productGroup'],
      kw: 'searchTerm',
      mi: 'userId',
      um: 'userMode',
      om: 'true',
      cu: 'customerType',
      pp: 'pagePath',
    });

    expect(parseGambitParameters({
      pageType: 'pageType',
      category: 'category',
      subCategory: 'subCategory',
      productGroup: ['productGroup'],
      searchTerm: 'searchTerm',
      userId: 'userId',
      userMode: 'userMode',
      inOrderMode: true,
      customerType: 'customerType',
    })).toEqual({
      pt: 'pageType',
      ct: ['category', 'subCategory', 'productGroup'],
      kw: 'searchTerm',
      mi: 'userId',
      um: 'userMode',
      om: 'true',
      cu: 'customerType',
    });
  });
});
