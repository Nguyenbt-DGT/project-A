"use strict";
// Regression suite guarding the edge cases listed in document/BUSINESS_ANALYST.md.
// Re-run this suite before every release alongside the unit suite.
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
vitest_1.vi.mock("../../../backend/src/db.js", () => ({
    prisma: {
        lessonPlan: {
            create: vitest_1.vi.fn(),
            findUnique: vitest_1.vi.fn(),
        },
    },
}));
vitest_1.vi.mock("../../../backend/src/services/aiService.js", async () => {
    const actual = await vitest_1.vi.importActual("../../../backend/src/services/aiService.js");
    return {
        ...actual,
        generateLessonPlan: vitest_1.vi.fn(actual.generateLessonPlan),
    };
});
const { aiConfig, generateLessonPlan, AIGenerationError } = await import("../../../backend/src/services/aiService.js");
const { renderLessonPlanHtml } = await import("../../../backend/src/services/renderService.js");
const { lessonPlanCreateSchema } = await import("../../../backend/src/schemas/lessonPlan.js");
const { createApp } = await import("../../../backend/src/app.js");
const { prisma } = await import("../../../backend/src/db.js");
const actualAiService = await vitest_1.vi.importActual("../../../backend/src/services/aiService.js");
const PLAN = {
    title: "Fruit Colors",
    warm_up: "Say hello",
    concept_explanation: "Fruits have colors",
    activities: [{ name: "Match Game", rule: "Match fruit to color", duration_min: 10 }],
    closing: "Great job everyone",
};
const originalProvider = aiConfig.provider;
(0, vitest_1.afterEach)(() => {
    aiConfig.provider = originalProvider;
    vitest_1.vi.mocked(generateLessonPlan).mockReset();
    vitest_1.vi.mocked(generateLessonPlan).mockImplementation(actualAiService.generateLessonPlan);
    vitest_1.vi.mocked(prisma.lessonPlan.create).mockReset();
});
(0, vitest_1.describe)("BA edge cases", () => {
    (0, vitest_1.it)("omits the Video Resources section when there is no video link", () => {
        const html = renderLessonPlanHtml({
            plan: PLAN,
            ageFrom: 3,
            ageTo: 9,
            totalLessonTimeMin: null,
            videoLinks: [],
            imageUrl: null,
        });
        (0, vitest_1.expect)(html).not.toContain("Video Resources");
    });
    (0, vitest_1.it)("omits the image block when there is no picture", () => {
        const html = renderLessonPlanHtml({
            plan: PLAN,
            ageFrom: 3,
            ageTo: 9,
            totalLessonTimeMin: null,
            videoLinks: [],
            imageUrl: null,
        });
        (0, vitest_1.expect)(html).not.toContain("<img");
    });
    (0, vitest_1.it)("still generates without error when total time is inconsistent with activities x duration", async () => {
        aiConfig.provider = "mock";
        const result = await generateLessonPlan({
            ageFrom: 3,
            ageTo: 9,
            concept: "Numbers",
            numActivities: 5,
            activityDurationMin: 20,
            totalLessonTimeMin: 10,
        });
        (0, vitest_1.expect)(result.activities).toHaveLength(5);
    });
    (0, vitest_1.it)("maps an AI generation failure to 502 with no partial save", async () => {
        vitest_1.vi.mocked(generateLessonPlan).mockRejectedValue(new AIGenerationError("provider timed out"));
        const app = createApp();
        const server = app.listen(0);
        try {
            const { port } = server.address();
            const response = await fetch(`http://127.0.0.1:${port}/api/lesson-plans`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    age_from: 3,
                    age_to: 9,
                    concept: "Colors",
                    num_activities: 2,
                    activity_duration_min: 10,
                }),
            });
            (0, vitest_1.expect)(response.status).toBe(502);
            (0, vitest_1.expect)(prisma.lessonPlan.create).not.toHaveBeenCalled();
        }
        finally {
            server.close();
        }
    });
    vitest_1.it.each([
        [3, 9],
        [5, 5],
        [3, 3],
        [9, 9],
    ])("accepts age range bounds (%d, %d)", (age_from, age_to) => {
        const plan = lessonPlanCreateSchema.parse({
            age_from,
            age_to,
            concept: "Colors",
            num_activities: 1,
            activity_duration_min: 10,
        });
        (0, vitest_1.expect)(plan.age_from).toBe(age_from);
        (0, vitest_1.expect)(plan.age_to).toBe(age_to);
    });
    (0, vitest_1.it)("keeps total_lesson_time_min optional", () => {
        const plan = lessonPlanCreateSchema.parse({
            age_from: 3,
            age_to: 9,
            concept: "Colors",
            num_activities: 1,
            activity_duration_min: 10,
        });
        (0, vitest_1.expect)(plan.total_lesson_time_min ?? null).toBeNull();
    });
});
//# sourceMappingURL=baEdgeCases.test.js.map