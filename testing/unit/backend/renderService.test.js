"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const renderService_js_1 = require("../../../backend/src/services/renderService.js");
const PLAN = {
    title: "Fruit Colors",
    warm_up: "Say hello",
    concept_explanation: "Fruits have colors",
    activities: [{ name: "Match Game", rule: "Match fruit to color", duration_min: 10 }],
    closing: "Great job everyone",
};
function render(overrides = {}) {
    return (0, renderService_js_1.renderLessonPlanHtml)({
        plan: PLAN,
        ageFrom: 3,
        ageTo: 9,
        totalLessonTimeMin: null,
        videoLinks: [],
        imageUrl: null,
        ...overrides,
    });
}
(0, vitest_1.describe)("renderLessonPlanHtml", () => {
    (0, vitest_1.it)("omits the video section when there are no links", () => {
        (0, vitest_1.expect)(render()).not.toContain("Video Resources");
    });
    (0, vitest_1.it)("includes video links as clickable anchors", () => {
        const html = render({ videoLinks: ["https://youtube.com/watch?v=abc"] });
        (0, vitest_1.expect)(html).toContain("Video Resources");
        (0, vitest_1.expect)(html).toContain('<a href="https://youtube.com/watch?v=abc"');
        (0, vitest_1.expect)(html).toContain('target="_blank"');
    });
    (0, vitest_1.it)("omits the image block when there is no image", () => {
        (0, vitest_1.expect)(render()).not.toContain("<img");
    });
    (0, vitest_1.it)("includes the image when provided", () => {
        const html = render({ imageUrl: "https://example.com/pic.png" });
        (0, vitest_1.expect)(html).toContain('src="https://example.com/pic.png"');
    });
    (0, vitest_1.it)("escapes AI-generated content to prevent XSS", () => {
        const html = render({ plan: { ...PLAN, title: "<script>alert(1)</script>" } });
        (0, vitest_1.expect)(html).not.toContain("<script>alert(1)</script>");
        (0, vitest_1.expect)(html).toContain("&lt;script&gt;");
    });
    (0, vitest_1.it)("shows the total time pill when provided", () => {
        (0, vitest_1.expect)(render({ totalLessonTimeMin: 30 })).toContain("Total time: 30 min");
    });
    (0, vitest_1.it)("omits the total time pill when not provided", () => {
        (0, vitest_1.expect)(render()).not.toContain("Total time:");
    });
    (0, vitest_1.it)("reflects the age range and activity duration", () => {
        const html = render({ ageFrom: 4, ageTo: 7 });
        (0, vitest_1.expect)(html).toContain("Ages 4-7");
        (0, vitest_1.expect)(html).toContain("10 min");
    });
    (0, vitest_1.it)("is standalone with no external dependencies", () => {
        const html = render();
        (0, vitest_1.expect)(html).toContain("<style>");
        (0, vitest_1.expect)(html).not.toContain("<link ");
        (0, vitest_1.expect)(html).not.toContain("<script ");
    });
});
//# sourceMappingURL=renderService.test.js.map