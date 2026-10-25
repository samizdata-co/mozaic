# Prepare data for the charts.
# Reads raw files from data/raw/ and writes tidy, long-format CSV to data/processed/.
# Run from the project root: Rscript analysis/R/01_prepare.R
# Uses base R only; add packages with renv (renv::init()) if you need them.

raw_dir <- "data/raw"
out_dir <- "data/processed"
dir.create(out_dir, showWarnings = FALSE, recursive = TRUE)

# Replace this block with your own wrangling. It writes the example dataset.
years <- 2015:2024
start <- c(North = 42, South = 35, Capital = 55)
growth <- c(North = 1.6, South = 0.95, Capital = 3.9)
dip_2020 <- c(North = 4, South = 3, Capital = 7)
rows <- do.call(rbind, lapply(names(start), function(region) {
  value <- start[[region]] + growth[[region]] * (years - 2015) - ifelse(years == 2020, dip_2020[[region]], 0)
  data.frame(year = years, region = region, value = round(value))
}))

write.csv(rows, file.path(out_dir, "example.csv"), row.names = FALSE, quote = FALSE)
message("Wrote ", nrow(rows), " rows to ", file.path(out_dir, "example.csv"))
