"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const lessonPlan_js_1 = require("../../../backend/src/schemas/lessonPlan.js");
function validPayload(overrides = {}) {
    return {
        age_from: 3,
        age_to: 9,
        concept: "Colors of fruits",
        num_activities: 3,
        activity_duration_min: 10,
        ...overrides,
    };
}
(0, vitest_1.describe)("lessonPlanCreateSchema", () => {
    (0, vitest_1.it)("accepts minimal required fields", () => {
        const plan = lessonPlan_js_1.lessonPlanCreateSchema.parse(validPayload());
        (0, vitest_1.expect)(plan.total_lesson_time_min ?? null).toBeNull();
        (0, vitest_1.expect)(plan.video_links).toEqual([]);
        (0, vitest_1.expect)(plan.image_url ?? null).toBeNull();
    });
    (0, vitest_1.it)("rejects age_to below age_from", () => {
        (0, vitest_1.expect)(() => lessonPlan_js_1.lessonPlanCreateSchema.parse(validPayload({ age_from: 8, age_to: 4 }))).toThrow();
    });
    vitest_1.it.each([
        [2, 9],
        [3, 10],
        [0, 3],
    ])("rejects ages outside 3 to 9 (%d, %d)", (age_from, age_to) => {
        (0, vitest_1.expect)(() => lessonPlan_js_1.lessonPlanCreateSchema.parse(validPayload({ age_from, age_to }))).toThrow();
    });
    (0, vitest_1.it)("rejects concept over 300 chars", () => {
        (0, vitest_1.expect)(() => lessonPlan_js_1.lessonPlanCreateSchema.parse(validPayload({ concept: "x".repeat(301) }))).toThrow();
    });
    (0, vitest_1.it)("rejects empty concept", () => {
        (0, vitest_1.expect)(() => lessonPlan_js_1.lessonPlanCreateSchema.parse(validPayload({ concept: "" }))).toThrow();
    });
    vitest_1.it.each([0, 11])("rejects num_activities out of range (%d)", (num_activities) => {
        (0, vitest_1.expect)(() => lessonPlan_js_1.lessonPlanCreateSchema.parse(validPayload({ num_activities }))).toThrow();
    });
    vitest_1.it.each([0, 61])("rejects activity_duration_min out of range (%d)", (activity_duration_min) => {
        (0, vitest_1.expect)(() => lessonPlan_js_1.lessonPlanCreateSchema.parse(validPayload({ activity_duration_min }))).toThrow();
    });
    (0, vitest_1.it)("accepts optional total_lesson_time_min in range", () => {
        const plan = lessonPlan_js_1.lessonPlanCreateSchema.parse(validPayload({ total_lesson_time_min: 30 }));
        (0, vitest_1.expect)(plan.total_lesson_time_min).toBe(30);
    });
    vitest_1.it.each([4, 181])("rejects total_lesson_time_min out of range (%d)", (total_lesson_time_min) => {
        (0, vitest_1.expect)(() => lessonPlan_js_1.lessonPlanCreateSchema.parse(validPayload({ total_lesson_time_min }))).toThrow();
    });
    (0, vitest_1.it)("rejects an invalid video link", () => {
        (0, vitest_1.expect)(() => lessonPlan_js_1.lessonPlanCreateSchema.parse(validPayload({ video_links: ["not-a-url"] }))).toThrow();
    });
    (0, vitest_1.it)("accepts valid video links and strips blank entries", () => {
        const plan = lessonPlan_js_1.lessonPlanCreateSchema.parse(validPayload({ video_links: ["https://youtube.com/watch?v=1", "  ", "http://example.com"] }));
        (0, vitest_1.expect)(plan.video_links).toEqual(["https://youtube.com/watch?v=1", "http://example.com"]);
    });
    (0, vitest_1.it)("treats missing video_links as an empty list", () => {
        const plan = lessonPlan_js_1.lessonPlanCreateSchema.parse(validPayload({ video_links: null }));
        (0, vitest_1.expect)(plan.video_links).toEqual([]);
    });
});
//# sourceMappingURL=lessonPlanSchema.test.js.map