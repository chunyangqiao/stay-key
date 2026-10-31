# Images and icons

Use images when they contribute information, context, or product character. Preserve the intended crop and aspect ratio, and treat user-supplied imagery as variable content.

## Image treatment

Select assets that fit the product and the space in which they appear. For text over a photograph, inspect light and dark regions behind every line; use a gradient or overlay, simplify the image, or put text on a solid surface if contrast varies too much. Keep the treatment subtle enough to preserve useful image detail.

This is `ui.image-contrast`: evaluate rendered text across the whole image region, not just the CSS foreground value.

Crop images intentionally with a stable aspect ratio and suitable object positioning. Avoid stretching raster assets or shrinking detailed screenshots until their text is unreadable. Provide meaningful alternative text for informative images; use empty alt text for decorative images.

## Icons

Use a consistent icon family and scale (`ui.icon`). Emoji is not a substitute for that icon set. Keep icons at a size appropriate to their detail and neighboring text. An icon-only action needs an accessible name; an icon next to visible text is usually decorative to assistive technology. Avoid adding icons that merely fill space.
