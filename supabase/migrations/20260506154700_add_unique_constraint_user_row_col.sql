-- Migration: add unique constraint on (user_id, row, col) for safe upsert
-- Required for the upsert-based sync pattern that replaces the old delete-all approach.

ALTER TABLE public.grid_cells
  ADD CONSTRAINT grid_cells_user_row_col_unique UNIQUE (user_id, row, col);
