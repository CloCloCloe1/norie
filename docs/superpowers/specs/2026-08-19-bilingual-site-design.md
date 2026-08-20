# Norie Bilingual Website Design

## Goal

Add a complete English/Chinese language switcher to the existing Norie website while preserving its current visual identity. English remains the default language. Chinese copy should feel concise, polished, Instagram-inspired, and suitable for Xiaohongshu without relying on excessive emoji or aggressive sales language.

## Scope

The bilingual experience covers all three public pages:

- `index.html`
- `shop.html`
- `customize.html`

Translation coverage includes visible headings, body copy, navigation, buttons, product names and descriptions, form labels and hints, validation and submission states, image alternative text, interactive control labels, page titles, and relevant accessibility text. Brand names, prices, email addresses, user-entered text, and established English product names such as `Flat Brush` and `Bamboo Paddle Brush` remain unchanged where that produces clearer brand communication.

## Language Experience

A compact `EN / 中文` control appears in the shared header area on every page. English is active on a visitor's first visit. Selecting Chinese updates the current page immediately, sets the document language to `zh-CN`, and saves the preference in `localStorage`. Moving between pages retains the chosen language. Selecting English reverses the change and updates the saved preference.

The control must be keyboard accessible, expose its current state to assistive technology, and fit the existing desktop and mobile navigation without crowding the brand or order link. If JavaScript is unavailable or browser storage fails, the original English content remains fully usable.

## Copy Direction

Chinese copy is adapted rather than translated word for word. It uses short, visually clean phrases with a restrained Xiaohongshu sensibility: aspirational, friendly, and memorable, but not overly cute or promotional.

Representative direction:

- `Custom Hair Pieces` becomes `把名字戴在头发上`.
- `Pink pieces for everyday shine` becomes `今天也要粉得刚刚好`.
- `Customize yours` becomes `定制你的专属款`.
- `Coming Soon` becomes `新品正在靠近`.

Functional language remains direct and unambiguous. For example, form requirements, product options, order submission states, and error messages prioritize clarity over creative phrasing.

## Technical Design

A shared browser script owns language selection and translation application. Each translatable element receives a stable translation key, with English and Chinese values stored in a centralized dictionary. Attribute translations, including `aria-label`, `alt`, `placeholder`, and the document title, use the same key-based system.

Dynamic text produced by `norie-forms.js`, `norie-carousel.js`, and the customization page's inline behavior reads the active locale through a small shared interface rather than duplicating language detection. Locale-change events allow dynamic widgets to refresh immediately after a switch.

The implementation avoids duplicated Chinese HTML pages. The existing English HTML remains the semantic fallback and source presentation, while the shared translation layer progressively enhances it.

## Failure Handling

- An absent or invalid stored locale falls back to English.
- A `localStorage` read or write failure does not block page rendering or switching for the current visit.
- A missing translation key leaves the original English text visible.
- User content, prices, counters, and custom names are never overwritten by the translation layer.
- Submission and validation errors remain readable in both languages, including API-derived fallback messages.

## Verification

Automated tests will verify that:

- all three pages load the shared language script and expose the language control;
- English is the declared default;
- the chosen locale is persisted and restored safely;
- representative visible text and accessibility attributes exist in both languages;
- all translation keys used by the pages resolve in both locale dictionaries;
- existing site, carousel, customization, and API tests continue to pass.

Manual browser checks will cover desktop and mobile layouts, keyboard operation, instant switching, cross-page persistence, form states, customization updates, and graceful English fallback when storage is unavailable.

## Out of Scope

This change does not add separate `/zh/` routes, automated browser-language detection, currency conversion, translated email templates, or a content-management system. Those can be added later without changing the core language model.
