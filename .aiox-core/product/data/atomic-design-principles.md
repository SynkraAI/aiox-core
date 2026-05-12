# Atomic Design Principles

**Source:** Brad Frost's Atomic Design methodology
**Application:** Atlas component organization

---

## The Five Levels

### Atoms
**Definition:** Basic building blocks that can't be broken down further.

**Examples:**
- Button
- Input
- Label
- Icon
- Heading
- Text

**Rules:**
- Standalone, reusable
- No dependencies on other atoms
- Uses tokens only (no hardcoded values)
- Single responsibility

### Molecules
**Definition:** Groups of atoms functioning together as a unit.

**Examples:**
- FormField (Label + Input + HelperText)
- SearchBar (Input + Button)
- Card Header (Icon + Heading + Text)

**Rules:**
- Composes atoms (doesn't reimplement)
- Adds composition logic
- Atoms remain independent

### Organisms
**Definition:** Complex UI components composed of molecules and/or atoms.

**Examples:**
- Navigation (Logo + NavLinks + SearchBar + UserMenu)
- LoginForm (FormFields + Button + Link)
- ProductCard (Image + CardHeader + CardBody + Button)

**Rules:**
- Distinct section of interface
- Can be reused across templates
- Manages internal state if needed

### Templates
**Definition:** Page-level layout without real content.

**Examples:**
- DashboardLayout
- ArticleLayout
- CheckoutFlowLayout

**Rules:**
- Defines page structure
- Placeholder content
- Reusable across pages

### Pages
**Definition:** Templates with real content.

**Examples:**
- Homepage
- Product Detail Page
- User Dashboard

**Note:** Atlas focuses on atoms → organisms. Pages are application-specific.

---

## Benefits

1. **Consistency:** Reusing atoms ensures UI consistency
2. **Scalability:** New features built from existing components
3. **Maintenance:** Fix once, applies everywhere
4. **Testing:** Test atoms thoroughly, compose with confidence
5. **Collaboration:** Clear component taxonomy

---

## Atlas Implementation

```
design-system/
├── atoms/
│   ├── Button/
│   ├── Input/
│   └── Label/
├── molecules/
│   ├── FormField/
│   └── SearchBar/
├── organisms/
│   ├── Navigation/
│   └── LoginForm/
└── templates/
    └── DashboardLayout/
```

**Atlas builds:** atoms first → molecules → organisms → templates

**Reference:** https://atomicdesign.bradfrost.com/
