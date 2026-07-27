# Shopify Catalogue Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate Norie's current products in Shopify and attach validated personalization choices to each order.

**Architecture:** Shopify products and variants hold sellable inventory and pricing. Horizon product-page fields collect personalization as line-item properties so the choices appear in cart and order data without a paid app.

**Tech Stack:** Shopify Admin, Horizon theme, Shopify Liquid, HTML, JavaScript

---

### Task 1: Create the Large Comb product

**Shopify resources:**
- Create: `Products > Large Comb`
- Upload: `assets/shop-large-pink.png`
- Upload: `assets/shop-large-white.png`

- [ ] Create `Large Comb` with price `CAD $30.00` and compare-at price `CAD $38.00`.
- [ ] Add option `Color` with values `Pink` and `White`.
- [ ] Assign the corresponding image to each colour variant.
- [ ] Set physical inventory, weight, and shipping status from the real item.
- [ ] Keep the product in Draft status until personalization is tested.

### Task 2: Create the remaining individual products

**Shopify resources:**
- Create: `Small Comb`
- Create: six claw clip products
- Upload: matching `assets/shop-*.png` files

- [ ] Create `Small Comb` with Pink and White variants, price `CAD $25.00`, and compare-at price `CAD $32.00`.
- [ ] Create each claw clip design as a separate product with price `CAD $12.00` and compare-at price `CAD $16.00`.
- [ ] Set inventory, weight, shipping status, and matching product media.
- [ ] Keep all products in Draft status.

### Task 3: Create the two sets

**Shopify resources:**
- Create: `Essentials Hairstyling Set`
- Create: `Baby Hairstyling Set`
- Upload: `assets/set-bamboo-pink.png`
- Upload: `assets/set-bamboo-white.png`
- Upload: `assets/set-flat-pink.png`
- Upload: `assets/set-flat-white.png`

- [ ] Create Essentials Hairstyling Set at `CAD $38.00`, compare-at `CAD $48.00`.
- [ ] Create Baby Hairstyling Set at `CAD $32.00`, compare-at `CAD $40.00`.
- [ ] Add the applicable colour, component, and free-gift choices.
- [ ] Keep both products in Draft status.

### Task 4: Add product-page personalization

**Theme resources:**
- Modify: Horizon product form block through `Online Store > Themes > Edit code`

- [ ] Add required property `Name` to customizable product forms.
- [ ] Accept only `A-Z` and `a-z`, with a minimum of 1 and maximum of 8 letters.
- [ ] Preserve the customer's entered letter case.
- [ ] Add the confirmed font and stone-colour selectors.
- [ ] Prevent add-to-cart when any required choice is missing or the name is invalid.
- [ ] Display the properties in cart lines.

### Task 5: Verify catalogue checkout data

**Shopify resources:**
- Verify: product preview
- Verify: cart
- Verify: test order

- [ ] Confirm every price, compare-at price, image, and variant matches the current Norie site.
- [ ] Confirm empty names, nine-letter names, spaces, digits, and punctuation are rejected.
- [ ] Confirm valid mixed-case names such as `Chloe` are preserved.
- [ ] Confirm name, font, stone colour, and set choices appear in the cart.
- [ ] Place a test order and confirm all choices appear in Shopify Admin.
- [ ] Activate the products only after these checks pass.
