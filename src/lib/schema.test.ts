import { describe, expect, it } from "vitest";

import { lessonFrontmatterSchema } from "./schema";

describe("lessonFrontmatterSchema", () => {
  it("accepts a draft lesson even though the body has no section headings yet", () => {
    // The schema only ever sees parsed frontmatter, never the MDX body, so
    // it has no way to require any of the §6 section headings -- that's the
    // point (see architecture doc §6: "sections are conventions, not
    // validation rules"). This test makes that guarantee explicit, per the
    // roadmap's M6 risk: "a lesson missing every optional section heading
    // must still pass validation as draft."
    const minimalDraftFrontmatter = {
      schemaVersion: 1,
      title: "Untitled Draft",
      description: "Scaffolded, not yet written.",
      category: "javascript",
      tags: [],
      difficulty: "beginner",
      order: 99,
      related: [],
      updatedAt: "2026-07-28",
      status: "draft",
    };

    const result = lessonFrontmatterSchema.safeParse(minimalDraftFrontmatter);
    expect(result.success).toBe(true);
  });

  it("rejects an invalid status value", () => {
    const result = lessonFrontmatterSchema.safeParse({
      schemaVersion: 1,
      title: "X",
      description: "Y",
      category: "javascript",
      tags: [],
      difficulty: "beginner",
      order: 1,
      related: [],
      updatedAt: "2026-07-28",
      status: "archived",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a schemaVersion other than 1", () => {
    const result = lessonFrontmatterSchema.safeParse({
      schemaVersion: 2,
      title: "X",
      description: "Y",
      category: "javascript",
      tags: [],
      difficulty: "beginner",
      order: 1,
      related: [],
      updatedAt: "2026-07-28",
      status: "draft",
    });
    expect(result.success).toBe(false);
  });
});
