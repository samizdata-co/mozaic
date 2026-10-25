I want to build `mozaic`, an ever-evolving library of charts for use online and in print. These would be a mix of simple charts (bars, lines, tables, treemaps), interactive components (scrollable stories) and maps.

This is a personal chart library that will support multiple styles. To begin with, there will be a SAMIZDATA style for use on samizdata.co, and a Ziarul de Gardă style for use on zdg.md. In the future, we may add new styles for different clients and publications.

The library will have components for different parts of the visualisaiton: title, footer, annotations, etc.

The charts should be exportable to static assets that can be embedded independently on different websites. The way it would work is there would be a new repo for each new piece of analysis that would include R and/or Python scripts for data wrangling and analysis, as well as code to generate embeds for one or two charts based on the analysed data. Any new chart types would be added to the standard library (mozaic) or the components would be modified to add new features.

I want your suggestions for an implementation. I don't have a preference for the tech stack, but I am more familiar with Svelte / SvelteKit. I have also previously tried using Layer Cake. I am a big fan of ggplot and other grammar of graphics libraries.

What I don't want is a library of rigid charts like Apache ECharts, I want something that is fully customisable and in which I can build any chart I can think of or find the code for.