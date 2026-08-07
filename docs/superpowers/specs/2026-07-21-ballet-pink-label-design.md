# Ballet Pink Display Label Design

## Goal

Replace every customer-visible use of `Baby Pink` with `Ballet Pink` across the Norie website and order communications.

## Compatibility

Keep the internal variant key `baby-pink`, existing query parameters, image filenames, and asset paths unchanged. Existing product links such as `?variant=baby-pink` must continue to resolve normally.

## Scope

- Product catalog labels, full product names, and accessible image text.
- Homepage and Shop product copy.
- Product detail defaults and Customize summaries.
- Owner and customer order emails, plus Google Sheet rows generated from catalog product names.
- Automated expectations that assert customer-visible product names.

Historical plans/specifications and asset filenames remain unchanged because they document prior implementation details or form part of stable internal paths.

## Data Flow

The product catalog remains the authoritative source for dynamic product labels. A selected `baby-pink` variant resolves to a variant whose displayed label is `Ballet Pink`; the backend consequently uses the same updated catalog name in emails and order-tracking rows without changing the submitted variant key.

## Testing

- Add a failing catalog assertion that all `baby-pink` variants display `Ballet Pink` and contain no customer-visible `Baby Pink` text.
- Update static Shop/detail/Customize expectations to require `Ballet Pink`.
- Retain assertions proving `baby-pink` URLs and variant keys still work.
- Run the complete test suite, deploy Production, and verify the live pages contain `Ballet Pink` without visible `Baby Pink` labels.
