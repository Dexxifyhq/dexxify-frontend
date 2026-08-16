# Fonts

Font binaries are **not committed**. This repository is public, and both typefaces
are commercially licensed with redistribution prohibited. Every developer obtains
their own copy; production builds get theirs from private storage.

## Expected files

Drop `.woff2` files here using these exact names — `src/app/layout.tsx` imports
them by path, so a mismatch fails the build.

### Untitled Sans — Klim Type Foundry

Variable (preferred — single file, full 300–900 range):

    UntitledSans-Variable.woff2

Or static weights, if the variable font is not part of your licence:

    UntitledSans-Regular.woff2   400
    UntitledSans-Medium.woff2    500
    UntitledSans-Bold.woff2      700

### Input Mono — David Jonathan Ross / Type Network

    InputMono-Regular.woff2      400
    InputMono-Medium.woff2       500

## Where to get them

| | Source | Notes |
|---|---|---|
| Untitled Sans | <https://klim.co.nz/fonts/untitled-sans/> | Web licence is per-domain, tiered by pageviews. Ships WOFF2. |
| Input Mono | <https://input.djr.com/buy/> | Free download is private/unpublished use only — not valid for a public site. |

For local development, Klim's free test fonts (<https://klim.co.nz/test-fonts/>)
include WOFF2 and are licensed for mocking up designs prior to purchase. They are
**not** licensed for public deployment — never ship a build made against them.

Do not convert Klim's OTFs to WOFF2 yourself; their licence forbids altering the
files, and they supply WOFF2 directly.

## Weight availability

Neither family includes a 600 weight. Untitled Sans goes Light 300, Regular 400,
Medium 500, Bold 700, Black 900. Any `font-semibold` in the codebase will resolve
to Bold 700 unless the variable font is used.
