-- Update category colors to Notion-style pastel colors
-- These soft, pastel backgrounds look great with dark text

UPDATE categories SET color = '#FFE2DD' WHERE name = 'Rent & Amenities';  -- Light red/pink
UPDATE categories SET color = '#FFE4C8' WHERE name = 'Food';              -- Light orange
UPDATE categories SET color = '#D3E5EF' WHERE name = 'Transport';         -- Light blue
UPDATE categories SET color = '#E7F3EC' WHERE name = 'Learning';          -- Light green
UPDATE categories SET color = '#FFE8E8' WHERE name = 'Health';            -- Light red
UPDATE categories SET color = '#F5E8FF' WHERE name = 'Gifts';             -- Light purple
UPDATE categories SET color = '#DBEDFF' WHERE name = 'Gym';               -- Light blue
UPDATE categories SET color = '#FFE4F1' WHERE name = 'BodyCare';          -- Light pink
UPDATE categories SET color = '#E8DEFF' WHERE name = 'Entertainment';     -- Light purple
UPDATE categories SET color = '#FFE4E6' WHERE name = 'Relationship';      -- Light pink
UPDATE categories SET color = '#FFF2D9' WHERE name = 'Family';            -- Light yellow
UPDATE categories SET color = '#D3E5EF' WHERE name = 'Investments';       -- Light blue
UPDATE categories SET color = '#E8E9EB' WHERE name = 'Car';               -- Light gray
UPDATE categories SET color = '#E3E2E0' WHERE name = 'Insurance';         -- Light gray

-- Income categories (lighter, success-oriented colors)
UPDATE categories SET color = '#D4EDDA' WHERE name = 'Salary';            -- Light green
UPDATE categories SET color = '#E8DEFF' WHERE name = 'Freelance';         -- Light purple
UPDATE categories SET color = '#FFF2D9' WHERE name = 'Investment Returns'; -- Light yellow
UPDATE categories SET color = '#FFE4F1' WHERE name = 'Gift Received';     -- Light pink
UPDATE categories SET color = '#D3E5EF' WHERE name = 'Other Income';      -- Light blue

