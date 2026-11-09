---
'@samizdata/mozaic': minor
---

Highlights and touch tooltips:

- `Waffle`: pointing at (or tapping) a category's squares highlights them and dims the rest. `bind:active` (the category's index) shares the highlight with a legend or another waffle; `dim` sets the opacity of the others and `interactive={false}` turns it off. Off in print. Squares have the class `mz-waffle-square`.
- `Legend`: bind `active` (starting at `null`) to highlight the item under the pointer and dim the others, and to highlight an item from a mark. Without it the legend stays static.
- `StackedBarChart`: pointing at a segment or a legend item highlights that series in every bar, its segment labels and its legend item (`interactive={false}` turns it off). A custom `legend` is not linked.
- `PointerArea`: with touch, the tooltip no longer disappears when the finger lifts. It stays until the next tap outside the plot, and a touch that turns into a scroll still clears it.
- `touchHold` (in `interactive`): the same touch handling for your own hover state.
