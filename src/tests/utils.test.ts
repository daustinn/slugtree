import { describe, it, expect } from 'vitest'
import {
  slugToHref,
  isLabel,
  extractLabelText,
  capitalize
} from '../lib/utils.js'

describe('utils', () => {
  describe('slugToHref', () => {
    it('generates correct href for nested slugs', () => {
      expect(slugToHref(['docs', 'getting-started'], '/base')).toBe(
        '/base/docs/getting-started'
      )
    })
    it('handles empty slug', () => {
      expect(slugToHref([], '/base')).toBe('/base')
    })
    it('normalizes base path', () => {
      expect(slugToHref(['docs'], '')).toBe('/docs')
    })
  })

  describe('isLabel', () => {
    it('returns true for valid labels', () => {
      expect(isLabel('--- Label ---')).toBe(true)
      expect(isLabel('---Label---')).toBe(true)
    })
    it('returns false for invalid labels', () => {
      expect(isLabel('- Label -')).toBe(false)
      expect(isLabel('Label')).toBe(false)
    })
  })

  describe('extractLabelText', () => {
    it('extracts text properly', () => {
      expect(extractLabelText('--- My Label ---')).toBe('My Label')
      expect(extractLabelText('---Section---')).toBe('Section')
    })
  })

  describe('capitalize', () => {
    it('capitalizes words and removes dashes', () => {
      expect(capitalize('getting-started')).toBe('Getting Started')
      expect(capitalize('api-reference')).toBe('Api Reference')
    })
    it('handles empty string', () => {
      expect(capitalize('')).toBe('')
    })
  })
})
