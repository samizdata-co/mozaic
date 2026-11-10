<!-- section: Quality -->

# Accessibility

Every chart should work for screen-reader users, keyboard users and readers with colour-vision deficiencies.

## Built in

- `<Chart>` is a `<figure>` labelled by its `<Title>`. The plot's `<svg>` has `role="img"` and is labelled by the title and described by the `alt` text.
- `<DataTable>` adds a collapsed "Show the data" table with the values; `<DataDownload>` offers the CSV.
- Marks accept a `title` accessor, which renders a `<title>` in each shape.
- `<ButtonGroup>` is a radio group: arrow keys move between options.
- `<Table>` headers are buttons with `aria-sort`.
- `<Scroller>` respects `prefers-reduced-motion`.
- Legend, tooltip and label text uses the text colours.

## Your job

- **Write `alt` text** that says what the chart shows ("Turnout rose in four regions and fell in the south"), not how it looks ("A slope chart").
- **Never rely on colour alone.** Label two or more series directly (`LineEndLabels`, labels on bars); use a legend or `Key` only when labels don't fit or the chart is narrow.
- **Keep data colours in palette order** and use the `context` grey for everything else.
- **Check contrast.** Light hues (yellow, aqua) are fine as fills but not as thin lines or text. Text coloured like its series needs 4.5:1 against the background.
- **Translate everything**, including `alt` and category names.
- **Test at 320 px** and with the keyboard.

The docs site's end-to-end tests run axe-core on every gallery page.
