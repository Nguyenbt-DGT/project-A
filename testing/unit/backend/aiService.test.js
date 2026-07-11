"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const aiService_js_1 = require("../../../backend/src/services/aiService.js");
const originalProvider = aiService_js_1.aiConfig.provider;
(0, vitest_1.afterEach)(() => {
    aiService_js_1.aiConfig.provider = originalProvider;
});
(0, vitest_1.describe)("generateLessonPlan (mock provider)", () => {
    (0, vitest_1.it)("returns exactly num_activities activities", async () => {
        aiService_js_1.aiConfig.provider = "mock";
        const result = await (0, aiService_js_1.generateLessonPlan)({
            ageFrom: 3,
            ageTo: 9,
            concept: "Colors of fruits",
            numActivities: 4,
            activityDurationMin: 10,
            totalLessonTimeMin: null,
        });
        (0, vitest_1.expect)(result.activities).toHaveLength(4);
        (0, vitest_1.expect)(result.activities.every((activity) => activity.duration_min === 10)).toBe(true);
        for (const key of ["title", "warm_up", "concept_explanation", "closing"]) {
            (0, vitest_1.expect)(result[key]).toBeTruthy();
        }
    });
    (0, vitest_1.it)("mentions pacing when total time is given", async () => {
        aiService_js_1.aiConfig.provider = "mock";
        const result = await (0, aiService_js_1.generateLessonPlan)({
            ageFrom: 3,
            ageTo: 9,
            concept: "Shapes",
            numActivities: 2,
            activityDurationMin: 5,
            totalLessonTimeMin: 20,
        });
        (0, vitest_1.expect)(result.closing).toContain("20-minute");
    });
    (0, vitest_1.it)("omits pacing note when no total time is given", async () => {
        aiService_js_1.aiConfig.provider = "mock";
        const result = await (0, aiService_js_1.generateLessonPlan)({
            ageFrom: 3,
            ageTo: 9,
            concept: "Shapes",
            numActivities: 2,
            activityDurationMin: 5,
            totalLessonTimeMin: null,
        });
        (0, vitest_1.expect)(result.closing).not.toContain("-minute lesson");
    });
    (0, vitest_1.it)("raises for an unsupported provider", async () => {
        aiService_js_1.aiConfig.provider = "bogus";
        await (0, vitest_1.expect)((0, aiService_js_1.generateLessonPlan)({
            ageFrom: 3,
            ageTo: 9,
            concept: "x",
            numActivities: 1,
            activityDurationMin: 5,
            totalLessonTimeMin: null,
        })).rejects.toBeInstanceOf(aiService_js_1.AIGenerationError);
    });
});
(0, vitest_1.describe)("validateShape", () => {
    (0, vitest_1.it)("rejects wrong activity count", () => {
        (0, vitest_1.expect)(() => (0, aiService_js_1.validateShape)({
            title: "t",
            warm_up: "w",
            concept_explanation: "c",
            activities: [{ name: "a", rule: "r", duration_min: 5 }],
            closing: "cl",
        }, 2)).toThrow();
    });
    (0, vitest_1.it)("rejects missing keys", () => {
        (0, vitest_1.expect)(() => (0, aiService_js_1.validateShape)({ title: "t" }, 1)).toThrow();
    });
    (0, vitest_1.it)("accepts a correct payload", () => {
        const data = {
            title: "t",
            warm_up: "w",
            concept_explanation: "c",
            activities: [{ name: "a", rule: "r", duration_min: 5 }],
            closing: "cl",
        };
        (0, vitest_1.expect)(() => (0, aiService_js_1.validateShape)(data, 1)).not.toThrow();
    });
});
//# sourceMappingURL=aiService.test.js.map